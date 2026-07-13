import re

def clean_text(text: str) -> str:
    """
    Basic text cleaning for NLP.
    """

    # Convert to lowercase
    text = text.lower()

    # Remove extra spaces, tabs, and new lines
    text = re.sub(r"\s+", " ", text)

    # Remove special characters (keep letters, numbers, and spaces)
    text = re.sub(r"[^a-zA-Z0-9\s]", "", text)

    # Remove leading and trailing spaces
    text = text.strip()

    return text