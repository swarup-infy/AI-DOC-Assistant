import os
import fitz
from docx import Document
import pandas as pd

def extract_pdf_text(file_path: str) -> str:
    """
    Extract text from a PDF file.

    Args:
        file_path (str): Path to the PDF file.

    Returns:
        str: Extracted text.
    """

    text = ""

    document = fitz.open(file_path)

    for page in document:
        text += page.get_text()

    document.close()

    return text

def extract_docx_text(file_path: str) -> str:
    """
    Extract text from a DOCX file.
    """

    document = Document(file_path)

    text = ""

    for paragraph in document.paragraphs:
        text += paragraph.text + "\n"

    return text


def extract_csv_text(file_path: str) -> str:
    """
    Extract text from a CSV file.
    """

    df = pd.read_csv(file_path)

    return df.to_string(index=False)


def extract_excel_text(file_path: str) -> str:
    """
    Extract text from an Excel file.
    """

    df = pd.read_excel(file_path)

    return df.to_string(index=False)


def extract_text(file_path: str) -> str:
    extension = os.path.splitext(file_path)[1].lower()

    if extension == ".pdf":
        return extract_pdf_text(file_path)

    elif extension == ".docx":
        return extract_docx_text(file_path)

    elif extension == ".csv":
        return extract_csv_text(file_path)

    elif extension in [".xlsx", ".xls"]:
        return extract_excel_text(file_path)

    else:
        raise ValueError(f"Unsupported file type: {extension}")