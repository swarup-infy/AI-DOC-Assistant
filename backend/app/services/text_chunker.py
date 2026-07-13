from typing import List


def chunk_text(text: str, chunk_size: int = 500) -> List[str]:
    """
    Split text into fixed-size chunks.

    Args:
        text: Cleaned text
        chunk_size: Maximum number of characters in one chunk

    Returns:
        List of text chunks
    """

    chunks = []

    for i in range(0, len(text), chunk_size):
        chunks.append(text[i:i + chunk_size])

    return chunks
    