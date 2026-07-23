from fastapi import HTTPException, status
from pydantic import Field

def int_validator(
    value: int,
    min_value: int | None = None,
    max_value: int | None = None,
    duplicates: set[int] | None = None,
    field_name: str = "Value",
    min_value_error_detail: str | None = None,
    max_value_error_detail: str | None = None,
    duplicate_error_detail: str | None = None,
) -> int:
    """
    Validates an integer value.

    Checks that the value:
    - Is not lower than `min_value` if provided.
    - Is not greater than `max_value` if provided.
    - Is not present in `duplicates` if provided.

    Raises:
        HTTPException: With status code 400 when validation fails.

    Returns:
        The original integer value if validation succeeds.

    Args:
        value: Integer value to validate.
        min_value: Minimum allowed value (inclusive).
        max_value: Maximum allowed value (inclusive).
        duplicates: Set of integer values that are considered invalid duplicates.
        field_name: Display name used in default validation error messages.
        min_value_error_detail: Custom error message for values below `min_value`.
        max_value_error_detail: Custom error message for values above `max_value`.
        duplicate_error_detail: Custom error message for duplicate values.
    """
    if min_value is not None and value < min_value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=min_value_error_detail or f"{field_name} must be at least {min_value}."
        )

    if max_value is not None and value > max_value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=max_value_error_detail or f"{field_name} cannot exceed {max_value}."
        )

    if duplicates and value in duplicates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=duplicate_error_detail or f"{field_name} contains a duplicate value."
        )

    return value