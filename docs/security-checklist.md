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
- [ ] Dependency audit findings reviewed and resolved.
- [ ] Secret scanning and container image scanning.
- [ ] OWASP ZAP scan against an isolated running instance.
- [ ] WCAG 2.2 AA manual review.
- [ ] Production deployment and TLS configuration reviewed.

## Merge gate
Do not call this production-ready until the unverified items are either implemented and tested or explicitly accepted with documented risk. Never run destructive DAST against production.
