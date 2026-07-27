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


# ==========================================================
# Base Provider
# ==========================================================


class BaseLLMProvider(ABC):
    """
    Common interface for all LLM providers.

    Application code communicates with this abstraction instead
    of depending directly on a provider-specific SDK.
    """

    @abstractmethod
    def generate(
        self,
        messages: list[dict[str, str]],
    ) -> str:
        """
        Generate a text response from chat messages.
        """

        raise NotImplementedError

    def close(self) -> None:
        """
        Release resources owned by the provider.

        Providers that require cleanup may override this method.
        """


# ==========================================================
# Groq Provider
# ==========================================================


class GroqProvider(BaseLLMProvider):
    """
    Groq implementation of the LLM provider interface.
    """

    RETRYABLE_STATUS_CODES = {
        429,
        500,
        502,
        503,
        504,
    }

    MAX_RETRIES = 3
    BASE_BACKOFF_SECONDS = 1.0
    MAX_JITTER_SECONDS = 0.5

    def __init__(self) -> None:
        """
        Initialize the Groq client from application settings.
        """

        api_key = (
            settings.GROQ_API_KEY
            .get_secret_value()
            .strip()
        )

        if not api_key:
            raise ValueError(
                "GROQ_API_KEY is missing or empty."
            )

        self.model = (
            settings.GROQ_MODEL.strip()
        )

        if not self.model:
            raise ValueError(
                "GROQ_MODEL is missing or empty."
            )

        self.temperature = (
            settings.GROQ_TEMPERATURE
        )

        self.max_tokens = (
            settings.GROQ_MAX_OUTPUT_TOKENS
        )

        self.top_p = (
            settings.GROQ_TOP_P
        )

        self.client = Groq(
            api_key=api_key,
        )

        logger.info(
            "Groq provider initialized. model=%s.",
            self.model,
        )

    def generate(
        self,
        messages: list[dict[str, str]],
    ) -> str:
        """
        Generate a Groq response with retry and exponential backoff.
        """

        if not messages:
            raise ValueError(
                "At least one message is required."
            )

        last_exception: Exception | None = None

        for attempt in range(
            1,
            self.MAX_RETRIES + 1,
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
                    "Groq rate limit reached. "
                    "attempt=%d/%d.",
                    attempt,
                    self.MAX_RETRIES,
                )

            except APIConnectionError as exc:
                last_exception = exc

                logger.warning(
                    "Groq connection failed. "
                    "attempt=%d/%d.",
                    attempt,
                    self.MAX_RETRIES,
                )

            except APIStatusError as exc:
                last_exception = exc

                if (
                    exc.status_code
                    not in self.RETRYABLE_STATUS_CODES
                ):
                    logger.error(
                        "Non-retryable Groq API error. "
                        "status_code=%s.",
                        exc.status_code,
                    )
                    raise

                logger.warning(
                    "Retryable Groq API error. "
                    "status_code=%s attempt=%d/%d.",
                    exc.status_code,
                    attempt,
                    self.MAX_RETRIES,
                )

            except Exception:
                logger.exception(
                    "Unexpected error while calling Groq."
                )
                raise

            if attempt >= self.MAX_RETRIES:
                break

            wait_seconds = (
                self.BASE_BACKOFF_SECONDS
                * (2 ** (attempt - 1))
                + random.uniform(
                    0.0,
                    self.MAX_JITTER_SECONDS,
                )
            )

            logger.warning(
                "Retrying Groq request in %.2f seconds.",
                wait_seconds,
            )

            time.sleep(
                wait_seconds
            )

        if last_exception is not None:
            logger.error(
                "Groq request failed after %d attempts.",
                self.MAX_RETRIES,
            )

            raise last_exception

        raise RuntimeError(
            "Groq request failed without a captured exception."
        )

    @staticmethod
    def _extract_response(
        response: Any,
    ) -> str:
        """
        Extract and validate text from a Groq response.
        """

        choices = getattr(
            response,
            "choices",
            None,
        )

        if not choices:
            raise RuntimeError(
                "Groq returned no response choices."
            )

        message = getattr(
            choices[0],
            "message",
            None,
        )

        if message is None:
            raise RuntimeError(
                "Groq returned a choice without a message."
            )

        content = getattr(
            message,
            "content",
            None,
        )

        if not isinstance(
            content,
            str,
        ):
            raise RuntimeError(
                "Groq returned invalid response content."
            )

        content = content.strip()

        if not content:
            raise RuntimeError(
                "Groq returned an empty response."
            )

        return content

    def close(self) -> None:
        """
        Close the Groq client when supported by the SDK.
        """

        close_method = getattr(
            self.client,
            "close",
            None,
        )

        if callable(close_method):
            close_method()


# ==========================================================
# LLM Service
# ==========================================================


class LLMService:
    """
    High-level LLM service.

    Supports:

    - General LLM conversations.
    - Document-grounded RAG conversations.
    - Provider abstraction.
    - Shared provider instance.
    - Provider health checks.
    """

    _instance: LLMService | None = None
    _instance_lock = threading.Lock()

    # ======================================================
    # General Chat Prompt
    # ======================================================

    GENERAL_SYSTEM_PROMPT = """
You are a helpful AI assistant.

Follow these rules:

1. Answer the user's question clearly and accurately.
2. Be concise unless the question requires additional detail.
3. Use your general knowledge when answering.
4. Never claim that uploaded documents were searched unless document context
   was explicitly provided.
5. If you are uncertain about something, clearly communicate that uncertainty.
6. Never invent sources, quotations, statistics, or factual details.
""".strip()

    # ======================================================
    # RAG System Prompt
    # ======================================================

    RAG_SYSTEM_PROMPT = """
You are an AI Document Assistant.

Your task is to answer questions using retrieved evidence from the user's
uploaded documents.

Follow these rules:

1. Use only the retrieved document evidence as the factual basis for the answer.
2. Do not use outside knowledge to fill gaps in the document evidence.
3. Never invent information that is not supported by the retrieved evidence.
4. Preserve important names, values, terminology, and technical details.
5. Previous conversation may be provided for conversational continuity, but
   it must not be treated as document evidence.
6. If the retrieved document evidence does not contain enough information to
   answer the question, respond exactly with:

I couldn't find that information in the uploaded documents.
""".strip()

    # ======================================================
    # RAG User Template
    # ======================================================

    RAG_TEMPLATE = """
{context}

USER QUESTION
=============
{question}

TASK
====
Answer the user's question using only the RETRIEVED DOCUMENT EVIDENCE
provided above.

PREVIOUS CONVERSATION, if present, may only be used to understand
conversational references. It is not factual document evidence.

If the retrieved document evidence does not contain enough information
to answer the question, respond exactly with:

I couldn't find that information in the uploaded documents.
""".strip()

    # ======================================================
    # Providers
    # ======================================================

    PROVIDERS: dict[
        str,
        type[BaseLLMProvider],
    ] = {
        "groq": GroqProvider,
    }

    # ======================================================
    # Singleton
    # ======================================================

    def __new__(
        cls,
    ) -> LLMService:
        """
        Return the thread-safe singleton service instance.
        """

        if cls._instance is None:
            with cls._instance_lock:
                if cls._instance is None:
                    cls._instance = (
                        super().__new__(cls)
                    )

        return cls._instance

    def __init__(
        self,
    ) -> None:
        """
        Initialize the configured provider once.
        """

        if getattr(
            self,
            "_initialized",
            False,
        ):
            return

        self.provider_name = (
            settings.LLM_PROVIDER
            .lower()
            .strip()
        )

        self.provider = (
            self._create_provider(
                self.provider_name
            )
        )

        self._initialized = True

        logger.info(
            "LLMService initialized. provider=%s.",
            self.provider_name,
        )

    # ======================================================
    # Provider Creation
    # ======================================================

    @classmethod
    def _create_provider(
        cls,
        provider_name: str,
    ) -> BaseLLMProvider:
        """
        Create the configured LLM provider.
        """

        provider_class = (
            cls.PROVIDERS.get(
                provider_name
            )
        )

        if provider_class is None:
            supported = ", ".join(
                sorted(
                    cls.PROVIDERS
                )
            )

            raise ValueError(
                f"Unsupported LLM provider: "
                f"{provider_name}. "
                f"Supported providers: {supported}."
            )

        return provider_class()

    # ======================================================
    # Message Builders
    # ======================================================

    @staticmethod
    def _build_system_message(
        prompt: str,
    ) -> dict[str, str]:
        """
        Build a system message.
        """

        prompt = prompt.strip()

        if not prompt:
            raise ValueError(
                "System prompt cannot be empty."
            )

        return {
            "role": "system",
            "content": prompt,
        }

    @staticmethod
    def _build_user_message(
        prompt: str,
    ) -> dict[str, str]:
        """
        Build a user message.
        """

        prompt = prompt.strip()

        if not prompt:
            raise ValueError(
                "Prompt cannot be empty."
            )

        return {
            "role": "user",
            "content": prompt,
        }

    # ======================================================
    # RAG Prompt Builder
    # ======================================================

    @classmethod
    def _build_rag_prompt(
        cls,
        question: str,
        context: str,
    ) -> str:
        """
        Build the document-grounded RAG user prompt.
        """

        question = question.strip()
        context = context.strip()

        if not question:
            raise ValueError(
                "Question cannot be empty."
            )

        if not context:
            raise ValueError(
                "RAG context cannot be empty."
            )

        return cls.RAG_TEMPLATE.format(
            context=context,
            question=question,
        )

    # ======================================================
    # Public Generation API
    # ======================================================

    def generate_response(
        self,
        question: str,
        context: str = "",
    ) -> str:
        """
        Generate a response.

        When context is present:
            Run document-grounded RAG.

        When context is absent:
            Run normal general-purpose Groq chat.
        """

        question = question.strip()

        if not question:
            raise ValueError(
                "Question cannot be empty."
            )

        context = context.strip()

        if context:
            return self._rag_chat(
                question=question,
                context=context,
            )

        return self._chat(
            question=question,
        )

    # ======================================================
    # General Chat
    # ======================================================

    def _chat(
        self,
        question: str,
    ) -> str:
        """
        Generate a normal general-knowledge LLM response.
        """

        logger.info(
            "Generating general LLM response. "
            "provider=%s.",
            self.provider_name,
        )

        messages = [
            self._build_system_message(
                self.GENERAL_SYSTEM_PROMPT
            ),
            self._build_user_message(
                question
            ),
        ]

        return self.provider.generate(
            messages
        )

    # ======================================================
    # RAG Chat
    # ======================================================

    def _rag_chat(
        self,
        question: str,
        context: str,
    ) -> str:
        """
        Generate a document-grounded response.
        """

        logger.info(
            "Generating RAG response. "
            "provider=%s.",
            self.provider_name,
        )

        prompt = (
            self._build_rag_prompt(
                question=question,
                context=context,
            )
        )

        messages = [
            self._build_system_message(
                self.RAG_SYSTEM_PROMPT
            ),
            self._build_user_message(
                prompt
            ),
        ]

        return self.provider.generate(
            messages
        )

    # ======================================================
    # Health Check
    # ======================================================

    def health_check(
        self,
    ) -> bool:
        """
        Check whether the configured provider can respond.
        """

        logger.info(
            "Running LLM provider health check."
        )

        try:
            response = (
                self.provider.generate(
                    [
                        self._build_system_message(
                            (
                                "You are performing a health "
                                "check. Follow the user's "
                                "instruction exactly."
                            )
                        ),
                        self._build_user_message(
                            "Reply with exactly: OK"
                        ),
                    ]
                )
            )

            healthy = (
                response.strip().upper()
                == "OK"
            )

            if not healthy:
                logger.warning(
                    "LLM health check returned "
                    "an unexpected response."
                )

            return healthy

        except Exception:
            logger.exception(
                "LLM provider health check failed."
            )

            return False

    # ======================================================
    # Provider Information
    # ======================================================

    def get_provider_name(
        self,
    ) -> str:
        """
        Return the active provider name.
        """

        return self.provider_name

    def get_model_name(
        self,
    ) -> str:
        """
        Return the active model name.
        """

        if isinstance(
            self.provider,
            GroqProvider,
        ):
            return self.provider.model

        return "unknown"

    def available_providers(
        self,
    ) -> list[str]:
        """
        Return supported provider names.
        """

        return sorted(
            self.PROVIDERS.keys()
        )

    def supports_streaming(
        self,
    ) -> bool:
        """
        Return whether streaming is currently exposed.
        """

        return False

    # ======================================================
    # Reload
    # ======================================================

    def reload(
        self,
    ) -> None:
        """
        Recreate the configured provider.
        """

        logger.info(
            "Reloading LLM provider."
        )

        old_provider = (
            self.provider
        )

        provider_name = (
            settings.LLM_PROVIDER
            .lower()
            .strip()
        )

        new_provider = (
            self._create_provider(
                provider_name
            )
        )

        self.provider = (
            new_provider
        )

        self.provider_name = (
            provider_name
        )

        try:
            old_provider.close()

        except Exception:
            logger.exception(
                "Failed to close previous LLM provider."
            )

        logger.info(
            "LLM provider reloaded successfully. "
            "provider=%s.",
            provider_name,
        )

    # ======================================================
    # Warmup
    # ======================================================

    def warmup(
        self,
    ) -> bool:
        """
        Send a lightweight request to initialize provider resources.
        """

        logger.info(
            "Warming up LLM provider."
        )

        try:
            response = (
                self.provider.generate(
                    [
                        self._build_system_message(
                            (
                                "You are performing a service "
                                "warmup. Follow the user's "
                                "instruction exactly."
                            )
                        ),
                        self._build_user_message(
                            "Reply with exactly: OK"
                        ),
                    ]
                )
            )

            success = (
                response.strip().upper()
                == "OK"
            )

            if success:
                logger.info(
                    "LLM provider warmup completed."
                )
            else:
                logger.warning(
                    "LLM provider warmup returned "
                    "an unexpected response."
                )

            return success

        except Exception:
            logger.exception(
                "LLM provider warmup failed."
            )

            return False

    # ======================================================
    # Cleanup
    # ======================================================

    def close(
        self,
    ) -> None:
        """
        Release resources held by the active provider.
        """

        logger.info(
            "Closing LLM service."
        )

        try:
            self.provider.close()

        except Exception:
            logger.exception(
                "Failed to close LLM provider."
            )

    # ======================================================
    # Reset
    # ======================================================

    @classmethod
    def reset(
        cls,
    ) -> None:
        """
        Reset the singleton.

        Intended primarily for tests.
        """

        with cls._instance_lock:
            instance = cls._instance

            if instance is not None:
                instance.close()

            cls._instance = None

        logger.info(
            "LLM service singleton reset."
        )

    # ======================================================
    # Representation
    # ======================================================

    def __repr__(
        self,
    ) -> str:
        return (
            f"{self.__class__.__name__}("
            f"provider={self.get_provider_name()!r}, "
            f"model={self.get_model_name()!r}"
            f")"
        )


# ==========================================================
# FastAPI Dependency
# ==========================================================


def get_llm_service() -> LLMService:
    """
    Return the shared LLM service.
    """

    return LLMService()