from app.services.embedding_service import EmbeddingService
from app.vector_db.chroma_service import ChromaService


class Retriever:
    """
    Retrieve relevant document chunks
    using semantic similarity search.
    """

    def __init__(self):
        self.embedding_service = EmbeddingService()
        self.chroma = ChromaService()

    def retrieve(
        self,
        query: str,
        top_k: int = 5,
    ):
        """
        Retrieve the most relevant
        document chunks.
        """

        query_embedding = self.embedding_service.create_embeddings(
            [query]
        )[0]

        results = self.chroma.search(
            query_embedding=query_embedding,
            n_results=top_k,
        )

        documents = results.get("documents", [[]])[0]

        return documents
        