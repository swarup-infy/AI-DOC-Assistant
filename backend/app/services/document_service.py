from __future__ import annotations

from sqlalchemy import func
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.logger import logger
from app.models.document import Document


class DuplicateDocumentError(Exception):
    """
    Raised when a user attempts to create a document whose
    filename already exists for that user.
    """

    def __init__(
        self,
        user_id: int,
        filename: str,
    ) -> None:
        self.user_id = user_id
        self.filename = filename

        super().__init__(
            "A document with this filename has already been uploaded."
        )


class DocumentService:
    """
    Service layer for document persistence and retrieval.

    Responsibilities:
    - Create document records.
    - Retrieve documents owned by a user.
    - Detect duplicate filenames explicitly.
    - Protect against concurrent duplicate inserts.
    - Delete document records.
    - Keep ownership filtering inside the data-access layer.
    - Handle database transaction failures safely.
    """

    # ==========================================================
    # Create
    # ==========================================================

    @staticmethod
    def create_document(
        db: Session,
        user_id: int,
        filename: str,
        file_path: str,
        file_type: str,
        file_size: int,
        chroma_collection: str | None = None,
    ) -> Document:
        """
        Create and persist a new document record.

        Normal upload workflows should check for duplicates before
        calling this method.

        The database also enforces case-insensitive filename
        uniqueness per user. This method therefore handles the
        database-level race condition where concurrent requests
        attempt to create the same filename.
        """

        if user_id <= 0:
            raise ValueError(
                "user_id must be greater than zero."
            )

        normalized_filename = filename.strip()
        normalized_file_path = file_path.strip()
        normalized_file_type = file_type.strip().lower()

        if not normalized_filename:
            raise ValueError(
                "filename cannot be empty."
            )

        if not normalized_file_path:
            raise ValueError(
                "file_path cannot be empty."
            )

        if not normalized_file_type:
            raise ValueError(
                "file_type cannot be empty."
            )

        if file_size <= 0:
            raise ValueError(
                "file_size must be greater than zero."
            )

        collection_name = (
            chroma_collection.strip()
            if chroma_collection
            else settings.CHROMA_COLLECTION_NAME
        )

        if not collection_name:
            raise ValueError(
                "chroma_collection cannot be empty."
            )

        document = Document(
            user_id=user_id,
            filename=normalized_filename,
            file_path=normalized_file_path,
            file_type=normalized_file_type,
            file_size=file_size,
            chroma_collection=collection_name,
        )

        try:
            db.add(document)
            db.commit()
            db.refresh(document)

            logger.info(
                "Document created. "
                "document_id=%d user_id=%d filename='%s'.",
                document.id,
                user_id,
                normalized_filename,
            )

            return document

        except IntegrityError as exc:
            db.rollback()

            if DocumentService._is_duplicate_filename_error(
                exc
            ):
                logger.warning(
                    "Concurrent duplicate document rejected. "
                    "user_id=%d filename='%s'.",
                    user_id,
                    normalized_filename,
                )

                raise DuplicateDocumentError(
                    user_id=user_id,
                    filename=normalized_filename,
                ) from exc

            logger.exception(
                "Database integrity error while creating document "
                "for user %d filename='%s'.",
                user_id,
                normalized_filename,
            )

            raise

        except SQLAlchemyError:
            db.rollback()

            logger.exception(
                "Database error while creating document "
                "for user %d filename='%s'.",
                user_id,
                normalized_filename,
            )

            raise

    # ==========================================================
    # Retrieve All
    # ==========================================================

    @staticmethod
    def get_documents(
        db: Session,
        user_id: int,
    ) -> list[Document]:
        """
        Return all documents belonging to a user.

        Results are ordered newest first.
        """

        if user_id <= 0:
            raise ValueError(
                "user_id must be greater than zero."
            )

        try:
            return (
                db.query(Document)
                .filter(
                    Document.user_id == user_id
                )
                .order_by(
                    Document.uploaded_at.desc(),
                    Document.id.desc(),
                )
                .all()
            )

        except SQLAlchemyError:
            logger.exception(
                "Database error while retrieving documents "
                "for user %d.",
                user_id,
            )

            raise

    # ==========================================================
    # Retrieve by ID
    # ==========================================================

    @staticmethod
    def get_document(
        db: Session,
        document_id: int,
    ) -> Document | None:
        """
        Return a document by ID.

        This method does not enforce ownership and should only be
        used by trusted internal code.

        API-facing code should normally use get_document_by_id().
        """

        if document_id <= 0:
            raise ValueError(
                "document_id must be greater than zero."
            )

        try:
            return (
                db.query(Document)
                .filter(
                    Document.id == document_id
                )
                .first()
            )

        except SQLAlchemyError:
            logger.exception(
                "Database error while retrieving document %d.",
                document_id,
            )

            raise

    # ==========================================================
    # Retrieve by ID and Owner
    # ==========================================================

    @staticmethod
    def get_document_by_id(
        db: Session,
        document_id: int,
        user_id: int,
    ) -> Document | None:
        """
        Return a document only when it belongs to the specified user.

        This method should be preferred by authenticated API routes.
        """

        if document_id <= 0:
            raise ValueError(
                "document_id must be greater than zero."
            )

        if user_id <= 0:
            raise ValueError(
                "user_id must be greater than zero."
            )

        try:
            return (
                db.query(Document)
                .filter(
                    Document.id == document_id,
                    Document.user_id == user_id,
                )
                .first()
            )

        except SQLAlchemyError:
            logger.exception(
                "Database error while retrieving document %d "
                "for user %d.",
                document_id,
                user_id,
            )

            raise

    # ==========================================================
    # Retrieve by Filename
    # ==========================================================

    @staticmethod
    def get_document_by_filename(
        db: Session,
        user_id: int,
        filename: str,
    ) -> Document | None:
        """
        Return a user's document matching a filename.

        Filename matching is case-insensitive.

        This allows upload workflows to reject normal duplicate
        requests before storing a physical file.
        """

        if user_id <= 0:
            raise ValueError(
                "user_id must be greater than zero."
            )

        normalized_filename = filename.strip()

        if not normalized_filename:
            raise ValueError(
                "filename cannot be empty."
            )

        try:
            return (
                db.query(Document)
                .filter(
                    Document.user_id == user_id,
                    func.lower(Document.filename)
                    == normalized_filename.lower(),
                )
                .first()
            )

        except SQLAlchemyError:
            logger.exception(
                "Database error while checking filename '%s' "
                "for user %d.",
                normalized_filename,
                user_id,
            )

            raise

    # ==========================================================
    # Exists
    # ==========================================================

    @staticmethod
    def document_exists(
        db: Session,
        user_id: int,
        filename: str,
    ) -> bool:
        """
        Return whether a user already owns a document with
        the supplied filename.
        """

        return (
            DocumentService.get_document_by_filename(
                db=db,
                user_id=user_id,
                filename=filename,
            )
            is not None
        )

    # ==========================================================
    # Delete
    # ==========================================================

    @staticmethod
    def delete_document(
        db: Session,
        document: Document,
    ) -> None:
        """
        Delete a document record.

        Physical-file and vector-store cleanup belong to the
        higher-level document deletion workflow.
        """

        document_id = document.id
        user_id = document.user_id

        try:
            db.delete(document)
            db.commit()

            logger.info(
                "Document deleted. "
                "document_id=%d user_id=%d.",
                document_id,
                user_id,
            )

        except SQLAlchemyError:
            db.rollback()

            logger.exception(
                "Database error while deleting document %d "
                "for user %d.",
                document_id,
                user_id,
            )

            raise

    # ==========================================================
    # Integrity Helpers
    # ==========================================================

    @staticmethod
    def _is_duplicate_filename_error(
        exc: IntegrityError,
    ) -> bool:
        """
        Return True when an IntegrityError was caused by the
        case-insensitive per-user filename unique index.

        PostgreSQL/psycopg exposes the violated constraint or index
        name through diagnostic metadata. The string fallback keeps
        the check compatible with drivers that do not expose diag.
        """

        original_error = exc.orig

        diagnostic = getattr(
            original_error,
            "diag",
            None,
        )

        constraint_name = getattr(
            diagnostic,
            "constraint_name",
            None,
        )

        expected_name = (
            "uq_documents_user_id_filename_lower"
        )

        if constraint_name == expected_name:
            return True

        return expected_name in str(
            original_error
        )