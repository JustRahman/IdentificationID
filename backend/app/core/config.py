from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # App
    debug: bool = False
    secret_key: str = "change-me-in-production"
    port: int = 8001

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/identification_id"

    @model_validator(mode="after")
    def fix_database_url(self):
        # Railway provides postgresql://, we need postgresql+asyncpg://
        if self.database_url.startswith("postgresql://"):
            self.database_url = self.database_url.replace(
                "postgresql://", "postgresql+asyncpg://", 1
            )
        return self

    # JWT
    jwt_secret: str = "change-me"
    jwt_access_ttl_min: int = 30
    jwt_refresh_ttl_days: int = 14
    jwt_algorithm: str = "HS256"

    # Google OAuth
    google_client_id: str = ""
    google_client_secret: str = ""

    # Storage (S3 / Supabase Storage)
    s3_bucket: str = ""
    s3_region: str = "us-east-1"
    s3_access_key: str = ""
    s3_secret_key: str = ""
    s3_endpoint: str = ""

    # Stripe
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""

    # Email
    sendgrid_api_key: str = ""
    from_email: str = "noreply@identificationid.com"

    # CORS
    frontend_url: str = "http://localhost:3000"


settings = Settings()
