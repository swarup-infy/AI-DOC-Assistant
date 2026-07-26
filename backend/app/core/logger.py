from __future__ import annotations

import logging
import sys
from logging.handlers import RotatingFileHandler
from pathlib import Path

# ==========================================================
# Log Directory
# ==========================================================

LOG_DIR = Path("logs")
LOG_DIR.mkdir(parents=True, exist_ok=True)

LOG_FILE = LOG_DIR / "app.log"

# ==========================================================
# Logger
# ==========================================================

logger = logging.getLogger("ai_document_assistant")
logger.setLevel(logging.INFO)
logger.propagate = False

# ==========================================================
# Formatter
# ==========================================================

formatter = logging.Formatter(
    fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

# ==========================================================
# Console Handler
# ==========================================================

console_handler = logging.StreamHandler(sys.stdout)
console_handler.setFormatter(formatter)

# ==========================================================
# File Handler
# ==========================================================

file_handler = RotatingFileHandler(
    filename=LOG_FILE,
    maxBytes=5 * 1024 * 1024,  # 5 MB
    backupCount=5,
    encoding="utf-8",
)

file_handler.setFormatter(formatter)

# ==========================================================
# Prevent Duplicate Handlers
# ==========================================================

if not logger.handlers:
    logger.addHandler(console_handler)
    logger.addHandler(file_handler)