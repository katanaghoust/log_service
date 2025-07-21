from flask import Flask
from app.extensions import db
from flask_jwt_extended import JWTManager

from .auth_routes import auth_bp
from .log_routes import log_bp

jwt = JWTManager()

__all__ = ["auth_bp", "log_bp"]

def create_app():
    app = Flask(__name__)

    app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://your_user:your_pass@localhost:5432/logdb"
    app.config["SECRET_KEY"] = "your-secret-key"
    app.config["JWT_SECRET_KEY"] = "your-jwt-secret"  # Обязательно для JWT
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)
    jwt.init_app(app)

    # Регистрация маршрутов
    app.register_blueprint(auth_bp)
    app.register_blueprint(log_bp)

    return app
