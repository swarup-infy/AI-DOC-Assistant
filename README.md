# AI Document Assistant

An AI-powered Document Intelligence application built with **FastAPI**, **PostgreSQL**, and **Python**. The project allows users to upload documents, extract text, and will progressively support semantic search and Retrieval-Augmented Generation (RAG).

---

## Features

### Authentication
- User Registration
- User Login
- JWT Authentication
- Protected Routes

### Document Processing
- PDF Upload
- Save Uploaded Files
- Extract Text from PDF using PyMuPDF

### Backend
- FastAPI
- SQLAlchemy ORM
- PostgreSQL
- Pydantic Validation
- Service Layer Architecture

---

## Tech Stack

- Python 3.14
- FastAPI
- PostgreSQL
- SQLAlchemy
- PyMuPDF
- Passlib (bcrypt)
- Python-JOSE (JWT)
- Pydantic
- Uvicorn

---

## Project Structure

```text
backend/
│
├── app/
│   ├── auth/
│   ├── core/
│   ├── db/
│   ├── ml/
│   ├── models/
│   ├── routes/
│   ├── schemas/
│   ├── services/
│   ├── vector_db/
│   ├── config.py
│   ├── database.py
│   └── main.py
│
├── uploads/
├── tests/
├── logs/
├── requirements.txt
└── .env
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/auth/me` | Get current authenticated user |

### Upload

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload/file` | Upload PDF and extract text |

---

## Current Progress

- Authentication System
- JWT Authorization
- PostgreSQL Integration
- PDF Upload
- PDF Text Extraction

---

## Planned Features

- DOCX Support
- CSV Support
- Excel Support
- Text Chunking
- Embedding Generation
- ChromaDB Integration
- Semantic Search
- RAG Chatbot
- Conversation Memory
- Document Summarization

---

## Installation

```bash
git clone https://github.com/your-username/AI-Document-Assistant.git

cd AI-Document-Assistant/backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

---

## Author

**Swarup Kar Chaudhuri**

B.Tech in Electrical Engineering

Currently learning Backend Development, Machine Learning, NLP, LLMs, and Retrieval-Augmented Generation (RAG).

---

## License

This project is developed for learning and portfolio purposes.