from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.core.logger import logger
from app.models.document import Document


class DocumentService:
    """
    Service for managing uploaded documents.
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

        existing_document = (
            db.query(Document)
            .filter(
                Document.user_id == user_id,
                Document.filename == filename,
            )
            .first()
        )

        if existing_document:
            logger.info(f"Duplicate document skipped: {filename}")
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

            logger.info(f"Document created: {document.id}")

            return document

        except SQLAlchemyError:
            db.rollback()
            logger.exception("Database error while creating document.")
            raise

    @staticmethod
    def get_documents(
        db: Session,
        user_id: int,
    ):

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
    ):

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
    ):

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
    ):

        try:
            db.delete(document)
            db.commit()

            logger.info(f"Deleted document {document.id}")

            return True

        except SQLAlchemyError:
            db.rollback()
            logger.exception("Database error while deleting document.")
            raise