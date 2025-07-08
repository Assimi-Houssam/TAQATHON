import os
from typing import Optional

class Settings:
    # Server configuration
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # Model configuration
    MODEL_PATH: str = os.getenv("MODEL_PATH", "app/models/model.pth")
    MAX_LENGTH: int = int(os.getenv("MAX_LENGTH", "128"))
    BATCH_SIZE_LIMIT: int = int(os.getenv("BATCH_SIZE_LIMIT", "100"))
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    # CORS settings
    ALLOWED_ORIGINS: list = ["*"]  # Configure as needed
    
settings = Settings()