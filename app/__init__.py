from flask import Flask
from flask_cors import CORS  # ⬅️ импортируем CORS
from app.extensions import db, jwt
from config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    jwt.init_app(app)

    # ⬅️ разрешаем CORS для всех доменов (можно указать origin=['http://localhost:5173'] при необходимости)
    CORS(app)

    with app.app_context():
        from app.models import User, LogFile, LogEntry
        db.create_all()

        # Регистрация маршрутов
        from app.routes.auth_routes import auth_bp
        from app.routes.log_routes import log_bp
        from app.routes.admin_routes import admin_bp

        app.register_blueprint(auth_bp)
        app.register_blueprint(log_bp)
        app.register_blueprint(admin_bp)

    return app
