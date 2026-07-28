import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "matchday-secret-key")
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        "postgresql://postgres:chinonso@localhost:5432/matchday"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "matchday-jwt-secret")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)

    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.environ.get("MAIL_USERNAME", "Chinonsoogbonna54@gmail.com")
    MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD", "your_app_password_here")
    MAIL_DEFAULT_SENDER = os.environ.get("MAIL_USERNAME", "Chinonsoogbonna54@gmail.com")

    STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY", "sk_test_placeholder")
    PAYSTACK_SECRET_KEY = os.environ.get("PAYSTACK_SECRET_KEY", "sk_test_placeholder")
    STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "whsec_placeholder")
    FOOTBALL_API_KEY = os.environ.get("FOOTBALL_API_KEY", "your_football_api_key_here")