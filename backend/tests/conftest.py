"""Test configuration: isolate imports from developer credentials and databases."""
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

# These values are deliberately synthetic and are only used by unit tests.
os.environ["DATABASE_URL"] = "postgresql+psycopg2://test:test@127.0.0.1:5432/test_auth"
os.environ["SECRET_KEY"] = "unit-test-secret-key-that-is-long-enough-for-testing"
os.environ["GROQ_API_KEY"] = "unit-test-key-not-valid-for-provider"
os.environ["ENVIRONMENT"] = "testing"
os.environ["DEBUG"] = "false"
os.environ["BACKEND_CORS_ORIGINS"] = '["http://localhost:5173"]'
