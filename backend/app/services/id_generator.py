import secrets

CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"


def _random_pair() -> str:
    part1 = "".join(secrets.choice(CHARSET) for _ in range(4))
    part2 = "".join(secrets.choice(CHARSET) for _ in range(4))
    return f"{part1}-{part2}"


def generate_identification_id() -> str:
    """Generate a unique IID-XXXX-XXXX product identifier.

    Uses cryptographically random characters from a pool that excludes
    ambiguous characters (0, O, I, 1).
    """
    return f"IID-{_random_pair()}"


def generate_manufacturer_id() -> str:
    """Generate a unique MID-XXXX-XXXX manufacturer identifier.

    Permanent identifier for a manufacturer within the Identification ID
    registry (not a government or internationally recognized identifier).
    """
    return f"MID-{_random_pair()}"
