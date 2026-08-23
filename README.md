# AI Document Assistant

> A backend-first document intelligence platform — built to evolve from PDF ingestion into a full Retrieval-Augmented Generation (RAG) system.

[![Python](https://img.shields.io/badge/Python-3.14-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-API-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-ORM-D71F00)](https://www.sqlalchemy.org/)
[![Status](https://img.shields.io/badge/Status-Active%20Development-brightgreen)](#project-status)
[![License](https://img.shields.io/badge/License-Learning%20Project-lightgrey)](#license)

---

## Overview

Most organizations sit on large volumes of unstructured content — PDFs, reports, spreadsheets — that are easy to store but hard to *use*. **AI Document Assistant** is an attempt to close that gap: a system that lets users upload a document and, over time, search it, question it, and get grounded, source-aware answers back.

The project is being built incrementally and deliberately. What exists today is a production-style backend foundation — authentication, protected APIs, and a working PDF ingestion pipeline. What's coming next is the AI layer: chunking, embeddings, vector search, and a full RAG pipeline sitting on top of it.

```
Document → Upload → Text Extraction → Processing → Chunking
   → Embeddings → Vector Store → Semantic Retrieval → LLM → Answer
```

---

## Table of Contents

- [Why This Project](#why-this-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
- [Security](#security)
- [Testing](#testing)
- [Roadmap](#roadmap)
- [Engineering Principles](#engineering-principles)
- [Project Status](#project-status)
- [Live Demo](#live-demo)
- [Author](#author)
- [License](#license)

---

## Why This Project

Document intelligence systems are one of the most practical, in-demand applications of modern AI — and also one of the best ways to learn how real backend and ML infrastructure fits together. This project is my hands-on exploration of that intersection: not a tutorial clone, but a system built the way I'd want a production service to be built — modular, secure by design, and extensible enough to grow from "upload a PDF" into a genuine RAG-powered assistant.

---

## Features

### Authentication & Authorization
- User registration and secure login
- JWT-based authentication with protected routes
- Password hashing via bcrypt
- Authenticated user profile endpoint

### Document Processing
- PDF upload with server-side persistence
- Text extraction using PyMuPDF
- Extensible processing pipeline designed for additional file types

### Backend Architecture
- FastAPI REST API with a clean service-layer design
- PostgreSQL persistence via SQLAlchemy ORM
- Pydantic-based request/response validation
- Modular, environment-configured application structure

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Python 3.14 |
| API Framework | FastAPI |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Validation | Pydantic |
| PDF Processing | PyMuPDF |
| Authentication | JWT (python-jose) |
| Password Hashing | Passlib / bcrypt |
| ASGI Server | Uvicorn |
| Vector Store *(planned)* | ChromaDB |
| AI Pipeline *(planned)* | Embeddings + LLM + RAG |

---

## Architecture

**Current pipeline:**

```
PDF → Upload → PyMuPDF → Extracted Text → Database
```

**Target architecture:**

```
                     ┌──────────────────┐
                     │       Client      │
                     └─────────┬─────────┘
                               │
                               ▼
                     ┌──────────────────┐
                     │    FastAPI API    │
                     └─────────┬─────────┘
                               │
                ┌──────────────┴──────────────┐
                ▼                              ▼
        ┌──────────────┐              ┌──────────────────┐
        │  PostgreSQL   │              │ Document Pipeline │
        └──────────────┘              └─────────┬─────────┘
                                                 │
                                                 ▼
                                        ┌──────────────┐
                                        │   Chunking    │
                                        └──────┬───────┘
                                               ▼
                                        ┌──────────────┐
                                        │  Embeddings   │
                                        └──────┬───────┘
                                               ▼
                                        ┌──────────────┐
                                        │ Vector Store  │
                                        └──────┬───────┘
                                               ▼
                                        ┌──────────────┐
                                        │Semantic Search│
                                        └──────┬───────┘
                                               ▼
                                        ┌──────────────┐
                                        │      LLM      │
                                        └──────┬───────┘
                                               ▼
                                        ┌──────────────┐
                                        │  RAG Answer   │
                                        └──────────────┘
```

---

## Project Structure

```text
AI-DOC-Assistant/
│
├── backend/
│   ├── app/
│   │   ├── auth/          # Authentication logic
│   │   ├── core/          # Core application configuration
│   │   ├── db/            # Database-related components
│   │   ├── ml/            # Machine learning / AI pipeline
│   │   ├── models/        # SQLAlchemy database models
│   │   ├── routes/        # API route definitions
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # Business logic
│   │   ├── vector_db/     # Vector database integration
│   │   ├── config.py
│   │   ├── database.py
│   │   └── main.py
│   │
│   ├── uploads/
│   ├── tests/
│   ├── logs/
│   ├── requirements.txt
│   └── .env
│
└── README.md
```

---

## API Reference

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user account |
| `POST` | `/api/auth/login` | Authenticate and receive a JWT |
| `GET` | `/api/auth/me` | Retrieve the current authenticated user |

### Documents

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/upload/file` | Upload a PDF and extract its text |

> Interactive API documentation (Swagger UI) is available at `/docs` once the server is running.

---

## Getting Started

### Prerequisites

- Python 3.14+
- PostgreSQL
- Git

### 1. Clone the repository

```bash
git clone https://github.com/swarup-infy/AI-DOC-Assistant.git
cd AI-DOC-Assistant
```

### 2. Create a virtual environment

```bash
cd backend
python -m venv venv
```

**Windows**
```bash
venv\Scripts\activate
```

**macOS / Linux**
```bash
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Create a `.env` file inside the `backend` directory:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/ai_document_assistant
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

> **Note:** Never commit real credentials, API keys, or secrets to version control.

### 5. Set up PostgreSQL

```sql
CREATE DATABASE ai_document_assistant;
```

Update `DATABASE_URL` in `.env` to match your local configuration.

### 6. Run the API

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`, with interactive docs at `http://127.0.0.1:8000/docs`.

---

## Security

Security is treated as a core design consideration, not an afterthought.

**Implemented:**
- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- Environment-based secret management
- Request validation via Pydantic

**Planned:**
- File type and size validation
- Secure file naming
- Rate limiting
- Refresh-token rotation
- Expanded authorization policies
- Production-grade secret management
- Structured audit logging

---

## Testing

Tests live under `backend/tests/` and run via:

```bash
pytest
```

Coverage is intended to expand across authentication, authorization, API validation, document uploads, text extraction, database interactions, service-layer logic, and — eventually — RAG retrieval quality.

---

## Roadmap

**Phase 1 — Backend Foundation** ✅
- [x] Project structure & FastAPI application
- [x] PostgreSQL + SQLAlchemy integration
- [x] Authentication & JWT authorization
- [x] PDF upload & text extraction

**Phase 2 — Document Intelligence**
- [ ] DOCX / CSV / Excel support
- [ ] Document metadata & versioning
- [ ] Text normalization & chunking

**Phase 3 — Semantic Search**
- [ ] Embedding generation
- [ ] ChromaDB integration
- [ ] Similarity search & metadata filtering
- [ ] Retrieval evaluation

**Phase 4 — RAG**
- [ ] LLM integration & prompt orchestration
- [ ] Context retrieval
- [ ] Conversational memory
- [ ] Source-aware, cited responses
- [ ] Document summarization

**Phase 5 — Production Readiness**
- [ ] Dockerization & CI/CD
- [ ] Automated testing & observability
- [ ] Rate limiting & API versioning
- [ ] Performance benchmarking & deployment

---

## Engineering Principles

**Separation of Concerns** — API routes, business logic, database models, schemas, and AI components each live in their own module.

**Extensibility** — Document processing and AI functionality are structured so new file formats, embedding models, and LLM providers can be added without a redesign.

**Security by Design** — Authentication, authorization, and secret management are treated as architectural concerns from day one.

**Incremental Development** — The system is built in deliberate stages, starting with a reliable backend before layering on vector search and generative AI.

---

## Project Status

🚧 **Active Development**

The core backend and document ingestion pipeline are implemented and working. Semantic search and RAG capabilities are in active development.

---

## Live Demo

A deployed version is available at: **[ai-doc-assistant-three.vercel.app](https://ai-doc-assistant-nu.vercel.app/login)**

> The live application will continue to evolve as new backend and AI capabilities are added.

---

## Author

**Swarup Kar Chaudhuri**
B.Tech, Electrical Engineering

Interested in Backend Engineering, Machine Learning, NLP, LLMs, Retrieval-Augmented Generation, Distributed Systems, and AI Infrastructure.

---

## License

This project is developed for learning, experimentation, and portfolio purposes. See the repository for applicable license and usage terms.
