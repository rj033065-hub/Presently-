from fastapi import HTTPException, status
from typing import Any, Dict, Optional


class BaseAPIException(HTTPException):
    def __init__(
        self,
        status_code: int,
        code: str,
        message: str,
        details: Optional[Any] = None,
    ):
        super().__init__(
            status_code=status_code,
            detail={"code": code, "message": message, "details": details},
        )


class ResourceNotFoundException(BaseAPIException):
    def __init__(self, resource_name: str = "Resource", identifier: Any = ""):
        message = f"{resource_name} with identifier '{identifier}' was not found." if identifier else f"{resource_name} was not found."
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            code="RESOURCE_NOT_FOUND",
            message=message,
        )


class PermissionDeniedException(BaseAPIException):
    def __init__(self, message: str = "You do not have permission to perform this action."):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            code="FORBIDDEN_ACTION",
            message=message,
        )


class ValidationException(BaseAPIException):
    def __init__(self, message: str = "Validation error occurred.", details: Optional[Any] = None):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            code="VALIDATION_ERROR",
            message=message,
            details=details,
        )


class ConflictException(BaseAPIException):
    def __init__(self, message: str = "Resource conflict occurred."):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            code="RESOURCE_CONFLICT",
            message=message,
        )


# Convenience Exception Aliases
class NotFoundException(ResourceNotFoundException):
    def __init__(self, message: str = "Resource not found."):
        super().__init__(resource_name="Resource", identifier="")
        self.detail = {"code": "NOT_FOUND", "message": message}


class ForbiddenException(PermissionDeniedException):
    def __init__(self, message: str = "Forbidden action."):
        super().__init__(message=message)


class BadRequestException(ValidationException):
    def __init__(self, message: str = "Bad request."):
        super().__init__(message=message)
