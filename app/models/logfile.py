from app import db
from datetime import datetime

class LogFile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)

    entries = db.relationship("LogEntry", backref="logfile", cascade="all, delete-orphan")

    def __init__(self, filename, user_id):
        self.filename = filename
        self.user_id = user_id

    def to_dict(self):
        return {
            "id": self.id,
            "filename": self.filename,
            "uploaded_at": self.uploaded_at.isoformat(),
            "user_id": self.user_id
        }
