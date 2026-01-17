"""
Configuration for the Content Creation Bot
All credentials should be set via environment variables
"""
import os
from dotenv import load_dotenv

load_dotenv()

# App details
APP_NAME = "App Ideas"
APP_LINK = os.getenv("APP_LINK", "https://linktr.ee/appideas")
HASHTAGS = "#appideas #startup #coding #buildinpublic #indiehacker #tech #mobileapp"

# OpenAI / AI Configuration (uses Replit AI Integrations)
OPENAI_API_KEY = os.getenv("AI_INTEGRATIONS_OPENAI_API_KEY", os.getenv("OPENAI_API_KEY", ""))
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "https://openrouter.replit.dev/v1")

# ElevenLabs Configuration
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")  # Default: Rachel

# SendGrid Configuration
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY", "")
NOTIFICATION_EMAIL = os.getenv("NOTIFICATION_EMAIL", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@appideas.com")

# Instagram/Facebook Configuration
INSTAGRAM_ACCESS_TOKEN = os.getenv("INSTAGRAM_ACCESS_TOKEN", "")
INSTAGRAM_BUSINESS_ID = os.getenv("INSTAGRAM_BUSINESS_ID", "")

# TikTok Configuration
TIKTOK_ACCESS_TOKEN = os.getenv("TIKTOK_ACCESS_TOKEN", "")
TIKTOK_OPEN_ID = os.getenv("TIKTOK_OPEN_ID", "")

# X (Twitter) Configuration
X_API_KEY = os.getenv("X_API_KEY", "")
X_API_SECRET = os.getenv("X_API_SECRET", "")
X_ACCESS_TOKEN = os.getenv("X_ACCESS_TOKEN", "")
X_ACCESS_TOKEN_SECRET = os.getenv("X_ACCESS_TOKEN_SECRET", "")
X_BEARER_TOKEN = os.getenv("X_BEARER_TOKEN", "")

# Video Settings
VIDEO_WIDTH = 1080
VIDEO_HEIGHT = 1920  # 9:16 aspect ratio for Reels/TikTok
VIDEO_FPS = 30
VIDEO_DURATION = 15  # seconds

# Branding
WATERMARK_PATH = "bot/assets/watermark.png"
BRAND_FONT = "bot/assets/fonts/Montserrat-Bold.ttf"
BACKGROUND_COLOR = (26, 26, 46)  # Dark blue
ACCENT_COLOR = (138, 43, 226)  # Purple

# Schedule
POST_HOUR = 10  # 10 AM
POST_MINUTE = 0

# Storage
OUTPUT_DIR = "bot/output"
LOGS_DIR = "bot/logs"
IDEAS_DB = "bot/data/ideas.json"
