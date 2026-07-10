import shutil
from pathlib import Path
from fastapi import UploadFile
from app.ml.document_processor import extract_text_from_pdf

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


def save_uploaded_file(file: UploadFile):
    file_path = UPLOAD_DIR / file.filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    extracted_text = ""

    if file.filename.lower().endswith(".pdf"):
        extracted_text = extract_text_from_pdf(str(file_path))

    return {
        "file_path": file_path,
        "text": extracted_text
    }