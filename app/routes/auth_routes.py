from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
import datetime

from app.extensions import db
from app.models.user import User

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/api/register", methods=["POST"])
def register():
    data = request.json
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return jsonify({"error": "Missing fields"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 400

    hashed_password = generate_password_hash(password)
    user = User(username=username, email=email, password_hash=hashed_password)

    db.session.add(user)
    db.session.commit()

    return jsonify({"status": "success", "user_id": user.id})


@auth_bp.route("/api/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(username=username).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid credentials"}), 401

    if not user.is_trusted:
        return jsonify({"error": "Account pending approval by admin"}), 403

    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={"role": user.role, "is_trusted": user.is_trusted},
        expires_delta=datetime.timedelta(hours=1)
    )

    return jsonify({"token": access_token})
