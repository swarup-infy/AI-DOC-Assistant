# Authentication Threat Model

## Assets
- User credentials and password hashes.
- JWT bearer tokens and authenticated API access.
- Uploaded documents, extracted text, embeddings, and chat history.
- Account email addresses and profile data.
- Database credentials, application signing key, and Groq API credentials.

## Trust boundaries
1. Browser to frontend origin.
2. Frontend to FastAPI API origin.
3. FastAPI to PostgreSQL.
4. FastAPI to the LLM provider and embedding/vector-store components.
5. Deployment platform, CI runner, and secret configuration.

## Key threats and current mitigations

| Threat | Current mitigation | Residual risk |
|---|---|---|
| Password database disclosure | New password hashes use Argon2; bcrypt hashes remain verifiable | Existing hashes are not automatically upgraded on successful login |
| JWT tampering or expiry bypass | JWT signature, expiry, and token-type validation | No server-side session record or immediate revocation |
| Token theft via XSS | Existing React UI should use safe rendering patterns | Token is currently stored in localStorage; migrate to HttpOnly cookies |
| Clickjacking and MIME sniffing | API response security headers added | Headers on API responses do not automatically protect separately hosted frontend pages |
| Cross-site request forgery | CORS allowlist exists | Cookie-based auth/CSRF architecture is not yet implemented |
| Credential stuffing | No verified shared production limiter in this branch | Add shared-store rate limits and test them |
| Account enumeration | Login error is generic for incorrect credentials | Registration duplicate-email responses are distinct; reset flow does not yet exist |
| Account takeover through reset/verification | Not implemented | Add hashed, single-use, expiring tokens and verified delivery |
| Cross-user resource access | Existing routes must be reviewed endpoint-by-endpoint | Authorization integration tests are not yet comprehensive |
| Vulnerable dependencies | CI audit steps added | Results are unverified until workflow completes |

## Required next controls
1. Replace localStorage bearer tokens with server-side opaque sessions and HttpOnly/Secure/SameSite cookies.
2. Add CSRF protection and exact origin validation for state-changing cookie-authenticated requests.
3. Add email verification and password recovery with hashed, expiring, single-use tokens and a real email provider.
4. Add shared-store rate limiting and security-event monitoring.
5. Add multi-user authorization integration tests and isolated DAST.
6. Complete a deployment-specific review of TLS, trusted proxy settings, CORS, secrets, backup recovery, and retention.

Do not treat this document as an independent security assessment or compliance certification.
