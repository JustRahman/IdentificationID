from fastapi import Request
from fastapi.responses import JSONResponse


class AppException(Exception):
    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = 400,
        details: dict | None = None,
    ):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details or {}


class NotFound(AppException):
    def __init__(self, message: str = "Resource not found", details: dict | None = None):
        super().__init__("NOT_FOUND", message, 404, details)


class Unauthorized(AppException):
    def __init__(self, message: str = "Unauthorized", details: dict | None = None):
        super().__init__("UNAUTHORIZED", message, 401, details)


class Forbidden(AppException):
    def __init__(self, message: str = "Forbidden", details: dict | None = None):
        super().__init__("FORBIDDEN", message, 403, details)


class Conflict(AppException):
    def __init__(self, message: str = "Conflict", details: dict | None = None):
        super().__init__("CONFLICT", message, 409, details)


class RateLimited(AppException):
    def __init__(self, message: str = "Too many requests, try again later"):
        super().__init__("RATE_LIMITED", message, 429)


class ValidationError(AppException):
    def __init__(self, message: str = "Validation error", details: dict | None = None):
        super().__init__("VALIDATION_ERROR", message, 422, details)


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": exc.code,
                "message": exc.message,
                "details": exc.details,
            },
        },
    )
