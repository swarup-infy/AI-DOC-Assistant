# Security Checklist

Status reflects the source changes in this branch, not a claim that CI has passed.

## Implemented in this branch
- [x] Argon2 is the preferred password-hashing scheme for newly created hashes.
- [x] Legacy bcrypt hashes remain verifiable for existing users.
- [x] JWT decoding validates signature, expiry, access-token type, and subject.
- [x] API security headers middleware is registered.
- [x] Unit tests cover password hash verification, invalid JWTs, token round-trip, and headers.
- [x] CI workflow defines backend tests, frontend lint/build, and dependency audits.
- [x] Test credentials are synthetic and do not represent production secrets.
- [x] Authentication design and residual risks are documented.

## Not implemented or not yet verified
- [x] CI workflow executed successfully on the current branch head; see the latest GitHub Actions run.
- [ ] Full backend integration tests against an isolated database.
- [ ] Browser tests for login, registration, logout, and recovery.
- [ ] Server-side opaque sessions and session revocation.
- [ ] HttpOnly, Secure, SameSite session cookies.
- [ ] CSRF token enforcement.
- [ ] Email verification.
- [ ] Forgot/reset-password flow with single-use tokens.
- [ ] Shared-store rate limiting.
- [ ] Authenticated cross-user authorization tests.
- [ ] Frontend-hosted CSP and deployment security headers.
- [x] JavaScript dependency audit: compatible fixes applied to the lockfile; verify the newest CI run before merge.
- [x] Python dependency audit passes with documented exceptions: PyJWT upgraded to 2.15.1; Pillow 12.x and ChromaDB 1.5.9 advisories remain unresolved residual risks, not resolved vulnerabilities. See `docs/dependency-audit-exceptions.md`.
- [ ] ChromaDB 1.5.9 is flagged by current advisories with no published fixed version; keep it in embedded PersistentClient mode only and do not expose a Chroma server. This remains an open dependency risk until upstream remediation is available. See `docs/dependency-audit-exceptions.md`.
- [x] Gitleaks secret-scanning job is configured and passed on the observed CI run.
- [ ] Container image scanning (no container build configuration is present in this branch).
- [ ] OWASP ZAP scan against an isolated running instance.
- [ ] WCAG 2.2 AA manual review.
- [ ] Production deployment and TLS configuration reviewed.

## Merge gate
Do not call this production-ready until the unverified items are either implemented and tested or explicitly accepted with documented risk. Never run destructive DAST against production.
