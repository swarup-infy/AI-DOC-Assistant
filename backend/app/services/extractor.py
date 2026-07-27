from __future__ import annotations

from collections.abc import Callable
from pathlib import Path

import fitz
import pandas as pd
from docx import Document
from docx.table import Table
from docx.text.paragraph import Paragraph

from app.core.logger import logger


# ==========================================================
# Types
# ==========================================================

Extractor = Callable[[str], str]


# ==========================================================
# PDF Extraction
# ==========================================================


def extract_pdf_pages(file_path: str) -> list[dict[str, int | str]]:
    """
    Extract readable text from a PDF page by page.

    Returns:
        A list of dictionaries containing page numbers and extracted text.

    Raises:
        FileNotFoundError: If the file does not exist.
        Exception: If PDF extraction fails.
    """
    path = _validate_file(file_path)

    logger.info("Extracting PDF: %s", path)

    document: fitz.Document | None = None

    try:
        document = fitz.open(path)

        pages: list[dict[str, int | str]] = []

        for page_number, page in enumerate(document, start=1):
            text = page.get_text("text").strip()

            if text:
                pages.append(
                    {
                        "page": page_number,
                        "text": text,
                    }
                )

        logger.info(
            "PDF extraction completed: %s (%d readable pages)",
            path,
            len(pages),
        )

        return pages

    except Exception:
        logger.exception("Failed to extract PDF: %s", path)
        raise

    finally:
        if document is not None:
            try:
                document.close()
            except Exception:
                logger.exception("Failed to close PDF: %s", path)


def extract_pdf_text(file_path: str) -> str:
    """
    Extract all readable text from a PDF.

    Args:
        file_path: Path to the PDF file.

    Returns:
        Extracted text from all readable pages.
    """
    pages = extract_pdf_pages(file_path)

    return "\n\n".join(str(page["text"]) for page in pages)


# ==========================================================
# DOCX Extraction
# ==========================================================


def extract_docx_text(file_path: str) -> str:
    """
    Extract readable text from a DOCX file.

    Top-level paragraphs and tables are extracted while preserving
    their order in the document.

    Args:
        file_path: Path to the DOCX file.

    Returns:
        Extracted document text.
    """
    path = _validate_file(file_path)

    logger.info("Extracting DOCX: %s", path)

    try:
        document = Document(path)

        sections: list[str] = []

        for child in document.element.body.iterchildren():
            if child.tag.endswith("}p"):
                paragraph = Paragraph(child, document)
                text = paragraph.text.strip()

                if text:
                    sections.append(text)

            elif child.tag.endswith("}tbl"):
                table = Table(child, document)

                for row in table.rows:
                    cells = [cell.text.strip() for cell in row.cells]

                    if any(cells):
                        sections.append("\t".join(cells))

        logger.info("DOCX extraction completed: %s", path)

        return "\n".join(sections)

    except Exception:
        logger.exception("Failed to extract DOCX: %s", path)
        raise


# ==========================================================
# TXT Extraction
# ==========================================================


def extract_txt_text(file_path: str) -> str:
    """
    Extract text from a UTF-8 plain-text file.

    Args:
        file_path: Path to the TXT file.

    Returns:
        File contents as text.
    """
    path = _validate_file(file_path)

    logger.info("Extracting TXT: %s", path)

    try:
        text = path.read_text(
            encoding="utf-8",
            errors="replace",
        )

        logger.info("TXT extraction completed: %s", path)

        return text

    except Exception:
        logger.exception("Failed to extract TXT: %s", path)
        raise


# ==========================================================
# CSV Extraction
# ==========================================================


def extract_csv_text(file_path: str) -> str:
    """
    Extract tabular content from a CSV file.

    Args:
        file_path: Path to the CSV file.

    Returns:
        Human-readable representation of the CSV data.
    """
    path = _validate_file(file_path)

    logger.info("Extracting CSV: %s", path)

    try:
        dataframe = pd.read_csv(path)

        text = dataframe.to_string(index=False)

        logger.info(
            "CSV extraction completed: %s (%d rows, %d columns)",
            path,
            len(dataframe),
            len(dataframe.columns),
        )

        return text

    except Exception:
        logger.exception("Failed to extract CSV: %s", path)
        raise


# ==========================================================
# Excel Extraction
# ==========================================================


def extract_excel_text(file_path: str) -> str:
    """
    Extract content from every sheet in an Excel workbook.

    Args:
        file_path: Path to the Excel file.

    Returns:
        Human-readable representation of all workbook sheets.
    """
    path = _validate_file(file_path)

    logger.info("Extracting Excel workbook: %s", path)

    try:
        sheets = pd.read_excel(
            path,
            sheet_name=None,
        )

        sections: list[str] = []

        for sheet_name, dataframe in sheets.items():
            sections.append(f"===== Sheet: {sheet_name} =====")

            if dataframe.empty:
                sections.append("[Empty sheet]")
            else:
                sections.append(
                    dataframe.to_string(index=False)
                )

        logger.info(
            "Excel extraction completed: %s (%d sheets)",
            path,
            len(sheets),
        )

        return "\n\n".join(sections)

    except Exception:
        logger.exception(
            "Failed to extract Excel workbook: %s",
            path,
        )
        raise


# ==========================================================
# Generic Extraction
# ==========================================================


_EXTRACTORS: dict[str, Extractor] = {
    ".pdf": extract_pdf_text,
    ".docx": extract_docx_text,
    ".txt": extract_txt_text,
    ".csv": extract_csv_text,
    ".xlsx": extract_excel_text,
    ".xls": extract_excel_text,
}


def extract_text(file_path: str) -> str:
    """
    Extract text from a supported document.

    Supported formats:
        - PDF
        - DOCX
        - TXT
        - CSV
        - XLSX
        - XLS

    Args:
        file_path: Path to the document.

    Returns:
        Extracted document text.

    Raises:
        FileNotFoundError: If the file does not exist.
        ValueError: If the path is invalid or the format is unsupported.
    """
    path = _validate_file(file_path)
    extension = path.suffix.lower()

    extractor = _EXTRACTORS.get(extension)

    if extractor is None:
        logger.warning(
            "Unsupported file type for extraction: %s",
            extension or "<no extension>",
        )

        raise ValueError(
            f"Unsupported file type: {extension or '<no extension>'}"
        )

    logger.debug(
        "Selected extractor for %s: %s",
        path,
        extractor.__name__,
    )

    return extractor(str(path))


# ==========================================================
# Internal Helpers
# ==========================================================


def _validate_file(file_path: str) -> Path:
    """
    Validate that a supplied path points to an existing regular file.

    Args:
        file_path: File path to validate.

    Returns:
        Validated Path object.

    Raises:
        ValueError: If the path is empty or does not point to a regular file.
        FileNotFoundError: If the file does not exist.
    """
    if not file_path or not file_path.strip():
        raise ValueError("File path cannot be empty.")

    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(f"File does not exist: {path}")

    if not path.is_file():
        raise ValueError(f"Path is not a file: {path}")

    return path