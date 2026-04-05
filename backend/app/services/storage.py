import boto3

from app.core.config import settings


def get_s3_client():
    """Create S3 client configured for Supabase Storage or AWS S3."""
    return boto3.client(
        "s3",
        region_name=settings.s3_region,
        endpoint_url=settings.s3_endpoint or None,
        aws_access_key_id=settings.s3_access_key,
        aws_secret_access_key=settings.s3_secret_key,
    )
