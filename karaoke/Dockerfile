FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    mpv \
    && rm -rf /var/lib/apt/lists/*

COPY ./app /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# RUN mkdir -p /app/main/logs && chmod 755 /app/main/logs
CMD ["python", "app.py"]

#CMD ["gunicorn", "-w", "1", "-k", "eventlet", "-b", "0.0.0.0:5090", "app:app", "--log-level", "info"]
