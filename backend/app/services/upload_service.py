import shutil
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.logger import logger
from app.services.document_service import DocumentService
from app.services.embedding_service import EmbeddingService
from app.services.extractor import extract_text
from app.services.text_chunker import chunk_text
from app.services.text_preprocessor import clean_text
from app.vector_db.chroma_service import ChromaService

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

embedding_service = EmbeddingService()
chroma_service = ChromaService()


def save_uploaded_file(
    file: UploadFile,
    db: Session,
    user_id: int,
):
    """
    Upload document
    ↓
    Extract text
    ↓
    Clean text
    ↓
    Chunk text
    ↓
    Generate embeddings
    ↓
    Store in ChromaDB
    """

    try:

        unique_filename = (
            f"{uuid.uuid4().hex}_{file.filename}"
        )

        file_path = UPLOAD_DIR / unique_filename

        logger.info(f"Saving file: {file.filename}")

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        extracted_text = extract_text(str(file_path))

        if not extracted_text.strip():
            raise HTTPException(
                status_code=400,
                detail="No text could be extracted from the document.",
            )

        cleaned_text = clean_text(extracted_text)

        chunks = chunk_text(cleaned_text)

        embeddings = embedding_service.create_embeddings(
            chunks
        )

        document = DocumentService.create_document(
            db=db,
            user_id=user_id,
            filename=file.filename,
            file_path=str(file_path),
            file_type=file.filename.split(".")[-1],
            file_size=file.size or 0,
        )

        ids = [
            f"{document.id}_{i}"
            for i in range(len(chunks))
        ]

        chroma_service.add_documents(
            ids=ids,
            documents=chunks,
            embeddings=embeddings,
        )

        logger.info(
            f"Document {document.id} stored with {len(chunks)} chunks."
        )

        return {
            "document_id": document.id,
            "file_path": str(file_path),
            "filename": file.filename,
            "total_chunks": len(chunks),
            "message": "Document uploaded successfully.",
        }

    except Exception as e:

        logger.error(str(e))

        raise