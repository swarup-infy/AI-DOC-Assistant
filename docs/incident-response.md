# Incident Response: Authentication and Document Access

## Initial response
1. Confirm the alert and preserve relevant sanitized logs and timestamps.
2. Identify affected services, accounts, sessions, documents, and deployment versions.
3. Restrict access or disable affected credentials where necessary.
4. Rotate compromised application, database, email-provider, or LLM-provider secrets through the deployment secret manager.
5. If bearer tokens may have been exposed, account for the current limitation that JWTs are not tracked in a server-side revocation store; rotate signing keys only with a coordinated plan for invalidating all existing tokens.
6. Preserve evidence while avoiding collection of passwords, bearer tokens, reset tokens, or full authentication headers.

## Recovery
- Patch the root cause and add a regression test.
- Review access to documents and chat history for unauthorized cross-account access.
- Restore service from a known-good release and verify database integrity.
- Notify affected users and relevant parties where legally required.
- Record impact, timeline, remediation, and residual risk.

## Follow-up
Run the relevant test suite, dependency scans, secret scanning, and isolated dynamic testing. Update the threat model and checklist. Do not claim closure until the fix is deployed and verified.
