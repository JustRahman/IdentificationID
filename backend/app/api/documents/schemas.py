from pydantic import BaseModel


class DocumentResponse(BaseModel):
    id: str
    product_id: str
    doc_type: str
    title: str | None
    current_version_id: str | None
    file_url: str | None = None
    file_name: str | None = None

    class Config:
        from_attributes = True


class DocumentVersionResponse(BaseModel):
    id: str
    document_id: str
    version: int
    file_name: str
    size_bytes: int
    created_at: str

    class Config:
        from_attributes = True
