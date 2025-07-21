from app.extensions import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), nullable=False, unique=True)
    email = db.Column(db.String(120), nullable=False, unique=True)
    password_hash = db.Column(db.String(512), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="user")
    is_trusted = db.Column(db.Boolean, default=False, nullable=False)

    log_files = db.relationship("LogFile", backref="user", lazy=True)

    @classmethod
    def register(cls, username, email, password, role="user"):
        """
        Регистрирует нового пользователя с указанной ролью, хэшируя пароль.
        """
        hashed_password = generate_password_hash(password)
        user = cls(
            username=username,
            email=email,
            password_hash=hashed_password,
            role=role,
            is_trusted=False  # ⬅️ явно указываем
        )
        db.session.add(user)
        return user

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "role": self.role,
            "is_trusted": self.is_trusted
        }
