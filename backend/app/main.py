from fastapi import FastAPI
from app.routes import auth, upload
from app.database import Base, engine
from app.models.user import User

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Document Intelligence API",
    description="Backend for AI Document Assistant",
    version="1.0.0"
)

app.include_router(auth.router)
app.include_router(upload.router)   # <-- Add this line

@app.get("/")
def home():
    return {
        "status": "success",
        "message": "Welcome to AI Document Intelligence API"
    }