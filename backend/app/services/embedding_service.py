from sentence_transformers import SentenceTransformer


class EmbeddingService:
    """
    Service for generating sentence embeddings.
    """

    def __init__(self):
        self.model = SentenceTransformer(
            "sentence-transformers/all-MiniLM-L6-v2"
        )

    def create_embeddings(self, chunks: list[str]) -> list[list[float]]:
        """
        Convert text chunks into embeddings.
        """
        embeddings = self.model.encode(
            chunks,
            convert_to_numpy=True
        )

        return embeddings.tolist()