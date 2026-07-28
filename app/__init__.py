from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flasgger import Swagger
from app.config import Config
from app.models import db
from flask_socketio import SocketIO
from flask_mail import Mail


socketio = SocketIO()
mail = Mail()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    JWTManager(app)
    CORS(app)
    mail.init_app(app)
    socketio.init_app(app, cors_allowed_origins="*")
    Swagger(app, template={
        "info": {
            "title": "Matchday API",
            "description": "A FootBall Ticket Booking System API",
            "version": "1.0.0"
        },
        "securityDefinitions": {
            "Bearer": {
                "type": "apiKey",
                "name": "Authorization",
                "in": "header",
                "description": "Enter: Bearer <your_token>"
            }
        }
    })


    # Register blueprints
    from app.auth.routes import auth_bp
    from app.admin.routes import admin_bp
    from app.clubs.routes import clubs_bp
    from app.matches.routes import matches_bp
    from app.notifications.routes import notifications_bp
    from app.payments.routes import payments_bp
    from app.tickets.routes import tickets_bp



    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(clubs_bp, url_prefix='/api/clubs')
    app.register_blueprint(matches_bp, url_prefix='/api/matches')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    app.register_blueprint(payments_bp, url_prefix='/api/payments')
    app.register_blueprint(tickets_bp, url_prefix='/api/tickets')

    return app









