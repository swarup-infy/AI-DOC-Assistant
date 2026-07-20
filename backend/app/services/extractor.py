from pathlib import Path

import fitz
import pandas as pd
from docx import Document

from app.core.logger import logger


def extract_pdf_pages(file_path: str) -> list[dict]:
    """
    Extract a PDF page by page.

    Returns:
        [
            {
                "page": 1,
                "text": "..."
            },
            ...
        ]
    """

    logger.info(f"Extracting PDF: {file_path}")

    pages = []

    try:
        document = fitz.open(file_path)
    except Exception:
        logger.exception(f"Failed to open PDF: {file_path}")
        raise

    try:
        for page_number, page in enumerate(document, start=1):

            text = page.get_text().strip()

            if text:
                pages.append(
                    {
                        "page": page_number,
                        "text": text,
                    }
                )

    except Exception:
        logger.exception(f"Failed to extract PDF pages: {file_path}")
        raise

    finally:
        document.close()

    return pages


def extract_pdf_text(file_path: str) -> str:
    """
    Backward-compatible PDF extraction.
    """

    pages = extract_pdf_pages(file_path)

    return "\n".join(page["text"] for page in pages)


def extract_docx_text(file_path: str) -> str:
    """
    Extract text from a DOCX file.
    """

    logger.info(f"Extracting DOCX: {file_path}")

    try:
        document = Document(file_path)

        text = ""

        for paragraph in document.paragraphs:
            text += paragraph.text + "\n"

        return text

    except Exception:
        logger.exception(f"Failed to extract DOCX: {file_path}")
        raise


def extract_txt_text(file_path: str) -> str:
    """
    Extract text from a plain TXT file.
    """

    logger.info(f"Extracting TXT: {file_path}")

    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()

    except Exception:
        logger.exception(f"Failed to extract TXT: {file_path}")
        raise


def extract_csv_text(file_path: str) -> str:
    """
    Extract text from a CSV file.
    """

    logger.info(f"Extracting CSV: {file_path}")

    try:
        df = pd.read_csv(file_path)
        return df.to_string(index=False)

    except Exception:
        logger.exception(f"Failed to extract CSV: {file_path}")
        raise


def extract_excel_text(file_path: str) -> str:
    """
    Extract text from an Excel file, including all sheets.
    """

    logger.info(f"Extracting Excel: {file_path}")

    try:
        sheets = pd.read_excel(file_path, sheet_name=None)

        text = ""

        for name, df in sheets.items():
            text += f"\n===== Sheet: {name} =====\n"
            text += df.to_string(index=False)
            text += "\n"

        return text

    except Exception:
        logger.exception(f"Failed to extract Excel: {file_path}")
        raise


def extract_text(file_path: str) -> str:
    """
    Existing extraction function.
    This remains unchanged so the current application keeps working.
    """

    extension = Path(file_path).suffix.lower()

    if extension == ".pdf":
        return extract_pdf_text(file_path)

    elif extension == ".docx":
        return extract_docx_text(file_path)

    elif extension == ".txt":
        return extract_txt_text(file_path)

    elif extension == ".csv":
        return extract_csv_text(file_path)

    elif extension in [".xlsx", ".xls"]:
        return extract_excel_text(file_path)

    else:
        logger.warning(f"Unsupported file type for extraction: {extension}")
        raise ValueError(f"Unsupported file type: {extension}")
