from __future__ import annotations

import random
import threading
import time
from abc import ABC, abstractmethod
from typing import Any

from groq import (
    APIConnectionError,
    APIStatusError,
    Groq,
    RateLimitError,
)

from app.core.config import settings
from app.core.logger import logger


class BaseLLMProvider(ABC):
    """
    Abstract base class for all LLM providers.

    Every future provider (OpenAI, Gemini, Ollama, etc.)
    should implement this interface.
    """

    @abstractmethod
    def generate(
        self,
        messages: list[dict[str, str]],
    ) -> str:
        """
        Generate a response from the LLM.
        """
        raise NotImplementedError


class GroqProvider(BaseLLMProvider):
    """
    Production-ready Groq provider.
    """

    RETRYABLE_STATUS_CODES = {
        429,
        500,
        502,
        503,
        504,
    }

    def __init__(self) -> None:

        if not settings.GROQ_API_KEY:
            raise ValueError(
                "GROQ_API_KEY is missing."
            )

        self.client = Groq(
            api_key=settings.GROQ_API_KEY
        )

        self.model = settings.GROQ_MODEL
        self.temperature = settings.GROQ_TEMPERATURE
        self.max_tokens = settings.GROQ_MAX_OUTPUT_TOKENS
        self.top_p = settings.GROQ_TOP_P

        if not 0 <= self.temperature <= 2:
            raise ValueError(
                "Invalid GROQ_TEMPERATURE."
            )

        if not 0 <= self.top_p <= 1:
            raise ValueError(
                "Invalid GROQ_TOP_P."
            )

        if self.max_tokens <= 0:
            raise ValueError(
                "GROQ_MAX_OUTPUT_TOKENS must be positive."
            )

        self.max_retries = 3
        self.base_backoff = 1.0
        self.max_jitter = 0.5

        logger.info(
            "Groq provider initialized using model '%s'.",
            self.model,
        )

    def generate(
        self,
        messages: list[dict[str, str]],
    ) -> str:

        last_exception: Exception | None = None

        for attempt in range(
            1,
            self.max_retries + 1,
        ):

            try:

                response = (
                    self.client.chat.completions.create(
                        model=self.model,
                        messages=messages,
                        temperature=self.temperature,
                        max_tokens=self.max_tokens,
                        top_p=self.top_p,
                    )
                )

                return self._extract_response(
                    response
                )

            except RateLimitError as exc:

                last_exception = exc

                logger.warning(
                    "Groq rate limit reached."
                )

            except APIConnectionError as exc:

                last_exception = exc

                logger.warning(
                    "Groq connection failed."
                )

            except APIStatusError as exc:

                last_exception = exc

                if (
                    exc.status_code
                    not in self.RETRYABLE_STATUS_CODES
                ):
                    logger.exception(
                        "Non-retryable Groq API error."
                    )
                    raise

            except Exception as exc:

                logger.exception(
                    "Unexpected Groq error."
                )

                raise exc

            if attempt == self.max_retries:
                if last_exception is not None:
                    raise last_exception
                raise RuntimeError(
                    "Groq request failed after all retries."
                )

            wait = (
                self.base_backoff
                * (2 ** (attempt - 1))
                + random.uniform(
                    0,
                    self.max_jitter,
                )
            )

            logger.warning(
                "Retrying in %.2f seconds...",
                wait,
            )

            time.sleep(wait)

        raise RuntimeError(
            "Groq request failed."
        )

    @staticmethod
    def _extract_response(
        response: Any,
    ) -> str:
        """
        Extract text safely from Groq response.
        """

        try:

            text = (
                response
                .choices[0]
                .message
                .content
            )

            if not text:
                raise ValueError(
                    "Empty response."
                )

            return text.strip()

        except Exception:

            logger.exception(
                "Failed parsing Groq response."
            )

            return (
                "I wasn't able to generate a response."
            )


class LLMService:
    """
    High-level service used by the rest
    of the application.

    The application should never interact
    with Groq/OpenAI directly.

    It should only call LLMService.
    """

    _instance: "LLMService | None" = None
    _lock = threading.Lock()

    SYSTEM_PROMPT = """
You are an AI Document Assistant.

You must answer professionally.

Never invent facts.

Never use outside knowledge when
document context is provided.

If the answer is missing,
say exactly:

I couldn't find that information
in the uploaded documents.

Keep answers clear and concise.
"""

    RAG_TEMPLATE = """
=========================
DOCUMENT CONTEXT
=========================

{context}

=========================
QUESTION
=========================

{question}

=========================
ANSWER
=========================
"""

    def __new__(cls) -> "LLMService":
        """
        Thread-safe singleton implementation.
        """

        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)

        return cls._instance

    def __init__(self) -> None:

        if getattr(self, "_initialized", False):
            return

        provider_name = settings.LLM_PROVIDER.lower()

        providers: dict[str, type[BaseLLMProvider]] = {
            "groq": GroqProvider,
        }

        if provider_name not in providers:
            raise ValueError(
                f"Unsupported LLM provider: {provider_name}"
            )

        self.provider = providers[
            provider_name
        ]()

        self._initialized = True

        logger.info(
            "LLMService initialized using '%s'.",
            provider_name,
        )

    @staticmethod
    def _build_system_message() -> dict[str, str]:
        """
        Build the system prompt.
        """

        return {
            "role": "system",
            "content": LLMService.SYSTEM_PROMPT.strip(),
        }

    @staticmethod
    def _build_user_message(
        prompt: str,
    ) -> dict[str, str]:

        return {
            "role": "user",
            "content": prompt.strip(),
        }

    @classmethod
    def _build_rag_prompt(
        cls,
        question: str,
        context: str,
    ) -> str:
        """
        Build the RAG prompt.
        """

        return cls.RAG_TEMPLATE.format(
            context=context.strip(),
            question=question.strip(),
        )

    def generate_response(
        self,
        question: str,
        context: str = "",
    ) -> str:
        """
        Main public API used by the application.
        """

        question = question.strip()

        if not question:
            return "Please enter a question."

        if context.strip():
            return self._rag_chat(
                question,
                context,
            )

        return self._chat(question)

    def _chat(
        self,
        question: str,
    ) -> str:
        """
        Normal chat mode.
        """

        logger.info(
            "Running normal chat."
        )

        messages = [
            self._build_system_message(),
            self._build_user_message(
                question,
            ),
        ]

        return self.provider.generate(
            messages,
        )

    def _rag_chat(
        self,
        question: str,
        context: str,
    ) -> str:
        """
        Retrieval-Augmented Generation.
        """

        logger.info(
            "Running RAG chat."
        )

        rag_prompt = (
            self._build_rag_prompt(
                question,
                context,
            )
        )

        messages = [
            self._build_system_message(),
            self._build_user_message(
                rag_prompt,
            ),
        ]

        return self.provider.generate(
            messages,
        )

    def health_check(self) -> bool:
        """
        Verify that the configured provider is reachable.
        """

        logger.info("Running LLM health check.")

        try:
            self.provider.generate(
                [
                    self._build_system_message(),
                    self._build_user_message("Reply with the word OK."),
                ]
            )
            return True

        except Exception:
            logger.exception(
                "LLM health check failed."
            )
            return False

    def get_provider_name(self) -> str:
        """
        Return the configured provider name.
        """

        return settings.LLM_PROVIDER.lower()

    def get_model_name(self) -> str:
        """
        Return the active model.
        """

        return settings.GROQ_MODEL

    def reload(self) -> None:
        """
        Reload the underlying provider.
        Useful after configuration changes.
        """

        logger.info("Reloading LLM provider.")

        provider_name = settings.LLM_PROVIDER.lower()

        providers: dict[str, type[BaseLLMProvider]] = {
            "groq": GroqProvider,
        }

        if provider_name not in providers:
            raise ValueError(
                f"Unsupported LLM provider: {provider_name}"
            )

        self.provider = providers[provider_name]()

    def supports_streaming(self) -> bool:
        """
        Placeholder for future streaming support.
        """

        return False

    def available_providers(self) -> list[str]:
        """
        Return supported providers.
        """

        return [
            "groq",
        ]

    def warmup(self) -> None:
        """
        Warm up the model by sending a lightweight request.
        """

        logger.info("Warming up LLM.")

        try:
            self.provider.generate(
                [
                    self._build_system_message(),
                    self._build_user_message("Hello"),
                ]
            )
        except Exception:
            logger.warning(
                "LLM warmup failed."
            )

    def __repr__(self) -> str:
        return (
            f"{self.__class__.__name__}("
            f"provider={self.get_provider_name()}, "
            f"model={self.get_model_name()})"
        )

    def close(self) -> None:
        """
        Release resources held by the provider.

        The Groq SDK currently does not require explicit cleanup,
        but this method exists so future providers (OpenAI, Ollama,
        etc.) can implement their own cleanup logic.
        """

        logger.info(
            "Closing LLM service."
        )

        client = getattr(
            self.provider,
            "client",
            None,
        )

        if client is None:
            return

        close_method = getattr(
            client,
            "close",
            None,
        )

        if callable(close_method):
            try:
                close_method()
            except Exception:
                logger.exception(
                    "Error while closing LLM client."
                )

    def reset(self) -> None:
        """
        Reset the singleton instance.

        Mainly useful during testing.
        """

        logger.info(
            "Resetting LLM service."
        )

        self.close()

        with self._lock:
            type(self)._instance = None
            self._initialized = False


def get_llm_service() -> LLMService:
    """
    Dependency helper for FastAPI.

    Example:

        llm = get_llm_service()

    or

        Depends(get_llm_service)
    """

    return LLMService()