# Deployment Notes

## Local development
1. Install Python 3.13 and Node.js 22.
2. Configure backend environment variables using a local, untracked .env file. Required settings include DATABASE_URL, SECRET_KEY, and GROQ_API_KEY.
3. Install backend dependencies: cd backend, then python -m pip install -r requirements.txt.
4. Apply existing migrations deliberately with alembic upgrade head from the backend directory.
5. Start the API with uvicorn app.main:app --reload.
6. Install frontend dependencies with cd frontend and npm ci.
7. Start the frontend with npm run dev.

## Verification commands

Backend unit tests:
```powershell
Set-Location backend
pytest -q
```

Frontend lint and production build:
```powershell
Set-Location frontend
npm ci
npm run lint
npm run build
```

Dependency audits:
```powershell
Set-Location backend
pip-audit -r requirements.txt
Set-Location ../frontend
npm audit --audit-level=high
```

## Production cautions
- Use a managed secret store or deployment environment variables; never commit .env.
- Set ENVIRONMENT=production, keep DEBUG=false, use a strong unique SECRET_KEY, and configure exact frontend origins.
- Terminate TLS at the trusted hosting platform or reverse proxy and confirm forwarded-header handling before enabling HSTS.
- Run Alembic migrations as a controlled release step, not from every application worker.
- Configure real email delivery before offering verification or recovery flows.
- This branch does not yet provide server-side sessions, email verification, password reset, Redis rate limiting, or a complete production deployment. These are explicit blockers to production-grade authentication.
