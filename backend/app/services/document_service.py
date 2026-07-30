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
    # Validation
    # ==========================================================

    @staticmethod
    def _validate_positive_int(
        value: int,
        *,
        field_name: str,
    ) -> None:
        """
        Validate a positive integer value.
        """

        if isinstance(value, bool) or not isinstance(value, int):
            raise TypeError(
                f"{field_name} must be an integer."
            )

        if value <= 0:
            raise ValueError(
                f"{field_name} must be greater than zero."
            )

    # ==========================================================
    # Create
    # ==========================================================

    @classmethod
    def create_document(
        cls,
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

        cls._validate_positive_int(
            user_id,
            field_name="user_id",
        )

        cls._validate_positive_int(
            file_size,
            field_name="file_size",
        )

        if not isinstance(filename, str):
            raise TypeError(
                "filename must be a string."
            )

        if not isinstance(file_path, str):
            raise TypeError(
                "file_path must be a string."
            )

        if not isinstance(file_type, str):
            raise TypeError(
                "file_type must be a string."
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

        if chroma_collection is not None:
            if not isinstance(chroma_collection, str):
                raise TypeError(
                    "chroma_collection must be a string."
                )

            collection_name = chroma_collection.strip()

        else:
            collection_name = (
                settings.CHROMA_COLLECTION_NAME.strip()
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

            if cls._is_duplicate_filename_error(
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

    @classmethod
    def get_documents(
        cls,
        db: Session,
        user_id: int,
    ) -> list[Document]:
        """
        Return all documents belonging to a user.

        Results are ordered newest first.
        """

        cls._validate_positive_int(
            user_id,
            field_name="user_id",
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

    @classmethod
    def get_document(
        cls,
        db: Session,
        document_id: int,
    ) -> Document | None:
        """
        Return a document by ID.

        This method does not enforce ownership and should only be
        used by trusted internal code.

        API-facing code should normally use get_document_by_id().
        """

        cls._validate_positive_int(
            document_id,
            field_name="document_id",
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

    @classmethod
    def get_document_by_id(
        cls,
        db: Session,
        document_id: int,
        user_id: int,
    ) -> Document | None:
        """
        Return a document only when it belongs to the specified user.

        This method should be preferred by authenticated API routes.
        """

        cls._validate_positive_int(
            document_id,
            field_name="document_id",
        )

        cls._validate_positive_int(
            user_id,
            field_name="user_id",
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

    @classmethod
    def get_document_by_filename(
        cls,
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

        cls._validate_positive_int(
            user_id,
            field_name="user_id",
        )

        if not isinstance(filename, str):
            raise TypeError(
                "filename must be a string."
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

    @classmethod
    def document_exists(
        cls,
        db: Session,
        user_id: int,
        filename: str,
    ) -> bool:
        """
        Return whether a user already owns a document with
        the supplied filename.
        """

        return (
            cls.get_document_by_filename(
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

        if not isinstance(document, Document):
            raise TypeError(
                "document must be a Document instance."
            )

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