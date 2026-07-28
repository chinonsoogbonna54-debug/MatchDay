from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models import db, User, Club, Stadium, StadiumSection, Match, Ticket
import json
from datetime import datetime







admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/signup', methods=['POST'])
def admin_signup():
       """
    Register a new  admin
    ---
    tags:
      - Admin
    parameters:
      - in: body
        name: body
        required: true
        schema:
          properties:
            firstname:
              type: string
            lastname:
              type: string
            email:
              type: string
            password:
              type: string
            admin_code:
              type: string
              description: Special code required to create admin account
    responses:
      201:
        description: Admin registered successfully
      400:
        description: Invalid admin code or missing fields
    """
       try:
              data = request.get_json()
              firstname = data.get('firstname')
              lastname = data.get('lastname')
              email = data.get('email')
              password = data.get('password')
              admin_code = data.get('admin_code')


              if not all([firstname, lastname, email, password, admin_code]):
                return jsonify({'error': 'All fields are required'}), 400
              

               # Check admin code
              if admin_code != 'MATCHDAY2026':
                 return jsonify({'error': 'Invalid admin code'}), 403
              

              existing = User.query.filter_by(email=email).first()

              if existing:
                return jsonify({'error': 'User already exists'}), 400
              

              new_admin = User(
                firstname=firstname,
                lastname=lastname,
                email=email,
                role='admin'
                )
              
              new_admin.set_password(password)
              db.session.add(new_admin)
              db.session.commit()


              token = create_access_token(identity=json.dumps({
                'id': new_admin.id,
                'role': new_admin.role,
                'firstname': new_admin.firstname
                 }))
              

              return jsonify({
            'message': 'Admin registered successfully',
            'token': token,
            'user': new_admin.to_dict()
              }), 201
       

       except Exception as e:
        return jsonify({'error': str(e)}), 500
              







@admin_bp.route('/login', methods=['POST'])
def admin_login():
    """
    Login a admin
    ---
    tags:
      - Admin
    parameters:
      - in: body
        name: body
        required: true
        schema:
          properties:
            email:
              type: string
            password:
              type: string
    responses:
      200:
        description: Login successful
      401:
        description: Invalid credentials
    """
    try:
         data = request.get_json()
         email = data.get('email')
         password = data.get('password')

         if not all([email, password]):
            return jsonify({'error': 'All fields are required'}), 400
         
         user = User.query.filter_by(email=email).first()

         if not user:
            return jsonify({'error': 'User not found'}), 404
         
         if not user.check_password(password):
            return jsonify({'error': 'Wrong password'}), 401
         
         # Make sure only admins can log in here
         if user.role != 'admin':
            return jsonify({'error': 'Unauthorized'}), 403
         
         token = create_access_token(identity=json.dumps({
            'id': user.id,
            'role': user.role,
            'firstname': user.firstname
          }))
         
         return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': user.to_dict()
          }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500





@admin_bp.route('/clubs', methods=['POST'])
@jwt_required()
def add_club():
    """
    Add a new football club
    ---
    tags:
      - Admin
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          properties:
            name:
              type: string
            short_name:
              type: string
            country:
              type: string
            logo_url:
              type: string
    responses:
      201:
        description: Club added successfully
      403:
        description: Admins only
    """
    try:
        current_user = json.loads(get_jwt_identity())

         # Make sure only admins can add rooms
        if current_user['role'] != 'admin':
            return jsonify({'error': 'Admins only'}), 403
        
        data = request.get_json()
        name = data.get('name')
        short_name = data.get('short_name')
        country = data.get('country')
        logo_url = data.get('logo_url')


        if not all([name, short_name, country]):
            return jsonify({'error': 'All fields are required'}), 400
        

        existing = Club.query.filter(
            (Club.name == name) | (Club.short_name == short_name)
        ).first()

        if existing:
            return jsonify({'error': 'Club already exists'}), 400
        
        new_club = Club(
            name=name,
            short_name=short_name,
            country=country,
            logo_url=logo_url
        )
        db.session.add(new_club)
        db.session.commit()

        return jsonify({
            'message': 'Club added successfully',
            'club': new_club.to_dict()
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    





@admin_bp.route('/stadiums', methods=['POST'])
@jwt_required()
def add_stadium():
    """
    Add a new football stadium
    ---
    tags:
      - Admin
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          properties:
            name:
              type: string
            city:
              type: string
            country:
              type: string
            capacity:
              type: integer
    responses:
      201:
        description: Stadium added successfully
      403:
        description: Admins only
    """
    try:
        current_user = json.loads(get_jwt_identity())

        # Make sure only admins can add rooms
        if current_user['role'] != 'admin':
            return jsonify({'error': 'Admins only'}), 403
        
        data = request.get_json()
        name = data.get('name')
        city = data.get('city')
        country = data.get('country')
        capacity = data.get('capacity')

        if not all([name, city, country, capacity]):
            return jsonify({'error': 'All fields are required'}), 400
        
        existing = Stadium.query.filter(
            (Stadium.name == name)).first()
        
        if existing:
            return jsonify({'error': 'Stadium already exists'}), 400
        
        
        new_stadium = Stadium(
            name=name,
            city=city,
            country=country,
            capacity=capacity
        )
        db.session.add(new_stadium)
        db.session.commit()

        return jsonify({
            'message': 'Stadium added successfully',
            'stadium': new_stadium.to_dict()
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500




@admin_bp.route('/stadiums/<int:stadium_id>/sections', methods=['POST'])
@jwt_required()
def add_section(stadium_id):
    """
    Add stadium section
    ---
    tags:
      - Admin
    security:
      - Bearer: []
    parameters:
      - in: path
        name: stadium_id
        type: integer
        required: true
        description: ID of the stadium section
      - in: body
        name: body
        required: true
        schema:
          properties:
            name:
              type: string
              description: Seat category (VIP, Regular, etc)
            price:
              type: number
            total_seats:
              type: integer
    responses:
      201:
        description: Section added successfully
      403:
        description: Admins only
      404:
        description: Stadium not found
    """
    try:
        current_user = json.loads(get_jwt_identity())

        if current_user['role'] != 'admin':
            return jsonify({'error': 'Admins only'}), 403
        
         # Check stadium exists 
        stadium = Stadium.query.filter_by(id=stadium_id).first()
        if not stadium:
            return jsonify({'error': 'Stadium not found'}), 404
        

        data = request.get_json()
        name = data.get('name')
        price = data.get('price')
        total_seats = data.get('total_seats')

        if not all([name, price, total_seats]):
            return jsonify({'error': 'All fields are required'}), 400
        
        new_section = StadiumSection(
            stadium_id=stadium_id,
            name=name,
            price=price,
            total_seats=total_seats,
            available_seats=total_seats  # automatically set to total on creation
        )
        db.session.add(new_section)
        db.session.commit()

        return jsonify({
            'message': 'Seats added successfully',
            'section': new_section.to_dict()
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500




@admin_bp.route('/matches', methods=['POST'])
@jwt_required()
def add_match():
    """
    Add a new football match
    ---
    tags:
      - Admin
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          properties:
            home_club_id:
              type: integer
            away_club_id:
              type: integer
            stadium_id:
              type: integer
            date:
              type: string
            season:
              type: string
    responses:
      201:
        description: Match added successfully
      403:
        description: Admins only
    """
    try:
        current_user = json.loads(get_jwt_identity())

        # Make sure only admins can add rooms
        if current_user['role'] != 'admin':
            return jsonify({'error': 'Admins only'}), 403
        
        data = request.get_json()
        home_club_id = data.get('home_club_id')
        away_club_id = data.get('away_club_id')
        stadium_id = data.get('stadium_id')
        date = data.get('date')
        season = data.get('season')

        if not all([home_club_id, away_club_id, stadium_id, date, season]):
            return jsonify({'error': 'All fields are required'}), 400
        
        if home_club_id == away_club_id:
             return jsonify({'error': 'A club cannot play its selve'}), 400
        
        home_club = Club.query.filter_by(id=home_club_id).first()
        if not home_club:
            return jsonify({'error': 'Home club not found'}), 404
        
        away_club = Club.query.filter_by(id=away_club_id).first()
        if not away_club:
            return jsonify({'error': 'Away club not found'}), 404
        
        stadium = Stadium.query.filter_by(id=stadium_id).first()
        if not stadium :
            return jsonify({'error': 'Stadium not found'}), 404
        
        match_date = datetime.strptime(date, '%Y-%m-%d %H:%M')

        new_match = Match(
            home_club_id=home_club_id,
            away_club_id=away_club_id,
            stadium_id=stadium_id,
            season=season,
            date =match_date,
            status='upcoming'
        )
        db.session.add(new_match)
        db.session.commit()

        return jsonify({
            'message': 'Match created successfully',
            'match': new_match.to_dict()
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500
        



@admin_bp.route('/matches', methods=['GET'])
@jwt_required()
def view_matches():
     """
    View all football matches
    ---
    tags:
      - Admin
    security:
      - Bearer: []
    responses:
      200:
        description: List of all matches
      403:
        description: Admins only
    """
     try:
          current_user = json.loads(get_jwt_identity())

          if current_user['role'] != 'admin':
            return jsonify({'error': 'Admins only'}), 403
          
          matches = Match.query.all()

          return jsonify({
            'matches': [match.to_dict() for match in matches]
        }), 200

     except Exception as e:
        return jsonify({'error': str(e)}), 500
     


@admin_bp.route('/sales', methods=['GET'])
@jwt_required()
def view_sales():
    """
    View all ticket sales
    ---
    tags:
      - Admin
    security:
      - Bearer: []
    responses:
      200:
        description: List of all paid tickets
      403:
        description: Admins only
    """
    try:
        current_user = json.loads(get_jwt_identity())


        if current_user['role'] != 'admin':
            return jsonify({'error': 'Admins only'}), 403
        
        tickets = Ticket.query.filter_by(payment_status='paid').all()

        return jsonify({
            'total_sales': len(tickets),
            'tickets': [ticket.to_dict() for ticket in tickets]
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500