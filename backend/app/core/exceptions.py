from __future__ import annotations

from typing import Any

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.logger import logger


def _make_json_safe(value: Any) -> Any:
    """
    Recursively convert validation-error data into JSON-safe values.

    Pydantic validation errors may contain exception objects inside
    fields such as ``ctx``. Those objects cannot be serialized
    directly by JSONResponse.
    """

    if value is None or isinstance(
        value,
        (str, int, float, bool),
    ):
        return value

    if isinstance(value, dict):
        return {
            str(key): _make_json_safe(item)
            for key, item in value.items()
        }

    if isinstance(value, (list, tuple, set, frozenset)):
        return [
            _make_json_safe(item)
            for item in value
        ]

    if isinstance(value, BaseException):
        return str(value)

    return str(value)


def _validation_errors(
    exc: RequestValidationError,
) -> list[dict[str, Any]]:
    """
    Return Pydantic/FastAPI validation errors in a form that can
    always be serialized safely as JSON.
    """

    return [
        _make_json_safe(error)
        for error in exc.errors()
    ]


def add_exception_handlers(app: FastAPI) -> None:
    """
    Register application-wide exception handlers.

    The handlers provide a consistent public error format while
    preventing unexpected internal exception details from being
    exposed to API clients.
    """

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(
        request: Request,
        exc: StarletteHTTPException,
    ) -> JSONResponse:
        """
        Handle HTTP errors raised by FastAPI/Starlette.
        """

        if exc.status_code >= status.HTTP_500_INTERNAL_SERVER_ERROR:
            logger.error(
                "HTTP server error. method=%s path=%s status=%d",
                request.method,
                request.url.path,
                exc.status_code,
            )

        return JSONResponse(
            status_code=exc.status_code,
            content={
                "status": "error",
                "message": _make_json_safe(exc.detail),
            },
            headers=exc.headers,
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request,
        exc: RequestValidationError,
    ) -> JSONResponse:
        """
        Handle malformed or invalid request data.
        """

        logger.info(
            "Request validation failed. method=%s path=%s",
            request.method,
            request.url.path,
        )

        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            content={
                "status": "error",
                "message": "Validation failed.",
                "errors": _validation_errors(exc),
            },
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(
        request: Request,
        exc: Exception,
    ) -> JSONResponse:
        """
        Handle unexpected application errors without exposing
        implementation details to the client.
        """

        logger.exception(
            "Unhandled exception. method=%s path=%s",
            request.method,
            request.url.path,
        )

        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "status": "error",
                "message": "Internal server error.",
            },
        )