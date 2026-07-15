import chromadb


class ChromaService:
    """
    Service for interacting with ChromaDB.
    """

    def __init__(self):
        self.client = chromadb.PersistentClient(
            path="app/vector_db/chroma_data"
        )

        self.collection = self.client.get_or_create_collection(
            name="documents"
        )

    def add_documents(
        self,
        ids: list[str],
        documents: list[str],
        embeddings: list[list[float]],
    ):
        """
        Store document chunks.
        """

        self.collection.add(
            ids=ids,
            documents=documents,
            embeddings=embeddings,
        )

    def search(
        self,
        query_embedding: list[float],
        n_results: int = 3,
    ):
        """
        Semantic search.
        """

        return self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results,
        )

    def delete_document_chunks(
        self,
        document_id: int,
    ):
        """
        Delete all chunks belonging to one document.
        """

        results = self.collection.get()

        ids_to_delete = [
            chunk_id
            for chunk_id in results["ids"]
            if chunk_id.startswith(f"{document_id}_")
        ]

        if ids_to_delete:
            self.collection.delete(
                ids=ids_to_delete
            )

        return len(ids_to_delete)