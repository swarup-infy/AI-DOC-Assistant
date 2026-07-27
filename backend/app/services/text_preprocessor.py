from __future__ import annotations

import re

from app.core.logger import logger


def clean_text(
    text: str,
) -> str:
    """
    Clean extracted document text while preserving semantic information.

    The cleaner:
    - Normalizes line endings.
    - Removes null characters.
    - Normalizes spaces and tabs.
    - Removes unnecessary whitespace around line breaks.
    - Limits excessive blank lines.
    - Preserves punctuation, capitalization, numbers, symbols,
      Unicode characters, and paragraph boundaries.

    This behavior is suitable for document embeddings and RAG because
    meaningful document content is not aggressively removed.
    """

    if not isinstance(text, str):
        raise TypeError(
            "text must be a string."
        )

    if not text:
        return ""

    original_length = len(text)

    # Normalize Windows and old Mac line endings.
    text = text.replace(
        "\r\n",
        "\n",
    ).replace(
        "\r",
        "\n",
    )

    # Null bytes can appear in malformed/extracted documents and may
    # cause problems in downstream processing.
    text = text.replace(
        "\x00",
        "",
    )

    # Normalize non-breaking spaces commonly found in PDFs/DOCX files.
    text = text.replace(
        "\u00a0",
        " ",
    )

    # Collapse horizontal whitespace while preserving line breaks.
    text = re.sub(
        r"[^\S\n]+",
        " ",
        text,
    )

    # Remove spaces surrounding line breaks.
    text = re.sub(
        r" *\n *",
        "\n",
        text,
    )

    # Prevent excessive blank lines while preserving paragraphs.
    text = re.sub(
        r"\n{3,}",
        "\n\n",
        text,
    )

    cleaned_text = text.strip()

    logger.debug(
        "Text cleaning completed. "
        "original_characters=%d cleaned_characters=%d.",
        original_length,
        len(cleaned_text),
    )

    return cleaned_text