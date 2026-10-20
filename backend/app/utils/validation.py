"""
Input validation utilities for pharmaceutical entities, GSTIN, and contact details.
"""

import re

GSTIN_REGEX = re.compile(r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$")
PHONE_REGEX = re.compile(r"^[6-9]\d{9}$")
EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")


def validate_gstin(gstin: str | None) -> bool:
    """Validate 15-character Indian GSTIN format."""
    if not gstin:
        return False
    return bool(GSTIN_REGEX.match(gstin.strip().upper()))


def validate_phone(phone: str | None) -> bool:
    """Validate 10-digit Indian mobile number."""
    if not phone:
        return False
    clean = re.sub(r"[^\d]", "", phone)
    if clean.startswith("91") and len(clean) == 12:
        clean = clean[2:]
    return bool(PHONE_REGEX.match(clean))


def validate_email(email: str | None) -> bool:
    """Validate email address format."""
    if not email:
        return False
    return bool(EMAIL_REGEX.match(email.strip()))
