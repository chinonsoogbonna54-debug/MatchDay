from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime


db = SQLAlchemy()


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    firstname = db.Column(db.String(25), nullable=False)
    lastname = db.Column(db.String(25), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=True)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(10), nullable=False)
    favourite_club_id = db.Column(db.Integer, db.ForeignKey('clubs.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    


    def to_dict(self):
        return {
            'id': self.id,
            'firstname': self.firstname,
            'lastname': self.lastname,
            'favourite_club_id': self.favourite_club_id,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at.isoformat()
        }
    




class Club(db.Model):
    __tablename__ = 'clubs'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    short_name = db.Column(db.String(10), unique=True, nullable=False)
    country = db.Column(db.String(50),  nullable=False)
    logo_url = db.Column(db.String(255),  nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)




    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'short_name': self.short_name,
            'country': self.country,
            'logo_url': self.logo_url,
            'created_at': self.created_at.isoformat()
        }







class Stadium(db.Model):
    __tablename__ = 'stadiums'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    city = db.Column(db.String(50),  nullable=False)
    country = db.Column(db.String(50),  nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)




    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'city': self.city,
            'country': self.country,
            'capacity': self.capacity,
            'created_at': self.created_at.isoformat()
        }






class StadiumSection(db.Model):
    __tablename__ = 'stadium_sections'

    id = db.Column(db.Integer, primary_key=True)
    stadium_id = db.Column(db.Integer, db.ForeignKey('stadiums.id'), nullable=False)
    name = db.Column(db.String(50),  nullable=False)
    price = db.Column(db.Float,  nullable=False)
    total_seats = db.Column(db.Integer, nullable=False)
    available_seats = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)



    def to_dict(self):
        return {
            'id': self.id,
            'stadium_id': self.stadium_id,
            'name': self.name,
            'price': self.price,
            'total_seats': self.total_seats,
            'available_seats': self.available_seats,
            'created_at': self.created_at.isoformat()
        }






class Match(db.Model):
    __tablename__ = 'matches'

    id = db.Column(db.Integer, primary_key=True)
    home_club_id = db.Column(db.Integer, db.ForeignKey('clubs.id'), nullable=False)
    away_club_id = db.Column(db.Integer, db.ForeignKey('clubs.id'), nullable=False)
    stadium_id = db.Column(db.Integer, db.ForeignKey('stadiums.id'), nullable=False)
    home_club = db.relationship('Club', foreign_keys=[home_club_id])
    away_club = db.relationship('Club', foreign_keys=[away_club_id])
    stadium = db.relationship('Stadium', foreign_keys=[stadium_id])
    date = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), default='upcoming')
    season = db.Column(db.String(20), nullable=False)
    home_score = db.Column(db.Integer, default=0)
    away_score = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)




    def to_dict(self):
        return {
            'id': self.id,
            'home_club': self.home_club.to_dict(),
            'away_club': self.away_club.to_dict(),
            'stadium': self.stadium.to_dict(),
            'date': self.date.isoformat(),
            'status': self.status,
            'season': self.season,
            'home_score': self.home_score,
            'away_score': self.away_score,
            'created_at': self.created_at.isoformat()
        }






class Ticket(db.Model):
    __tablename__ = 'tickets'

    id = db.Column(db.Integer, primary_key=True)
    fan_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    match_id = db.Column(db.Integer, db.ForeignKey('matches.id'), nullable=False)
    section_id = db.Column(db.Integer, db.ForeignKey('stadium_sections.id'), nullable=False)
    qr_code = db.Column(db.String(225))
    payment_status = db.Column(db.String(20), default='pending')
    payment_reference = db.Column(db.String(100), unique=True)
    fan = db.relationship('User', foreign_keys=[fan_id])
    match = db.relationship('Match', foreign_keys=[match_id])
    section = db.relationship('StadiumSection', foreign_keys=[section_id])
    email_sent = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)




    def to_dict(self):
        return {
            'id': self.id,
            'fan_id': self.fan_id,
            'match_id': self.match_id,
            'section_id': self.section_id,
            'qr_code': self.qr_code,
            'payment_status': self.payment_status,
            'payment_reference': self.payment_reference,
            'fan': self.fan.to_dict(),
            'match': self.match.to_dict(),
            'section': self.section.to_dict(),
            'email_sent': self.email_sent,
            'created_at': self.created_at.isoformat()
        }
    





class PasswordResetToken(db.Model):
    __tablename__ = 'password_reset_tokens'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    token = db.Column(db.String(225), unique=True, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    used = db.Column(db.Boolean, default=False)
    user = db.relationship('User', foreign_keys=[user_id])
    created_at = db.Column(db.DateTime, default=datetime.utcnow)





    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'token': self.token,
            'expires_at': self.expires_at.isoformat(),
            'used': self.used,
            'user': self.user.to_dict(),
            'created_at': self.created_at.isoformat()
        }