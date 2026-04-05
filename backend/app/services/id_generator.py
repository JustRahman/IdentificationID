import secrets

CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"


def generate_identification_id() -> str:
    """Generate a unique IID-XXXX-XXXX identifier.

    Uses cryptographically random characters from a pool that excludes
    ambiguous characters (0, O, I, 1).
    """
    part1 = "".join(secrets.choice(CHARSET) for _ in range(4))
    part2 = "".join(secrets.choice(CHARSET) for _ in range(4))
    return f"IID-{part1}-{part2}"
