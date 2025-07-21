from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from functools import wraps
from app.models.user import User
from app.models.logentry import LogEntry
from app.extensions import db

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

# ✅ Декоратор проверки роли администратора
def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user or user.role != "admin":
            return jsonify({"error": "Admin access required"}), 403
        return fn(*args, **kwargs)
    return wrapper

# 📋 Получение списка всех пользователей
@admin_bp.route("/users", methods=["GET"])
@jwt_required()
@admin_required
def list_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])

# ✅ Подтверждение пользователя (is_trusted → True)
@admin_bp.route("/users/<int:user_id>/approve", methods=["POST"])
@jwt_required()
@admin_required
def approve_user(user_id):
    user = User.query.get_or_404(user_id)
    user.is_trusted = True
    db.session.commit()
    return jsonify({"message": f"User '{user.username}' approved."})

# 🔁 Обновление is_trusted (можно отключать доступ)
@admin_bp.route("/users/<int:user_id>/trust", methods=["PATCH"])
@jwt_required()
@admin_required
def toggle_trust(user_id):
    data = request.get_json()
    is_trusted = data.get("is_trusted")

    if is_trusted is None:
        return jsonify({"error": "Missing 'is_trusted' field"}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    user.is_trusted = is_trusted
    db.session.commit()
    return jsonify({"message": f"User trust set to {is_trusted}."})

# 🗑 Удаление пользователя и логов (по желанию)
@admin_bp.route("/users/<int:user_id>", methods=["DELETE"])
@jwt_required()
@admin_required
def delete_user(user_id):
    user = User.query.get_or_404(user_id)

    for logfile in user.log_files:
        LogEntry.query.filter_by(logfile_id=logfile.id).delete()
        db.session.delete(logfile)

    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": f"User '{user.username}' and related data deleted."})
