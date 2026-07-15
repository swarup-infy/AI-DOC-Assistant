from app.services.retriever import Retriever


class ChatService:
    """
    Handles document retrieval for AI chat.
    """

    def __init__(self):
        self.retriever = Retriever()

    def get_context(
        self,
        question: str,
    ):
        """
        Retrieve relevant document chunks.
        """

        chunks = self.retriever.retrieve(
            query=question,
            top_k=5,
        )

        if not chunks:
            return "No relevant information found."

        return "\n\n".join(chunks)