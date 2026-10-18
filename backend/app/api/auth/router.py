import time
from datetime import datetime, timezone

from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth.schemas import (
    LoginRequest,
    MfaLoginRequest,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)
from app.core.deps import get_current_user, get_db
from app.core.exceptions import Conflict, Unauthorized, ValidationError
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.user import User, UserRole
from app.services import totp
from app.services.email import send_verification_email

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
async def register(
    body: RegisterRequest,
    background: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.email == body.email))
    if result.scalar_one_or_none():
        raise Conflict("Email already registered")

    user = User(
        email=body.email,
        password_hash=hash_password(body.password),
        role=UserRole.manufacturer,
        is_active=True,
    )
    db.add(user)
    await db.flush()

    # Send verification email in background
    verify_token = create_access_token(str(user.id), token_type="email_verify", ttl_hours=24)
    background.add_task(send_verification_email, body.email, verify_token)

    return TokenResponse(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
    )


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()

    if not user or not user.password_hash:
        raise Unauthorized("Invalid email or password")

    if not verify_password(body.password, user.password_hash):
        raise Unauthorized("Invalid email or password")

    if not user.is_active:
        raise Unauthorized("Account is disabled")

    if user.totp_enabled_at:
        # Password OK; the session is only issued after the 2-step code.
        return TokenResponse(
            mfa_required=True,
            mfa_token=create_access_token(str(user.id), token_type="mfa_pending", ttl_hours=5 / 60),
        )

    return TokenResponse(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
    )


_MFA_FAILS: dict[str, list[float]] = {}
MFA_MAX_FAILS = 5
MFA_FAIL_WINDOW = 15 * 60


@router.post("/login/mfa", response_model=TokenResponse)
async def login_mfa(body: MfaLoginRequest, db: AsyncSession = Depends(get_db)):
    payload = decode_token(body.mfa_token)
    if not payload or payload.get("type") != "mfa_pending":
        raise Unauthorized("Your login expired. Please enter your password again.")
    user_id = payload.get("sub")
    now = time.time()
    fails = [t for t in _MFA_FAILS.get(user_id, []) if now - t < MFA_FAIL_WINDOW]
    if len(fails) >= MFA_MAX_FAILS:
        raise Unauthorized("Too many wrong codes. Please wait 15 minutes and try again.")
    user = (await db.execute(select(User).where(User.id == user_id))).scalar_one_or_none()
    if not user or not user.is_active or not user.totp_enabled_at:
        raise Unauthorized("Invalid login")
    secret = totp.decrypt(user.totp_secret_enc or "")
    if not secret or not totp.verify(secret, body.code):
        _MFA_FAILS[user_id] = fails + [now]
        raise Unauthorized("Wrong code. Use the current 6-digit code from your authenticator app.")
    _MFA_FAILS.pop(user_id, None)
    return TokenResponse(
        access_token=create_access_token(str(user.id), extra={"mfa": True}),
        refresh_token=create_refresh_token(str(user.id), extra={"mfa": True}),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(body: RefreshRequest, db: AsyncSession = Depends(get_db)):
    payload = decode_token(body.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise Unauthorized("Invalid refresh token")

    user_id = payload.get("sub")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        raise Unauthorized("User not found or inactive")

    extra = {"mfa": True} if payload.get("mfa") else None
    return TokenResponse(
        access_token=create_access_token(str(user.id), extra=extra),
        refresh_token=create_refresh_token(str(user.id), extra=extra),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(user: User = Depends(get_current_user)):
    return UserResponse(
        id=str(user.id),
        email=user.email,
        role=user.role.value,
        is_active=user.is_active,
        email_verified_at=user.email_verified_at.isoformat() if user.email_verified_at else None,
    )


@router.post("/email/verify")
async def verify_email(
    token: str,
    db: AsyncSession = Depends(get_db),
):
    payload = decode_token(token)
    if not payload or payload.get("type") != "email_verify":
        raise ValidationError("Invalid or expired verification link")

    user_id = payload.get("sub")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise ValidationError("User not found")

    if user.email_verified_at:
        return {"message": "Email already verified"}

    user.email_verified_at = datetime.now(timezone.utc)
    await db.flush()
    return {"message": "Email verified successfully"}


@router.post("/email/resend")
async def resend_verification(
    background: BackgroundTasks,
    user: User = Depends(get_current_user),
):
    if user.email_verified_at:
        return {"message": "Email already verified"}

    verify_token = create_access_token(str(user.id), token_type="email_verify", ttl_hours=24)
    background.add_task(send_verification_email, user.email, verify_token)
    return {"message": "Verification email sent"}
