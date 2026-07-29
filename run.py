import os
from app import create_app
from app.models import db
from app import socketio

app = create_app()

# Create tables on startup
with app.app_context():
    db.create_all()

if __name__ == "__main__":
    socketio.run(app, debug=True)