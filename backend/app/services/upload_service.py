import shutil
import uuid
from pathlib import Path
from typing import List, Tuple, TypedDict

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.logger import logger
from app.services.document_service import DocumentService
from app.services.embedding_service import EmbeddingService
from app.services.extractor import (
    extract_pdf_pages,
    extract_text,
)
from app.services.text_chunker import chunk_text
from app.services.text_preprocessor import clean_text
from app.vector_db.chroma_service import ChromaService

# ==========================================================
# Configuration
# ==========================================================

UPLOAD_DIR = Path(getattr(settings, "UPLOAD_DIR", "uploads"))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

SUPPORTED_EXTENSIONS = {
    "pdf",
    "docx",
    "txt",
    "csv",
    "xlsx",
    "xls",
}

MAX_FILE_SIZE = getattr(settings, "MAX_UPLOAD_SIZE", 20 * 1024 * 1024)  # 20 MB default

embedding_service = EmbeddingService()
chroma_service = ChromaService()


# ==========================================================
# Types
# ==========================================================

class ChunkMetadata(TypedDict):
    document_id: int
    document_name: str
    page: int
    chunk_index: int


# ==========================================================
# Validation
# ==========================================================

def validate_upload(file: UploadFile) -> str:

    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is missing.",
        )

    extension = Path(file.filename).suffix.lower().lstrip(".")

    if not extension or extension not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: {extension or '(none)'}",
        )

    # Early rejection when the client reports a size — saves us from
    # writing an obviously oversized file to disk. Not authoritative:
    # the real check happens against bytes actually written in
    # save_file_to_disk(). Guarded with getattr since `.size` isn't
    # present on every Starlette/FastAPI version.
    file_size = getattr(file, "size", None)

    if file_size and file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds 20 MB.",
        )

    return extension


# ==========================================================
# Save File
# ==========================================================

def save_file_to_disk(file: UploadFile) -> Path:

    # Strip any client-supplied path components to prevent
    # directory traversal (e.g. "../../etc/passwd").
    safe_name = Path(file.filename).name
    unique_filename = f"{uuid.uuid4().hex}_{safe_name}"
    file_path = UPLOAD_DIR / unique_filename

    # Make sure we're reading from the start of the stream.
    try:
        file.file.seek(0)
    except Exception:
        pass

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Verify actual size on disk — this is the authoritative check,
    # since Content-Length / UploadFile.size can be spoofed or absent.
    actual_size = file_path.stat().st_size

    if actual_size > MAX_FILE_SIZE:
        file_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds 20 MB.",
        )

    if actual_size == 0:
        file_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    return file_path


# ==========================================================
# Extract Chunks
# ==========================================================

def process_pdf(
    file_path: Path,
    document_id: int,
    filename: str,
) -> Tuple[List[str], List[ChunkMetadata]]:

    chunks: List[str] = []
    metadata: List[ChunkMetadata] = []

    pages = extract_pdf_pages(str(file_path))

    for page in pages:

        cleaned = clean_text(page["text"])

        if not cleaned.strip():
            continue

        page_chunks = chunk_text(cleaned)

        for index, chunk in enumerate(page_chunks):

            chunks.append(chunk)

            metadata.append(
                {
                    "document_id": document_id,
                    "document_name": filename,
                    "page": page["page"],
                    "chunk_index": index,
                }
            )

    return chunks, metadata


def process_other_document(
    file_path: Path,
    document_id: int,
    filename: str,
) -> Tuple[List[str], List[ChunkMetadata]]:

    text = extract_text(str(file_path))
    cleaned = clean_text(text)

    if not cleaned.strip():
        raise HTTPException(
            status_code=400,
            detail="No text found inside the document.",
        )

    chunks = chunk_text(cleaned)

    metadata: List[ChunkMetadata] = []

    for index, chunk in enumerate(chunks):

        metadata.append(
            {
                "document_id": document_id,
                "document_name": filename,
                "page": 1,
                "chunk_index": index,
            }
        )

    return chunks, metadata


def _cleanup_failed_upload(
    db: Session,
    document,
    file_path: Path | None,
    chunk_ids: List[str] | None = None,
) -> None:
    """Best-effort cleanup so a failed upload doesn't leave orphaned data."""

    # Roll back any uncommitted session state first, so the delete
    # below isn't operating on a dirty/inconsistent session.
    try:
        db.rollback()
    except Exception:
        logger.exception("Failed to roll back session during cleanup.")

    if file_path and file_path.exists():
        file_path.unlink(missing_ok=True)

    if chunk_ids:
        try:
            # Only attempt this if ChromaService actually exposes a
            # delete method — adjust the method name to match yours.
            if hasattr(chroma_service, "delete_documents"):
                chroma_service.delete_documents(ids=chunk_ids)
                logger.info(f"Rolled back {len(chunk_ids)} Chroma vectors.")
            else:
                logger.warning(
                    "ChromaService has no delete method; "
                    "orphaned vectors may remain for ids: %s",
                    chunk_ids,
                )
        except Exception:
            logger.exception("Failed to clean up Chroma vectors.")

    if document is not None:
        try:
            db.delete(document)
            db.commit()
        except Exception:
            db.rollback()
            logger.exception(
                f"Failed to remove orphaned document record (id={getattr(document, 'id', None)})."
            )


def save_uploaded_file(
    file: UploadFile,
    db: Session,
    user_id: int,
) -> dict:
    """
    Upload a document, extract text, create embeddings,
    store vectors in ChromaDB and metadata in PostgreSQL.
    """

    extension = validate_upload(file)

    file_path = None
    document = None
    ids: List[str] = []

    try:

        logger.info(f"Uploading document: {file.filename}")

        # ---------------------------------------------
        # Save file
        # ---------------------------------------------

        file_path = save_file_to_disk(file)

        # ---------------------------------------------
        # Save metadata
        # ---------------------------------------------

        document = DocumentService.create_document(
            db=db,
            user_id=user_id,
            filename=file.filename,
            file_path=str(file_path),
            file_type=extension,
            file_size=file_path.stat().st_size,
        )

        # ---------------------------------------------
        # Extract text
        # ---------------------------------------------

        if extension == "pdf":

            chunks, metadata = process_pdf(
                file_path=file_path,
                document_id=document.id,
                filename=file.filename,
            )

        else:

            chunks, metadata = process_other_document(
                file_path=file_path,
                document_id=document.id,
                filename=file.filename,
            )

        if not chunks:

            raise HTTPException(
                status_code=400,
                detail="No readable text found.",
            )

        logger.info(f"Generated {len(chunks)} text chunks.")

        # ---------------------------------------------
        # Create embeddings
        # ---------------------------------------------

        embeddings = embedding_service.create_embeddings(chunks)

        logger.info("Embeddings created successfully.")

        ids = [f"{document.id}_{i}" for i in range(len(chunks))]

        # ---------------------------------------------
        # Store in ChromaDB
        # ---------------------------------------------

        chroma_service.add_documents(
            ids=ids,
            documents=chunks,
            embeddings=embeddings,
            metadatas=metadata,
        )

        logger.info(f"Stored {len(chunks)} chunks in ChromaDB.")

        return {
            "status": "success",
            "message": "Document uploaded successfully.",
            "document": {
                "id": document.id,
                "filename": document.filename,
                "file_type": document.file_type,
                "file_size": document.file_size,
            },
            "chunks": len(chunks),
        }

    # -------------------------------------------------------
    # Handle API Errors
    # -------------------------------------------------------

    except HTTPException:

        _cleanup_failed_upload(db, document, file_path, ids)
        raise

    # -------------------------------------------------------
    # Handle Unexpected Errors
    # -------------------------------------------------------

    except Exception:

        logger.exception("Unexpected error while uploading document.")

        _cleanup_failed_upload(db, document, file_path, ids)

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process uploaded document.",
        )


# ==========================================================
# Helper Functions
# ==========================================================

def delete_uploaded_file(file_path: str) -> bool:
    """
    Delete a file from the uploads directory.

    Returns:
        True if deleted successfully, otherwise False.
    """
    try:
        path = Path(file_path)

        if path.exists():
            path.unlink()
            logger.info(f"Deleted file: {path}")
            return True

        logger.warning(f"File not found: {path}")
        return False

    except Exception:
        logger.exception("Failed to delete uploaded file.")
        return False


def get_supported_extensions() -> List[str]:
    """
    Return all supported upload extensions.
    """
    return sorted(SUPPORTED_EXTENSIONS)


def get_max_upload_size() -> int:
    """
    Return maximum upload size in bytes.
    """
    return MAX_FILE_SIZE


def get_max_upload_size_mb() -> float:
    """
    Return maximum upload size in MB.
    """
    return round(MAX_FILE_SIZE / (1024 * 1024), 2)


def format_file_size(size: int) -> str:
    """
    Convert bytes into a human-readable format.
    """

    units = ["B", "KB", "MB", "GB", "TB"]

    value = float(size)

    for unit in units:

        if value < 1024:
            return f"{value:.2f} {unit}"

        value /= 1024

    return f"{value:.2f} PB"


def upload_summary() -> dict:
    """
    Return upload configuration information.
    """

    return {
        "supported_extensions": get_supported_extensions(),
        "max_upload_size_bytes": get_max_upload_size(),
        "max_upload_size_mb": get_max_upload_size_mb(),
        "upload_directory": str(UPLOAD_DIR),
    }
