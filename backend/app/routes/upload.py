from fastapi import APIRouter, UploadFile, File
from app.services.upload_service import save_uploaded_file

router = APIRouter(
    prefix="/api/upload",
    tags=["Upload"]
)

@router.post("/file")
async def upload_file(file: UploadFile = File(...)):
    result = save_uploaded_file(file)

    return {
        "message": "File uploaded successfully",
        "filename": file.filename,
        "saved_to": str(result["file_path"]),
        "extracted_text": result["text"]
    }