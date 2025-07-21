from app import db
from datetime import datetime


class LogEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    version = db.Column(db.String(50), nullable=False)
    bandwidth = db.Column(db.Float, nullable=False)
    freq_start = db.Column(db.Float, nullable=False)
    freq_end = db.Column(db.Float, nullable=False)
    circle_num = db.Column(db.Integer, nullable=False)
    detected_freq = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    logfile_id = db.Column(db.Integer, db.ForeignKey("log_file.id"), nullable=False)

    def __init__(self, version, bandwidth, freq_start, freq_end, circle_num, detected_freq, timestamp, logfile_id):
        self.version = version
        self.bandwidth = bandwidth
        self.freq_start = freq_start
        self.freq_end = freq_end
        self.circle_num = circle_num
        self.detected_freq = detected_freq
        self.timestamp = timestamp
        self.logfile_id = logfile_id

    def to_dict(self):
        return {
            "id": self.id,
            "version": self.version,
            "bandwidth": self.bandwidth,
            "freq_start": self.freq_start,
            "freq_end": self.freq_end,
            "circle_num": self.circle_num,
            "detected_freq": self.detected_freq,
            "timestamp": self.timestamp.isoformat(),
            "logfile_id": self.logfile_id,
            "created_at": self.created_at.isoformat()
        }
