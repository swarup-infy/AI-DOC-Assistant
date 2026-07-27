from __future__ import annotations

import re

from app.core.logger import logger


DEFAULT_CHUNK_SIZE = 1000
DEFAULT_CHUNK_OVERLAP = 150


def chunk_text(
    text: str,
    chunk_size: int = DEFAULT_CHUNK_SIZE,
    chunk_overlap: int = DEFAULT_CHUNK_OVERLAP,
) -> list[str]:
    """
    Split text into overlapping chunks while attempting to preserve
    natural text boundaries.

    The chunker prefers paragraph, sentence, and whitespace boundaries
    instead of blindly cutting text at an exact character position.

    Args:
        text:
            Text to split.

        chunk_size:
            Maximum target size of each chunk in characters.

        chunk_overlap:
            Number of characters to retain between consecutive chunks.

    Returns:
        A list of non-empty text chunks.
    """

    if not isinstance(text, str):
        raise TypeError(
            "text must be a string."
        )

    if chunk_size <= 0:
        raise ValueError(
            "chunk_size must be greater than zero."
        )

    if chunk_overlap < 0:
        raise ValueError(
            "chunk_overlap cannot be negative."
        )

    if chunk_overlap >= chunk_size:
        raise ValueError(
            "chunk_overlap must be smaller than chunk_size."
        )

    normalized_text = _normalize_text(text)

    if not normalized_text:
        return []

    if len(normalized_text) <= chunk_size:
        return [normalized_text]

    chunks: list[str] = []
    start = 0
    text_length = len(normalized_text)

    while start < text_length:
        target_end = min(
            start + chunk_size,
            text_length,
        )

        if target_end >= text_length:
            chunk = normalized_text[start:].strip()

            if chunk:
                chunks.append(chunk)

            break

        end = _find_split_position(
            text=normalized_text,
            start=start,
            target_end=target_end,
        )

        if end <= start:
            end = target_end

        chunk = normalized_text[
            start:end
        ].strip()

        if chunk:
            chunks.append(chunk)

        next_start = max(
            end - chunk_overlap,
            start + 1,
        )

        next_start = _move_to_word_boundary(
            text=normalized_text,
            position=next_start,
            upper_bound=end,
        )

        if next_start <= start:
            next_start = end

        start = next_start

    logger.debug(
        "Text chunking completed. "
        "characters=%d chunks=%d chunk_size=%d overlap=%d.",
        text_length,
        len(chunks),
        chunk_size,
        chunk_overlap,
    )

    return chunks


def _normalize_text(
    text: str,
) -> str:
    """
    Normalize whitespace while preserving paragraph boundaries.
    """

    text = text.replace(
        "\r\n",
        "\n",
    ).replace(
        "\r",
        "\n",
    )

    text = re.sub(
        r"[ \t]+",
        " ",
        text,
    )

    text = re.sub(
        r" *\n *",
        "\n",
        text,
    )

    text = re.sub(
        r"\n{3,}",
        "\n\n",
        text,
    )

    return text.strip()


def _find_split_position(
    text: str,
    start: int,
    target_end: int,
) -> int:
    """
    Find a natural split position near the target chunk boundary.

    Preference:
    1. Paragraph boundary
    2. Sentence boundary
    3. Newline
    4. Whitespace
    5. Exact target position
    """

    search_start = start + (
        (target_end - start) // 2
    )

    boundaries = (
        "\n\n",
        ". ",
        "? ",
        "! ",
        "\n",
        " ",
    )

    for boundary in boundaries:
        position = text.rfind(
            boundary,
            search_start,
            target_end,
        )

        if position != -1:
            return position + len(
                boundary
            )

    return target_end


def _move_to_word_boundary(
    text: str,
    position: int,
    upper_bound: int,
) -> int:
    """
    Move an overlap starting position forward to a word boundary.
    """

    if position <= 0:
        return 0

    if position >= len(text):
        return len(text)

    if text[position - 1].isspace():
        return position

    boundary = text.find(
        " ",
        position,
        upper_bound,
    )

    if boundary == -1:
        return position

    return boundary + 1