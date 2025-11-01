import os
from typing import List, Optional, Union

from pydantic import AnyHttpUrl, BaseSettings, EmailStr, validator


class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkey")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    MAGIC_LINK_EXPIRE_MINUTES: int = 15  # 15 minutes
    
    # CORS
    CORS_ORIGINS: List[AnyHttpUrl] = ["http://localhost:3000"]

    @validator("CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/iris_auth"
    )

    # Email
    EMAIL_SENDER: EmailStr = os.getenv("EMAIL_SENDER", "noreply@example.com")
    EMAIL_PASSWORD: str = os.getenv("EMAIL_PASSWORD", "password")
    EMAIL_HOST: str = os.getenv("EMAIL_HOST", "smtp.example.com")
    EMAIL_PORT: int = int(os.getenv("EMAIL_PORT", "587"))

    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    class Config:
        case_sensitive = True
        env_file = ".env"


settings = Settings()