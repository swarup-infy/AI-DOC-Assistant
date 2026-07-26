from __future__ import annotations

from typing import Optional

from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.logger import logger
from app.models.document import Document


class DocumentService:
    """
    Service responsible for CRUD operations on documents.
    """

    @staticmethod
    def create_document(
        db: Session,
        user_id: int,
        filename: str,
        file_path: str,
        file_type: str,
        file_size: int,
        chroma_collection: str = "documents",
    ) -> Document:
        """
        Create a document record.

        If a document with the same filename already exists for the
        same user, return the existing document instead.
        """

        existing_document = (
            db.query(Document)
            .filter(
                Document.user_id == user_id,
                func.lower(Document.filename) == filename.lower(),
            )
            .first()
        )

        if existing_document:
            logger.info(
                "Duplicate document skipped for user %s: %s",
                user_id,
                filename,
            )
            return existing_document

        try:
            document = Document(
                user_id=user_id,
                filename=filename,
                file_path=file_path,
                file_type=file_type,
                file_size=file_size,
                chroma_collection=chroma_collection,
            )

            db.add(document)
            db.commit()
            db.refresh(document)

            logger.info(
                "Document created successfully (id=%s)",
                document.id,
            )

            return document

        except SQLAlchemyError:
            db.rollback()
            logger.exception(
                "Database error while creating document."
            )
            raise

    @staticmethod
    def get_documents(
        db: Session,
        user_id: int,
    ) -> list[Document]:
        """
        Return all documents belonging to a user.
        """

        return (
            db.query(Document)
            .filter(Document.user_id == user_id)
            .order_by(Document.uploaded_at.desc())
            .all()
        )

    @staticmethod
    def get_document(
        db: Session,
        document_id: int,
    ) -> Optional[Document]:
        """
        Return a document by ID.
        """

        return (
            db.query(Document)
            .filter(Document.id == document_id)
            .first()
        )

    @staticmethod
    def get_document_by_id(
        db: Session,
        document_id: int,
        user_id: int,
    ) -> Optional[Document]:
        """
        Return a document only if it belongs to the specified user.
        """

        return (
            db.query(Document)
            .filter(
                Document.id == document_id,
                Document.user_id == user_id,
            )
            .first()
        )

    @staticmethod
    def delete_document(
        db: Session,
        document: Document,
    ) -> bool:
        """
        Delete a document.
        """

        try:
            db.delete(document)
            db.commit()

            logger.info(
                "Document deleted successfully (id=%s)",
                document.id,
            )

            return True

        except SQLAlchemyError:
            db.rollback()
            logger.exception(
                "Database error while deleting document."
            )
            raise   