from __future__ import annotations

import logging
import sys
from logging.handlers import RotatingFileHandler
from pathlib import Path

from app.core.config import settings


# ==========================================================
# Constants
# ==========================================================

LOGGER_NAME = "ai_document_assistant"

LOG_FILE_NAME = "app.log"

MAX_LOG_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

BACKUP_COUNT = 5


# ==========================================================
# Log Directory
# ==========================================================

LOG_DIR = Path(settings.LOG_DIR)

LOG_DIR.mkdir(
    parents=True,
    exist_ok=True,
)

LOG_FILE = LOG_DIR / LOG_FILE_NAME


# ==========================================================
# Formatter
# ==========================================================

formatter = logging.Formatter(
    fmt=(
        "%(asctime)s | "
        "%(levelname)-8s | "
        "%(name)s | "
        "%(message)s"
    ),
    datefmt="%Y-%m-%d %H:%M:%S",
)


# ==========================================================
# Logger
# ==========================================================

logger = logging.getLogger(
    LOGGER_NAME
)

log_level = getattr(
    logging,
    settings.LOG_LEVEL.upper(),
    logging.INFO,
)

logger.setLevel(
    log_level
)

logger.propagate = False


# ==========================================================
# Handler Configuration
# ==========================================================


def _configure_logger() -> None:
    """
    Configure application logging.

    Adds console and rotating-file handlers once, preventing
    duplicate log messages when modules are imported repeatedly.
    """

    if logger.handlers:
        return

    # ------------------------------------------------------
    # Console Handler
    # ------------------------------------------------------

    console_handler = logging.StreamHandler(
        sys.stdout
    )

    console_handler.setLevel(
        log_level
    )

    console_handler.setFormatter(
        formatter
    )

    # ------------------------------------------------------
    # Rotating File Handler
    # ------------------------------------------------------

    file_handler = RotatingFileHandler(
        filename=LOG_FILE,
        maxBytes=MAX_LOG_FILE_SIZE,
        backupCount=BACKUP_COUNT,
        encoding="utf-8",
    )

    file_handler.setLevel(
        log_level
    )

    file_handler.setFormatter(
        formatter
    )

    # ------------------------------------------------------
    # Register Handlers
    # ------------------------------------------------------

    logger.addHandler(
        console_handler
    )

    logger.addHandler(
        file_handler
    )


_configure_logger()