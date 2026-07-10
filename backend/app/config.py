from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str
    app_version: str

    host: str
    port: int

    debug: bool

    secret_key: str

    access_token_expire_minutes: int
    algorithm: str

    database_url: str

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )


settings = Settings()