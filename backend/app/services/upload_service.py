from __future__ import annotations

import gc
import time
import uuid
from pathlib import Path
from typing import TypedDict

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.logger import logger
from app.models.document import Document
from app.services.document_service import (
    DocumentService,
    DuplicateDocumentError,
)
from app.services.embedding_service import EmbeddingService
from app.services.extractor import extract_pdf_pages, extract_text
from app.services.text_chunker import chunk_text
from app.services.text_preprocessor import clean_text
from app.vector_db.chroma_service import ChromaService


# ==========================================================
# Configuration
# ==========================================================

UPLOAD_DIR = Path(
    settings.UPLOAD_DIR
).expanduser()

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True,
)

SUPPORTED_EXTENSIONS = frozenset(
    {
        "pdf",
        "docx",
        "txt",
        "csv",
        "xlsx",
        "xls",
    }
)

MAX_FILE_SIZE = settings.MAX_UPLOAD_SIZE

FILE_COPY_BUFFER_SIZE = 1024 * 1024

FILE_DELETE_MAX_ATTEMPTS = 6
FILE_DELETE_RETRY_DELAY_SECONDS = 0.25


# ==========================================================
# Types
# ==========================================================


class ChunkMetadata(TypedDict):
    """
    Metadata stored alongside each vector in ChromaDB.
    """

    user_id: int
    document_id: int
    document_name: str
    page: int
    chunk_index: int


# ==========================================================
# Validation
# ==========================================================


def validate_upload(
    file: UploadFile,
) -> str:
    """
    Validate basic upload properties and return the normalized
    file extension.

    The actual file size is also verified while streaming the
    upload to disk.
    """

    filename = file.filename

    if not filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is missing.",
        )

    safe_filename = _safe_filename(
        filename
    )

    extension = (
        Path(safe_filename)
        .suffix
        .lower()
        .lstrip(".")
    )

    if extension not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=(
                "Unsupported file type. "
                f"Received: {extension or '(none)'}. "
                "Supported types: "
                f"{', '.join(sorted(SUPPORTED_EXTENSIONS))}."
            ),
        )

    reported_size = getattr(
        file,
        "size",
        None,
    )

    if (
        isinstance(reported_size, int)
        and reported_size > MAX_FILE_SIZE
    ):
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=(
                "File size exceeds the maximum allowed size "
                f"of {get_max_upload_size_mb():g} MB."
            ),
        )

    return extension


# ==========================================================
# Filename Handling
# ==========================================================


def _safe_filename(
    filename: str,
) -> str:
    """
    Remove client-supplied path components and validate the
    resulting filename.
    """

    safe_name = Path(
        filename
    ).name.strip()

    if not safe_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is invalid.",
        )

    if safe_name in {".", ".."}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is invalid.",
        )

    return safe_name


# ==========================================================
# Duplicate Detection
# ==========================================================


def _ensure_document_not_duplicate(
    db: Session,
    user_id: int,
    filename: str,
) -> None:
    """
    Reject an upload when the authenticated user already owns
    a document with the same filename.

    PostgreSQL additionally enforces case-insensitive uniqueness
    per user to protect against concurrent upload race conditions.
    """

    existing_document = (
        DocumentService.get_document_by_filename(
            db=db,
            user_id=user_id,
            filename=filename,
        )
    )

    if existing_document is None:
        return

    logger.info(
        "Duplicate upload rejected. "
        "user_id=%d existing_document_id=%d filename='%s'.",
        user_id,
        existing_document.id,
        filename,
    )

    raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail=(
            "A document with this filename "
            "has already been uploaded."
        ),
    )


# ==========================================================
# File Deletion
# ==========================================================


def _delete_file_with_retry(
    file_path: Path,
    *,
    max_attempts: int = FILE_DELETE_MAX_ATTEMPTS,
    retry_delay: float = FILE_DELETE_RETRY_DELAY_SECONDS,
) -> bool:
    """
    Delete a file with retry support for temporary Windows locks.

    Libraries backed by native code can occasionally retain a file
    handle briefly after an extraction failure. Windows prevents
    deletion while such a handle remains open.

    PermissionError is therefore retried with a short increasing
    delay. Other filesystem errors are logged and treated as a
    failed deletion.
    """

    if max_attempts <= 0:
        raise ValueError(
            "max_attempts must be greater than zero."
        )

    if retry_delay < 0:
        raise ValueError(
            "retry_delay cannot be negative."
        )

    for attempt in range(
        1,
        max_attempts + 1,
    ):
        try:
            file_path.unlink(
                missing_ok=True
            )

            if attempt > 1:
                logger.info(
                    "Deleted file after retry. "
                    "path='%s' attempt=%d.",
                    file_path,
                    attempt,
                )

            return True

        except PermissionError:
            if attempt >= max_attempts:
                logger.exception(
                    "File remained locked after %d deletion "
                    "attempts: %s.",
                    max_attempts,
                    file_path,
                )

                return False

            logger.warning(
                "File is temporarily locked. "
                "Retrying deletion. path='%s' attempt=%d/%d.",
                file_path,
                attempt,
                max_attempts,
            )

            # Encourage native Python wrappers to release objects
            # before the next Windows deletion attempt.
            gc.collect()

            time.sleep(
                retry_delay * attempt
            )

        except FileNotFoundError:
            return True

        except OSError:
            logger.exception(
                "Failed to delete file: %s.",
                file_path,
            )

            return False

    return False


# ==========================================================
# File Storage
# ==========================================================


def save_file_to_disk(
    file: UploadFile,
) -> Path:
    """
    Stream an uploaded file to disk while enforcing the
    configured maximum size.

    Partial files are removed when writing fails or when the
    upload exceeds the configured limit.
    """

    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is missing.",
        )

    safe_name = _safe_filename(
        file.filename
    )

    stored_filename = (
        f"{uuid.uuid4().hex}_{safe_name}"
    )

    file_path = (
        UPLOAD_DIR / stored_filename
    )

    bytes_written = 0

    try:
        file.file.seek(0)

        with file_path.open(
            "wb"
        ) as destination:
            while True:
                data = file.file.read(
                    FILE_COPY_BUFFER_SIZE
                )

                if not data:
                    break

                bytes_written += len(
                    data
                )

                if bytes_written > MAX_FILE_SIZE:
                    raise HTTPException(
                        status_code=(
                            status.HTTP_413_REQUEST_ENTITY_TOO_LARGE
                        ),
                        detail=(
                            "File size exceeds the maximum "
                            "allowed size of "
                            f"{get_max_upload_size_mb():g} MB."
                        ),
                    )

                destination.write(
                    data
                )

    except HTTPException:
        _delete_file_with_retry(
            file_path
        )

        raise

    except Exception as exc:
        _delete_file_with_retry(
            file_path
        )

        logger.exception(
            "Failed to save uploaded file '%s'.",
            safe_name,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to store uploaded file.",
        ) from exc

    if bytes_written == 0:
        _delete_file_with_retry(
            file_path
        )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    return file_path


# ==========================================================
# PDF Processing
# ==========================================================


def process_pdf(
    file_path: Path,
    user_id: int,
    document_id: int,
    filename: str,
) -> tuple[
    list[str],
    list[ChunkMetadata],
]:
    """
    Extract, clean, and chunk PDF text page by page.
    """

    chunks: list[str] = []
    metadata: list[ChunkMetadata] = []

    pages = extract_pdf_pages(
        str(file_path)
    )

    for page in pages:
        raw_text = page.get(
            "text",
            "",
        )

        cleaned_text = clean_text(
            str(raw_text)
        ).strip()

        if not cleaned_text:
            continue

        page_number_value = page.get(
            "page",
            1,
        )

        try:
            page_number = int(
                page_number_value
            )

        except (TypeError, ValueError):
            page_number = 1

        page_number = max(
            page_number,
            1,
        )

        page_chunks = chunk_text(
            cleaned_text
        )

        for chunk_index, chunk in enumerate(
            page_chunks
        ):
            normalized_chunk = (
                chunk.strip()
            )

            if not normalized_chunk:
                continue

            chunks.append(
                normalized_chunk
            )

            metadata.append(
                {
                    "user_id": user_id,
                    "document_id": document_id,
                    "document_name": filename,
                    "page": page_number,
                    "chunk_index": chunk_index,
                }
            )

    return chunks, metadata


# ==========================================================
# Other Document Processing
# ==========================================================


def process_other_document(
    file_path: Path,
    user_id: int,
    document_id: int,
    filename: str,
) -> tuple[
    list[str],
    list[ChunkMetadata],
]:
    """
    Extract, clean, and chunk a supported non-PDF document.
    """

    text = extract_text(
        str(file_path)
    )

    cleaned_text = clean_text(
        text
    ).strip()

    if not cleaned_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "No readable text found inside "
                "the document."
            ),
        )

    raw_chunks = chunk_text(
        cleaned_text
    )

    chunks: list[str] = []
    metadata: list[ChunkMetadata] = []

    for chunk_index, chunk in enumerate(
        raw_chunks
    ):
        normalized_chunk = (
            chunk.strip()
        )

        if not normalized_chunk:
            continue

        chunks.append(
            normalized_chunk
        )

        metadata.append(
            {
                "user_id": user_id,
                "document_id": document_id,
                "document_name": filename,
                "page": 1,
                "chunk_index": chunk_index,
            }
        )

    return chunks, metadata


# ==========================================================
# Failed Upload Cleanup
# ==========================================================


def _cleanup_failed_upload(
    db: Session,
    document: Document | None,
    file_path: Path | None,
    chunk_ids: list[str],
    chroma_service: ChromaService,
) -> None:
    """
    Perform best-effort cleanup after a failed upload.

    Cleanup covers:
    - SQLAlchemy transaction state
    - ChromaDB vectors
    - PostgreSQL document record
    - Stored physical file

    Cleanup failures are logged without hiding the original
    upload failure.
    """

    try:
        db.rollback()

    except Exception:
        logger.exception(
            "Failed to roll back database session "
            "during upload cleanup."
        )

    if chunk_ids:
        try:
            chroma_service.delete_documents(
                ids=chunk_ids,
            )

            logger.info(
                "Requested cleanup of %d vectors "
                "after upload failure.",
                len(chunk_ids),
            )

        except Exception:
            logger.exception(
                "Failed to clean up ChromaDB vectors "
                "after upload failure."
            )

    if document is not None:
        try:
            document_id = document.id

            db.delete(
                document
            )

            db.commit()

            logger.info(
                "Removed document record %d "
                "after upload failure.",
                document_id,
            )

        except Exception:
            db.rollback()

            logger.exception(
                "Failed to remove document record "
                "after upload failure. document_id=%s.",
                getattr(
                    document,
                    "id",
                    None,
                ),
            )

    if file_path is not None:
        deleted = _delete_file_with_retry(
            file_path
        )

        if not deleted:
            logger.error(
                "Upload cleanup could not remove "
                "physical file: %s.",
                file_path,
            )


# ==========================================================
# Upload Pipeline
# ==========================================================


def save_uploaded_file(
    file: UploadFile,
    db: Session,
    user_id: int,
) -> dict:
    """
    Process and persist an uploaded document.

    Pipeline:
    1. Validate user and upload.
    2. Normalize the original filename.
    3. Reject normal duplicate filenames before persistence.
    4. Stream the file to disk.
    5. Create the PostgreSQL document record.
    6. Handle database-level duplicate race conditions.
    7. Extract, clean, and chunk document text.
    8. Generate embeddings.
    9. Store vectors and ownership metadata in ChromaDB.

    Any failure after persistence begins triggers best-effort
    cleanup of created resources.
    """

    if user_id <= 0:
        raise ValueError(
            "user_id must be greater than zero."
        )

    extension = validate_upload(
        file
    )

    original_filename = _safe_filename(
        file.filename or ""
    )

    _ensure_document_not_duplicate(
        db=db,
        user_id=user_id,
        filename=original_filename,
    )

    embedding_service = (
        EmbeddingService()
    )

    chroma_service = (
        ChromaService()
    )

    file_path: Path | None = None
    document: Document | None = None

    chunk_ids: list[str] = []

    try:
        logger.info(
            "Processing upload '%s' for user %d.",
            original_filename,
            user_id,
        )

        # ==================================================
        # Physical Storage
        # ==================================================

        file_path = save_file_to_disk(
            file
        )

        file_size = (
            file_path.stat().st_size
        )

        # ==================================================
        # PostgreSQL Metadata
        # ==================================================

        document = (
            DocumentService.create_document(
                db=db,
                user_id=user_id,
                filename=original_filename,
                file_path=str(file_path),
                file_type=extension,
                file_size=file_size,
            )
        )

        logger.info(
            "Created document record %d "
            "for user %d.",
            document.id,
            user_id,
        )

        # ==================================================
        # Extraction and Chunking
        # ==================================================

        if extension == "pdf":
            chunks, metadata = process_pdf(
                file_path=file_path,
                user_id=user_id,
                document_id=document.id,
                filename=original_filename,
            )

        else:
            chunks, metadata = (
                process_other_document(
                    file_path=file_path,
                    user_id=user_id,
                    document_id=document.id,
                    filename=original_filename,
                )
            )

        if not chunks:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "No readable text found "
                    "in the document."
                ),
            )

        if len(metadata) != len(chunks):
            raise RuntimeError(
                "Chunk metadata count does not "
                "match chunk count."
            )

        logger.info(
            "Generated %d chunks for document %d.",
            len(chunks),
            document.id,
        )

        # ==================================================
        # Embeddings
        # ==================================================

        embeddings = (
            embedding_service.create_embeddings(
                chunks
            )
        )

        if not embeddings:
            raise RuntimeError(
                "Embedding generation returned "
                "no vectors."
            )

        if len(embeddings) != len(chunks):
            raise RuntimeError(
                "Embedding count does not "
                "match chunk count."
            )

        logger.info(
            "Generated %d embeddings "
            "for document %d.",
            len(embeddings),
            document.id,
        )

        # ==================================================
        # Vector IDs
        # ==================================================

        chunk_ids = [
            (
                f"document_{document.id}"
                f"_chunk_{index}"
            )
            for index in range(
                len(chunks)
            )
        ]

        # ==================================================
        # ChromaDB
        # ==================================================

        chroma_service.add_documents(
            ids=chunk_ids,
            documents=chunks,
            embeddings=embeddings,
            metadatas=metadata,
        )

        logger.info(
            "Stored %d vectors for document %d.",
            len(chunks),
            document.id,
        )

        return {
            "status": "success",
            "message": (
                "Document uploaded successfully."
            ),
            "document": {
                "id": document.id,
                "filename": document.filename,
                "file_type": document.file_type,
                "file_size": document.file_size,
                "uploaded_at": document.uploaded_at,
                "updated_at": document.updated_at,
            },
            "chunks": len(chunks),
        }

    except DuplicateDocumentError as exc:
        logger.info(
            "Database-level duplicate upload rejected. "
            "user_id=%d filename='%s'.",
            user_id,
            original_filename,
        )

        _cleanup_failed_upload(
            db=db,
            document=None,
            file_path=file_path,
            chunk_ids=[],
            chroma_service=chroma_service,
        )

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc

    except HTTPException:
        _cleanup_failed_upload(
            db=db,
            document=document,
            file_path=file_path,
            chunk_ids=chunk_ids,
            chroma_service=chroma_service,
        )

        raise

    except Exception as exc:
        logger.exception(
            "Unexpected error while processing "
            "upload '%s' for user %d.",
            original_filename,
            user_id,
        )

        _cleanup_failed_upload(
            db=db,
            document=document,
            file_path=file_path,
            chunk_ids=chunk_ids,
            chroma_service=chroma_service,
        )

        raise HTTPException(
            status_code=(
                status.HTTP_500_INTERNAL_SERVER_ERROR
            ),
            detail=(
                "Failed to process uploaded document."
            ),
        ) from exc


# ==========================================================
# Public File Deletion
# ==========================================================


def delete_uploaded_file(
    file_path: str,
) -> bool:
    """
    Delete a stored uploaded file.

    Temporary Windows file locks are retried automatically.
    """

    if not file_path:
        return False

    path = Path(
        file_path
    )

    if not path.exists():
        logger.warning(
            "Uploaded file not found: %s.",
            path,
        )

        return False

    deleted = _delete_file_with_retry(
        path
    )

    if deleted:
        logger.info(
            "Deleted uploaded file: %s.",
            path,
        )

    return deleted


# ==========================================================
# Configuration Helpers
# ==========================================================


def get_supported_extensions() -> list[str]:
    """
    Return supported upload extensions.
    """

    return sorted(
        SUPPORTED_EXTENSIONS
    )


def get_max_upload_size() -> int:
    """
    Return maximum upload size in bytes.
    """

    return MAX_FILE_SIZE


def get_max_upload_size_mb() -> float:
    """
    Return maximum upload size in MiB.
    """

    return round(
        MAX_FILE_SIZE / (1024 * 1024),
        2,
    )


def format_file_size(
    size: int,
) -> str:
    """
    Convert a byte count to a human-readable binary size.
    """

    if size < 0:
        raise ValueError(
            "File size cannot be negative."
        )

    units = (
        "B",
        "KiB",
        "MiB",
        "GiB",
        "TiB",
    )

    value = float(
        size
    )

    for unit in units:
        if value < 1024:
            return (
                f"{value:.2f} {unit}"
            )

        value /= 1024

    return f"{value:.2f} PiB"


def upload_summary() -> dict:
    """
    Return non-sensitive upload configuration.
    """

    return {
        "supported_extensions": (
            get_supported_extensions()
        ),
        "max_upload_size_bytes": (
            get_max_upload_size()
        ),
        "max_upload_size_mb": (
            get_max_upload_size_mb()
        ),
        "upload_directory": str(
            UPLOAD_DIR
        ),
    }