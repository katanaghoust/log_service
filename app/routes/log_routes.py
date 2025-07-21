from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import os
from pathlib import Path
from tempfile import mkdtemp

from app.extensions import db
from app.models.logfile import LogFile
from app.models.logentry import LogEntry
from app.utils.parser import parse_log_file

log_bp = Blueprint("logs", __name__, url_prefix="/api/logs")

UPLOAD_FOLDER = mkdtemp()
ALLOWED_EXTENSIONS = {"log", "txt"}

def allowed_file(filename: str) -> bool:
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Загрузка лог-файла в виде JSON (если понадобится)
@log_bp.route("/upload", methods=["POST"])
@jwt_required()
def upload_logfile():
    current_user_id = int(get_jwt_identity())
    data = request.get_json()

    filename = data.get("filename")
    log_entries = data.get("entries")

    if not filename or not log_entries:
        return jsonify({"error": "Missing required fields"}), 400

    logfile = LogFile(user_id=current_user_id, filename=filename)
    db.session.add(logfile)
    db.session.flush()  # получить ID

    for entry in log_entries:
        log_entry = LogEntry(
            version=entry["version"],
            bandwidth=entry["bandwidth"],
            freq_start=entry["freq_start"],
            freq_end=entry["freq_end"],
            circle_num=entry["circle_num"],
            detected_freq=entry["detected_freq"],
            timestamp=entry["timestamp"],
            logfile_id=logfile.id
        )
        db.session.add(log_entry)

    db.session.commit()

    return jsonify({"message": "Log file and entries saved successfully."}), 201

# Новый: анализ загруженного текстового лог-файла
@log_bp.route("/analyze", methods=["POST"])
@jwt_required()
def analyze_logfile():
    current_user_id = int(get_jwt_identity())

    if "file" not in request.files:
        return jsonify({"error": "No file part in request"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Only .txt or .log files allowed"}), 400

    filename = secure_filename(file.filename)
    save_path = Path(UPLOAD_FOLDER) / filename
    file.save(save_path)

    try:
        parsed_entries = parse_log_file(save_path)
    except Exception as e:
        return jsonify({"error": f"Failed to parse log file: {str(e)}"}), 500

    logfile = LogFile(user_id=current_user_id, filename=filename)
    db.session.add(logfile)
    db.session.flush()

    for entry in parsed_entries:
        log_entry = LogEntry(
            version=entry["version"],
            bandwidth=entry["bandwidth"],
            freq_start=entry["freq_start"],
            freq_end=entry["freq_end"],
            circle_num=entry["circle_num"],
            detected_freq=entry["detected_freq"],
            timestamp=entry["timestamp"],
            logfile_id=logfile.id
        )
        db.session.add(log_entry)

    db.session.commit()

    return jsonify({"message": f"Log file parsed. {len(parsed_entries)} entries saved."}), 201

# Получить все логфайлы пользователя
@log_bp.route("", methods=["GET"])
@jwt_required()
def get_user_logfiles():
    current_user_id = int(get_jwt_identity())
    logfiles = LogFile.query.filter_by(user_id=current_user_id).all()
    return jsonify([logfile.to_dict() for logfile in logfiles])

# Получить записи конкретного логфайла
@log_bp.route("/<int:logfile_id>", methods=["GET"])
@jwt_required()
def get_log_entries(logfile_id):
    current_user_id = int(get_jwt_identity())
    logfile = LogFile.query.filter_by(id=logfile_id, user_id=current_user_id).first()

    if not logfile:
        return jsonify({"error": "Logfile not found or access denied"}), 403

    entries = LogEntry.query.filter_by(logfile_id=logfile_id).all()
    return jsonify([entry.to_dict() for entry in entries])
