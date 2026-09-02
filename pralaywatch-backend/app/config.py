import os
from pathlib import Path
from dotenv import load_dotenv

# Base directory of the project
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from .env file
load_dotenv(BASE_DIR / '.env')

class Config:
    """Base Configuration Class for PralayWatch Backend."""
    SECRET_KEY = os.getenv('SECRET_KEY', 'pralaywatch-secret-key-phase1')
    
    # Database Configuration (PostgreSQL compatible, SQLite default for local dev)
    database_url = os.getenv('DATABASE_URL', f"sqlite:///{BASE_DIR / 'pralaywatch.db'}")
    if database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)
    
    SQLALCHEMY_DATABASE_URI = database_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False
    
    # Server & CORS
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*')
    JSON_SORT_KEYS = False

class DevelopmentConfig(Config):
    """Development configuration with debug mode enabled."""
    DEBUG = True
    SQLALCHEMY_ECHO = False

class TestingConfig(Config):
    """Testing configuration with in-memory SQLite database."""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    DEBUG = True

class ProductionConfig(Config):
    """Production configuration with strict settings."""
    DEBUG = False
    TESTING = False

config_by_name = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
