FROM python:3.11

# Установка рабочей директории внутри контейнера
WORKDIR /app

# Копируем зависимости
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Копируем весь проект
COPY . .

# Указание переменной окружения для Flask
ENV FLASK_APP=run.py

# Команда по умолчанию (но она переопределяется docker-compose'ом)
CMD ["gunicorn", "run:app", "-b", "0.0.0.0:5000"]
