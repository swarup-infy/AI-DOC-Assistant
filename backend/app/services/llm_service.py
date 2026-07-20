from __future__ import annotations

import random
import time
from typing import Any

from google import genai
from google.genai import types
from google.genai import errors as genai_errors

from app.core.config import settings
from app.core.logger import logger


class LLMService:
    """
    Service for interacting with Google Gemini.

    Public interface (generate_response) is provider-agnostic by
    design — all Gemini-specific details are isolated below it, so
    swapping providers later only touches this file.
    """

    # Errors worth retrying: rate limits and transient server issues.
    # Anything else (bad request, auth failure) fails fast on purpose.
    _RETRYABLE_STATUS_CODES = {429, 500, 502, 503, 504}
    _MAX_RETRIES = 3
    _BASE_BACKOFF_SECONDS = 1.0
    _JITTER_MAX_SECONDS = 0.5

    # RAG system prompt. Kept as a class constant so LLMService stays
    # focused on orchestration, not prompt text — worth moving to a
    # dedicated prompts module if this grows further.
    _RAG_PROMPT_TEMPLATE = """You are an AI Document Assistant.

Use ONLY the supplied document context.

Instructions:
- Never use outside knowledge.
- Never invent facts.
- If the answer is incomplete, say so.
- If multiple sources disagree, state the disagreement rather than choosing one.
- If the answer cannot be found, reply exactly:

I couldn't find that information in the uploaded documents.

- When the context includes source labels (e.g. Source 1), mention them naturally in your answer.
- Keep answers concise unless the user requests more detail.

------------------------------------------------------------

{context}

------------------------------------------------------------

User Question:
{question}
"""

    def __init__(self) -> None:
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not configured.")

        try:
            self.client = genai.Client(
                api_key=settings.GEMINI_API_KEY
            )
        except Exception:
            logger.exception("Failed to initialize Gemini client.")
            raise

        self.model = getattr(settings, "GEMINI_MODEL", "gemini-3.5-flash")
        logger.info("Initialized Gemini model: %s", self.model)

        temperature = getattr(settings, "GEMINI_TEMPERATURE", 0.3)
        max_output_tokens = getattr(settings, "GEMINI_MAX_OUTPUT_TOKENS", 1024)
        top_p = getattr(settings, "GEMINI_TOP_P", 0.95)

        # Fail fast on misconfiguration at startup rather than at the
        # first request.
        if not 0 <= temperature <= 2:
            raise ValueError("GEMINI_TEMPERATURE must be between 0 and 2.")

        if not 0 <= top_p <= 1:
            raise ValueError("GEMINI_TOP_P must be between 0 and 1.")

        if not isinstance(max_output_tokens, int) or max_output_tokens <= 0:
            raise ValueError("GEMINI_MAX_OUTPUT_TOKENS must be a positive integer.")

        self.generation_config = types.GenerateContentConfig(
            temperature=temperature,
            max_output_tokens=max_output_tokens,
            top_p=top_p,
        )

    # -------------------------------------------------------
    # Public API
    # -------------------------------------------------------

    def generate_response(
        self,
        question: str,
        context: str = "",
    ) -> str:
        """
        Generate an AI response.

        If context is empty:
            -> Normal Gemini Chat

        If context exists:
            -> Document/RAG Chat
        """

        if not question or not question.strip():
            return "Please enter a question."

        if not context.strip():
            return self._chat(question)

        return self._rag_chat(question, context)

    # -------------------------------------------------------
    # Modes
    # -------------------------------------------------------

    def _chat(self, question: str) -> str:
        logger.info("Generating chat response (no context).")
        return self._generate(question)

    def _rag_chat(self, question: str, context: str) -> str:
        logger.info("Generating RAG response with document context.")
        prompt = self._build_rag_prompt(question, context)
        return self._generate(prompt)

    # -------------------------------------------------------
    # Prompt building
    # -------------------------------------------------------

    def _build_rag_prompt(self, question: str, context: str) -> str:
        return self._RAG_PROMPT_TEMPLATE.format(
            context=context,
            question=question,
        )

    # -------------------------------------------------------
    # Generation + retry
    # -------------------------------------------------------

    def _generate(self, contents: str) -> str:
        """
        Call Gemini with a narrow retry policy: only retry on
        transient errors (rate limits, 5xx), with exponential
        backoff plus jitter. Non-transient errors (bad request,
        auth) fail immediately rather than wasting time retrying
        something that can't succeed.
        """

        last_exception: Exception | None = None

        for attempt in range(1, self._MAX_RETRIES + 1):
            try:
                response = self.client.models.generate_content(
                    model=self.model,
                    contents=contents,
                    config=self.generation_config,
                )

                return self._extract_response(response)

            except genai_errors.APIError as exc:
                last_exception = exc
                status_code = getattr(exc, "code", None)

                if status_code not in self._RETRYABLE_STATUS_CODES:
                    logger.exception(
                        "Non-retryable Gemini API error (status=%s).",
                        status_code,
                    )
                    raise

                if attempt == self._MAX_RETRIES:
                    logger.exception(
                        "Gemini API error persisted after %d attempts.",
                        attempt,
                    )
                    raise

                backoff = self._BASE_BACKOFF_SECONDS * (2 ** (attempt - 1))
                backoff += random.uniform(0, self._JITTER_MAX_SECONDS)

                logger.warning(
                    "Transient Gemini error (status=%s) on attempt %d/%d. "
                    "Retrying in %.2fs.",
                    status_code,
                    attempt,
                    self._MAX_RETRIES,
                    backoff,
                )
                time.sleep(backoff)

            except Exception:
                logger.exception("Unexpected error during Gemini generation.")
                raise

        if last_exception:
            raise last_exception
        raise RuntimeError("Gemini generation failed for an unknown reason.")

    def _extract_response(self, response: Any) -> str:
        """
        Centralized response parsing. If the SDK's response shape
        changes later, this is the only place that needs updating.
        """

        try:
            text = response.text
        except Exception:
            logger.warning(
                "Could not extract text from Gemini response "
                "(possibly blocked by safety filters or no candidates)."
            )
            return (
                "I wasn't able to generate a response to that. "
                "Please try rephrasing your question."
            )

        if not text:
            logger.warning("Gemini returned an empty response.")
            return (
                "I wasn't able to generate a response to that. "
                "Please try rephrasing your question."
            )

        return text