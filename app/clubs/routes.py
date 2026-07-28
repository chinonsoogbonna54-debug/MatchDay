from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, User, Club
import json


clubs_bp = Blueprint('clubs', __name__)



@clubs_bp.route('/', methods=['GET'])
def get_clubs():
    """
Get all football clubs
---
tags:
  - Clubs
responses:
  200:
    description: List of all clubs
"""
    try:
        clubs = Club.query.all()

        return jsonify({
            'clubs': [club.to_dict() for club in clubs]
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    



@clubs_bp.route('/<int:club_id>', methods=['GET'])
def get_single_club(club_id):
    """
Get a single club by ID
---
tags:
  - Clubs
parameters:
  - in: path
    name: club_id
    type: integer
    required: true
    description: ID of the club
responses:
  200:
    description: Club details
  404:
    description: Club not found
"""

    try:
        club = Club.query.filter_by(id=club_id).first()

        if not club:
            return jsonify({'error': 'Club not found'}), 404
        
        return jsonify({
           'club': club.to_dict()
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

 



@clubs_bp.route('/favourite', methods=['PUT'])
@jwt_required()
def favorite_club():
    """
Set fan's favourite club
---
tags:
  - Clubs
security:
  - Bearer: []
parameters:
  - in: body
    name: body
    required: true
    schema:
      properties:
        club_id:
          type: integer
          description: ID of the club to set as favourite
responses:
  200:
    description: Favourite club updated successfully
  403:
    description: Fans only
  404:
    description: Club not found
"""
    try:
        current_user = json.loads(get_jwt_identity())

        if current_user['role'] != 'fan':
          return jsonify({'error': 'Fans only'}), 403

        data = request.get_json()
        club_id = data.get('club_id')

        if not club_id:
            return jsonify({'error': 'club_id is required'}), 400

        # Check club exists
        club = Club.query.filter_by(id=club_id).first()
        if not club:
            return jsonify({'error': 'Club not found'}), 404

        # Find the logged in fan and update their favourite club
        user = User.query.filter_by(id=current_user['id']).first()
        user.favourite_club_id = club_id
        db.session.commit()

        return jsonify({
            'message': 'Favourite club updated successfully',
            'user': user.to_dict()
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500