FROM python:3.11-slim

WORKDIR /app

ENV PIP_DEFAULT_TIMEOUT=100

RUN export http_proxy="" https_proxy=""

RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir --upgrade pip

RUN pip install --no-cache-dir \
    fastapi \
    uvicorn[standard] \
    mysql-connector-python \
    groq \
    python-dotenv \
    pydantic \
    passlib[bcrypt] \
    python-jose[cryptography] \
    email-validator \
    python-multipart

COPY . .

ENV PORT=8000
ENV HOST=0.0.0.0
ENV RELOAD=false

EXPOSE 8000

CMD ["python", "main.py"]