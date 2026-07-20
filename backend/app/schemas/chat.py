from typing import Literal
from pydantic import BaseModel


class ChatRequest(BaseModel):
    question: str
    mode: Literal["document", "gemini", "smart"] = "document"