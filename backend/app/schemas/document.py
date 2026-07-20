from datetime import datetime
from pydantic import BaseModel, ConfigDict


class DocumentResponse(BaseModel):
    id: int
    filename: str
    file_type: str
    file_size: int
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)