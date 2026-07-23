import regex

from fastapi import HTTPException, status


def string_validator(
    value: str,
    min_length: int | None = None,
    max_length: int | None = None,
    allowed_characters_regex: str | None = None,
    duplicates: set[str] | None = None,
    trim_whitespace: bool = False,
    field_name: str = "Value",
    min_length_error_detail: str | None = None,
    max_length_error_detail: str | None = None,
    allowed_characters_regex_error_detail: str | None = None,
    duplicate_error_detail: str | None = None,
) -> str:
    """
    Validates a string value.

    Checks that the value:
    - Has at least `min_length` characters if provided.
    - Does not exceed `max_length` characters if provided.
    - Matches `allowed_characters_regex` if provided.
    - Is not present in `duplicates` if provided.
    - Optionally trims leading and trailing whitespace.

    Raises:
        HTTPException: With status code 400 when validation fails.

    Returns:
        The validated string value. If `trim_whitespace` is enabled,
        the returned value will have leading and trailing whitespace removed.

    Args:
        value: String value to validate.
        min_length: Minimum allowed string length (inclusive).
        max_length: Maximum allowed string length (inclusive).
        allowed_characters_regex: Regex pattern that the string must match.
        duplicates: Set of strings that are considered invalid duplicates.
        trim_whitespace: Whether leading and trailing whitespace should be removed.
        field_name: Display name used in default validation error messages.
        min_length_error_detail: Custom error message for strings shorter than `min_length`.
        max_length_error_detail: Custom error message for strings longer than `max_length`.
        allowed_characters_regex_error_detail: Custom error message when the regex does not match.
        duplicate_error_detail: Custom error message for duplicate values.
    """

    if trim_whitespace:
        value = value.strip()

    if min_length is not None and len(value) < min_length:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=min_length_error_detail or (
                f"{field_name} must be at least {min_length} characters long."
            )
        )

    if max_length is not None and len(value) > max_length:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=max_length_error_detail or (
                f"{field_name} length cannot exceed {max_length} characters."
            )
        )

    if allowed_characters_regex and not regex.match(allowed_characters_regex, value):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=allowed_characters_regex_error_detail or (
                f"{field_name} contains illegal characters."
            )
        )

    if duplicates and value in duplicates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=duplicate_error_detail or (
                f"{field_name} contains a duplicate value."
            )
        )

    return value

def username_validator(value: str):
    """
    Validates username.
    Requirements:
    - 3 to 24 characters.
    - All lowercase
    - Must begin with a letter.
    - Remaining characters may include letters, digits, spaces,
      underscores (_), hyphens (-), and periods (.).
    - Raises an HTTP 400 exception if validation fails.
    """
    
    return string_validator(
        value,
        min_length=3,
        max_length=24,
        allowed_characters_regex=r"^[a-z][a-z0-9_.-]*$",
        field_name="Username",
        allowed_characters_regex_error_detail=(
            "Username must start with a letter and only contain "
            "alphanumeric characters, underscores, hyphens and periods. "
            "All letters must be lowercase."
        )
    )
    
def name_validator(value: str, max_length: int = 50):
    """
    Validates human-readable resource names.
    Requirements:
    - 3 to `max_length` characters long (default: 50).
    - Begins with a Unicode letter.
    - Remaining characters may include Unicode letters, digits, spaces,
    underscores (_), hyphens (-), and periods (.).
    - Raises an HTTP 400 exception if validation fails.
    s"""
    return string_validator(
        value,
        min_length=3,
        max_length=max_length,
        allowed_characters_regex=r"^\p{L}[\p{L}\p{N}_ .-]*$",
        trim_whitespace=True,
        field_name="Name",
        allowed_characters_regex_error_detail=(
            "Name must start with a letter and only contain "
            "alphanumeric characters, spaces, underscores, hyphens and periods."
        )
    )


def short_name_validator(value: str):
    """
    Validates short resource names.
    Requirements:
    - 3 to 24 characters long.
    - Begins with a Unicode letter.
    - Remaining characters may include Unicode letters, digits, spaces,
    underscores (_), hyphens (-), and periods (.).
    - Raises an HTTP 400 exception if validation fails.
    """
    return name_validator(value, max_length=24)


def long_name_validator(value: str):
    """
    Validates long resource names.
    Requirements:
    - 3 to 100 characters long.
    - Begins with a Unicode letter.
    - Remaining characters may include Unicode letters, digits, spaces,
    underscores (_), hyphens (-), and periods (.).
    - Raises an HTTP 400 exception if validation fails.
    """
    return name_validator(value, max_length=100)

def description_validator(value: str, max_length: int = 500):
    """
    Validates resource descriptions.
    Requirements:
    - Up to `max_length` characters (default: 500).
    - Leading and trailing whitespace is removed.
    - Any Unicode characters are allowed.
    - Raises an HTTP 400 exception if validation fails.
    """
    return string_validator(
        value,
        max_length=max_length,
        trim_whitespace=True,
        field_name="Description",
        max_length_error_detail=(
            f"Description length cannot exceed {max_length} characters."
        )
    )
    
