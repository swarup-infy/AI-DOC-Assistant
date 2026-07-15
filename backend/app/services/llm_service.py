from google import genai

from app.core.config import settings


class LLMService:
    """
    Service for interacting with Google Gemini.
    """

    def __init__(self):
        self.client = genai.Client(
            api_key=settings.GEMINI_API_KEY
        )

        self.model = "gemini-3.1-flash-lite"

    def generate_response(
        self,
        question: str,
        context: str
    ) -> str:
        """
        Generate an AI response using conversation history
        and retrieved document context.
        """

        prompt = f"""
You are an intelligent AI Document Assistant.

You are given:

1. Previous Conversation
2. Relevant Documents
3. The User's Question

Rules:

- First, check whether the answer exists in the Previous Conversation.
- If not, check the Relevant Documents.
- If the answer exists in either source, answer naturally.
- Do NOT invent facts.
- If the answer cannot be found in either the conversation history or the documents, reply exactly:

I couldn't find that information in the uploaded documents or previous conversation.

----------------------------------------

{context}

----------------------------------------

User Question:
{question}
"""

        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt
        )

        return response.text