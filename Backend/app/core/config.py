from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "Presently API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000"]
    
    DATABASE_URL: str = "sqlite+aiosqlite:///./presently.db"
    
    CLERK_SECRET_KEY: str = ""
    OPENAI_API_KEY: str = ""
    CLOUDINARY_CLOUD_NAME: str = ""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
