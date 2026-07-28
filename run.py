from dotenv import load_dotenv
load_dotenv()
from app import create_app
from app.models import db
from app import socketio

app = create_app()

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    socketio.run(app, debug=True)