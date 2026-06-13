from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import Literal


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # AI
    anthropic_api_key: str
    primary_model: str = "claude-sonnet-4-6"
    classifier_model: str = "claude-haiku-4-5-20251001"

    # Database
    database_url: str

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # Telegram
    telegram_bot_token: str
    telegram_chat_id: str

    # LinkedIn
    linkedin_cookies_path: str = "./secrets/linkedin_cookies.json"
    linkedin_user_agent: str = (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
    )

    # SerpAPI
    serpapi_key: str = ""

    # Email (optional)
    sendgrid_api_key: str = ""
    sendgrid_from_email: str = ""
    notification_email: str = ""

    # Google Sheets (optional)
    google_service_account_path: str = ""
    google_sheets_id: str = ""

    # Agent mode
    agent_mode: Literal["job_seeker", "business_owner"] = "job_seeker"

    # Safety limits
    max_connections_per_day: int = Field(default=8, ge=1, le=15)
    max_messages_per_day: int = Field(default=5, ge=1, le=10)
    max_profile_views_per_day: int = Field(default=20, ge=1, le=30)
    max_searches_per_day: int = Field(default=15, ge=1, le=25)
    active_hours_start: int = Field(default=7, ge=5, le=10)
    active_hours_end: int = Field(default=21, ge=18, le=23)

    # Two-window daily schedule (all times in UTC hours)
    # Morning window: pick a random time between these two hours each day
    morning_window_start: int = Field(default=7, ge=5, le=12)
    morning_window_end: int = Field(default=11, ge=6, le=13)
    # Evening window: pick a random time between these two hours each day
    evening_window_start: int = Field(default=16, ge=13, le=20)
    evening_window_end: int = Field(default=20, ge=14, le=22)

    # Encryption
    encryption_key: str

    # Web UI
    web_ui_host: str = "0.0.0.0"
    web_ui_port: int = 8000
    web_ui_secret_key: str = "change-this"


settings = Settings()
