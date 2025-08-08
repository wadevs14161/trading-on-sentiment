#!/bin/bash

# Activate virtual environment
source .venv-stock-server/bin/activate

# Change to Django project directory
cd stock_server_v1

# Start Django development server in background
python manage.py runserver &

# Store Django server PID
DJANGO_PID=$!

# Go back to project root
cd ..

# Change to React client directory
cd stock-client-v1

# Start React development server
npm run dev

# When React server stops, also stop Django server
kill $DJANGO_PID