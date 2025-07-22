import re
from werkzeug.utils import secure_filename
from pathlib import Path
from tempfile import mkdtemp
from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

from app.extensions import db
from app.models.logfile import LogFile
from app.models.logentry import LogEntry
from app.utils.parser import parse_log_file

log_bp = Blueprint("logs", __name__, url_prefix="/api/logs")

UPLOAD_FOLDER = mkdtemp()
ALLOWED_EXTENSIONS = {"log", "txt"}
FILENAME_REGEX = re.compile(r"^[a-zA-Z0-9_\-\.]+$")  # Безопасные имена

def allowed_file(filename: str) -> bool:
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@log_bp.route("/upload", methods=["POST"])
@jwt_required()
def upload_logfile():
    current_user_id = int(get_jwt_identity())
    data = request.get_json()

    filename = data.get("filename")
    log_entries = data.get("entries")

    if not filename or not log_entries:
        return jsonify({"error": "Missing required fields"}), 400

    if not FILENAME_REGEX.match(filename):
        return jsonify({"error": "Invalid filename format"}), 400

    logfile = LogFile(user_id=current_user_id, filename=secure_filename(filename))
    db.session.add(logfile)
    db.session.flush()

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

    filename = file.filename
    if not FILENAME_REGEX.match(filename):
        return jsonify({"error": "Invalid filename format"}), 400

    filename = secure_filename(filename)
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

@log_bp.route("", methods=["GET"])
@jwt_required()
def get_user_logfiles():
    current_user_id = int(get_jwt_identity())
    logfiles = LogFile.query.filter_by(user_id=current_user_id).all()
    return jsonify([logfile.to_dict() for logfile in logfiles])

@log_bp.route("/<int:logfile_id>", methods=["GET"])
@jwt_required()
def get_log_entries(logfile_id):
    current_user_id = int(get_jwt_identity())
    logfile = LogFile.query.filter_by(id=logfile_id, user_id=current_user_id).first()

    if not logfile:
        return jsonify({"error": "Logfile not found or access denied"}), 403

    entries = LogEntry.query.filter_by(logfile_id=logfile_id).all()
    return jsonify([entry.to_dict() for entry in entries])

@log_bp.route("/export-pdf", methods=["POST"])
@jwt_required()
def export_logs_to_pdf():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    start = data.get("start_date")
    end = data.get("end_date")

    try:
        start_dt = datetime.fromisoformat(start)
        end_dt = datetime.fromisoformat(end)
    except Exception:
        return jsonify({"error": "Неверный формат даты"}), 400

    entries = LogEntry.query.join(LogFile).filter(
        LogFile.user_id == user_id,
        LogEntry.timestamp >= start_dt,
        LogEntry.timestamp <= end_dt
    ).order_by(LogEntry.timestamp.asc()).all()

    if not entries:
        return jsonify({"error": "Нет логов в заданном диапазоне"}), 404

    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    pdf.setTitle("Logs for period")
    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawCentredString(width / 2, height - 30, "Log Report")

    x_start = 30
    y_start = height - 60
    row_height = 20
    col_widths = [90, 70, 60, 60, 60, 80]
    headers = ["Date", "Version", "BW", "F-start", "F-end", "Detected Freq"]

    def draw_row(y, values, bold=False):
        font = "Helvetica-Bold" if bold else "Helvetica"
        pdf.setFont(font, 8)
        x = x_start
        for i, text in enumerate(values):
            pdf.rect(x, y - row_height, col_widths[i], row_height)
            pdf.drawString(x + 2, y - row_height + 5, str(text))
            x += col_widths[i]

    draw_row(y_start, headers, bold=True)
    y = y_start - row_height

    for entry in entries:
        row = [
            entry.timestamp.strftime("%d.%m.%Y %H:%M"),
            entry.version,
            f"{entry.bandwidth:.2f}",
            f"{entry.freq_start:.2f}",
            f"{entry.freq_end:.2f}",
            f"{entry.detected_freq:.2f}"
        ]
        draw_row(y, row)
        y -= row_height

        if y < 40:
            pdf.showPage()
            y = height - 40
            draw_row(y, headers, bold=True)
            y -= row_height

    pdf.save()
    buffer.seek(0)

    return send_file(
        buffer,
        mimetype='application/pdf',
        as_attachment=True,
        download_name="logs_report.pdf"
    )
