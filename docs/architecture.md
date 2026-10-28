# Architecture and Authentication Status

## Current application architecture

- Frontend: React, TypeScript, Vite, React Router, React Hook Form, and Zod.
- Backend: FastAPI route handlers, Pydantic schemas, SQLAlchemy ORM, and Alembic migrations.
- Persistence: PostgreSQL in the configured deployment.
- Existing authentication: email/password, bcrypt-compatible password verification, signed JWT access tokens, and a bearer token currently stored in browser localStorage.
- Product services: document uploads, text extraction, embeddings/vector search, and Groq-powered document chat.

## Changes in this branch

- Authentication pages use a slate-blue, burgundy, dusty-rose, and muted-teal design system.
- Added subtle SVG noise/grain, an editorial grid, reduced-motion support, and an abstract sculptural SVG.
- New password hashes use Argon2 through Passlib; existing bcrypt hashes remain verifiable.
- Added API response security headers.
- Added unit tests for password hashing, JWT token validation, and security headers.
- Added CI for frontend lint/build, backend unit tests, and dependency audits.

## Important current limitations

This branch does **not** yet implement opaque database-backed sessions, HttpOnly session cookies, CSRF tokens, email verification, password-reset delivery, OAuth, or production-grade shared rate limiting. The current bearer token in localStorage remains exposed to successful XSS and must be replaced before claiming production-grade session security. Email uniqueness and user account state continue to follow the existing schema and migration history.

The tests in this branch are focused unit tests; they are not end-to-end proof of authentication security. The CI pipeline must execute successfully and any dependency audit findings must be triaged before merge.
