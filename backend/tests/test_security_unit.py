from datetime import timedelta

from fastapi import FastAPI
from fastapi.testclient import TestClient
from passlib.context import CryptContext

from app.core.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)
from app.core.security_headers import SecurityHeadersMiddleware


def test_password_hash_is_not_plaintext_and_verifies() -> None:
    password = "a long test passphrase 2026!"
    hashed = hash_password(password)

    assert hashed != password
    assert hashed.startswith("$argon2id$")
    assert verify_password(password, hashed)
    assert not verify_password("a different passphrase", hashed)


def test_legacy_bcrypt_password_hash_remains_verifiable() -> None:
    legacy_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    legacy_hash = legacy_context.hash("Legacy-passphrase-2026!")

    assert verify_password("Legacy-passphrase-2026!", legacy_hash)
    assert not verify_password("wrong-password", legacy_hash)


def test_access_token_round_trip_and_type_validation() -> None:
    token = create_access_token(
        {"sub": "person@example.com"},
        expires_delta=timedelta(minutes=5),
    )

    payload = decode_access_token(token)

    assert payload is not None
    assert payload["sub"] == "person@example.com"
    assert payload["type"] == "access"


def test_invalid_and_non_token_strings_are_rejected() -> None:
    assert decode_access_token("") is None
    assert decode_access_token("not-a-jwt") is None


def test_security_headers_are_added_to_responses() -> None:
    app = FastAPI()
    app.add_middleware(SecurityHeadersMiddleware)

    @app.get("/health-test")
    def health_test() -> dict[str, str]:
        return {"status": "ok"}

    response = TestClient(app).get("/health-test")

    assert response.status_code == 200
    assert response.headers["x-content-type-options"] == "nosniff"
    assert response.headers["x-frame-options"] == "DENY"
    assert response.headers["referrer-policy"] == "strict-origin-when-cross-origin"
    assert "frame-ancestors 'none'" in response.headers["content-security-policy"]
