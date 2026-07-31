from __future__ import annotations

import re

from app.core.config import settings
from app.core.logger import logger


def chunk_text(
    text: str,
    chunk_size: int | None = None,
    chunk_overlap: int | None = None,
) -> list[str]:
    """
    Split text into overlapping chunks while preserving natural
    text boundaries where possible.

    When chunk_size or chunk_overlap is not explicitly supplied,
    the application configuration is used.

    Boundary preference:
    1. Paragraph boundary
    2. Sentence boundary
    3. Line boundary
    4. Whitespace
    5. Exact character position
    """

    if not isinstance(text, str):
        raise TypeError(
            "text must be a string."
        )

    resolved_chunk_size = (
        settings.CHUNK_SIZE
        if chunk_size is None
        else chunk_size
    )

    resolved_chunk_overlap = (
        settings.CHUNK_OVERLAP
        if chunk_overlap is None
        else chunk_overlap
    )

    if (
        isinstance(resolved_chunk_size, bool)
        or not isinstance(resolved_chunk_size, int)
    ):
        raise TypeError(
            "chunk_size must be an integer."
        )

    if (
        isinstance(resolved_chunk_overlap, bool)
        or not isinstance(resolved_chunk_overlap, int)
    ):
        raise TypeError(
            "chunk_overlap must be an integer."
        )

    if resolved_chunk_size <= 0:
        raise ValueError(
            "chunk_size must be greater than zero."
        )

    if resolved_chunk_overlap < 0:
        raise ValueError(
            "chunk_overlap cannot be negative."
        )

    if resolved_chunk_overlap >= resolved_chunk_size:
        raise ValueError(
            "chunk_overlap must be smaller than chunk_size."
        )

    normalized_text = _normalize_text(
        text
    )

    if not normalized_text:
        return []

    if len(normalized_text) <= resolved_chunk_size:
        return [
            normalized_text
        ]

    chunks: list[str] = []

    start = 0
    text_length = len(normalized_text)

    while start < text_length:
        target_end = min(
            start + resolved_chunk_size,
            text_length,
        )

        if target_end >= text_length:
            chunk = normalized_text[
                start:
            ].strip()

            if chunk:
                chunks.append(
                    chunk
                )

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
            chunks.append(
                chunk
            )

        next_start = max(
            end - resolved_chunk_overlap,
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
        resolved_chunk_size,
        resolved_chunk_overlap,
    )

    return chunks


def _normalize_text(
    text: str,
) -> str:
    """
    Normalize whitespace while preserving paragraph boundaries.

    The main preprocessing layer normally performs equivalent
    normalization before chunking. Keeping lightweight normalization
    here makes chunk_text safe for independent use as well.
    """

    text = text.replace(
        "\r\n",
        "\n",
    ).replace(
        "\r",
        "\n",
    )

    text = text.replace(
        "\x00",
        "",
    )

    text = text.replace(
        "\u00a0",
        " ",
    )

    text = re.sub(
        r"[^\S\n]+",
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
    Find a natural split position near the target boundary.

    Only the latter half of the target chunk is searched so chunks
    do not become unnecessarily small.
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
            return (
                position
                + len(boundary)
            )

    return target_end


def _move_to_word_boundary(
    text: str,
    position: int,
    upper_bound: int,
) -> int:
    """
    Move an overlap start forward to the nearest word boundary.

    The position never moves beyond the end of the preceding chunk.
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