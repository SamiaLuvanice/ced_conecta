FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["sh", "-c", "python manage.py migrate && if [ \"$APP_ENV\" = \"demo\" ]; then python manage.py seed_data; fi && python manage.py runserver 0.0.0.0:8000"]
