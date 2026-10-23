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
- [ ] CI workflow executed successfully.
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
- [ ] JavaScript dependency audit: latest completed scan found 11 vulnerabilities (9 high, 2 moderate); remediate and rerun before merge.
- [ ] Python dependency audit rerun after dependency updates.
- [ ] ChromaDB 1.5.9 is flagged by current advisories with no published fixed version; keep it in embedded PersistentClient mode only and do not expose a Chroma server. This remains an open dependency risk until upstream remediation is available.
- [x] Gitleaks secret-scanning job is configured and passed on the observed CI run.
- [ ] Container image scanning (no container build configuration is present in this branch).
- [ ] OWASP ZAP scan against an isolated running instance.
- [ ] WCAG 2.2 AA manual review.
- [ ] Production deployment and TLS configuration reviewed.

## Merge gate
Do not call this production-ready until the unverified items are either implemented and tested or explicitly accepted with documented risk. Never run destructive DAST against production.
