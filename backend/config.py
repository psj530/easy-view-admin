from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """애플리케이션 설정"""

    DATABASE_URL: str = "sqlite:///./easyview.db"
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173,https://easy-view-admin.vercel.app,https://easy-view-admin-psj530s-projects.vercel.app"

    # SSO 설정 (추후 전환 시 사용)
    AUTH_PROVIDER: str = "local"  # "local" | "sso"
    SSO_PROVIDER_URL: str = ""
    SSO_CLIENT_ID: str = ""
    SSO_CLIENT_SECRET: str = ""

    # 이메일 설정 (Gmail SMTP)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""  # Gmail 주소
    SMTP_PASSWORD: str = ""  # Gmail 앱 비밀번호

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
