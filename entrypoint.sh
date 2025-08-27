#!/bin/sh

# Exit on error
set -e

echo "➡️ Collecting static files..."
python manage.py collectstatic --noinput

echo "➡️ Applying migrations..."
python manage.py migrate

echo "➡️ Starting Gunicorn..."
gunicorn Skin_project.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 4 \
    --threads 2 \
    --timeout 120