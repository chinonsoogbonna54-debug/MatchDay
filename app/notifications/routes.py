from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, Match
from app import socketio
from flask_socketio import emit
import json



notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('/goal', methods=['POST'])
@jwt_required()
def record_a_goal():
    """
Record a goal and notify all connected fans
---
tags:
  - Notifications
security:
  - Bearer: []
parameters:
  - in: body
    name: body
    required: true
    schema:
      properties:
        match_id:
          type: integer
          description: ID of the match
        scorer:
          type: string
          description: Name of the player who scored
        minute:
          type: integer
          description: Minute the goal was scored
        team:
          type: string
          description: Either 'home' or 'away'
responses:
  200:
    description: Goal recorded and fans notified
  403:
    description: Admins only
  404:
    description: Match not found
"""
    try:
         current_user = json.loads(get_jwt_identity())

         if current_user['role'] != 'admin':
            return jsonify({'error': 'Admins only'}), 403

         data = request.get_json()
         match_id = data.get('match_id')
         scorer= data.get('scorer')
         minute = data.get('minute')
         team = data.get('team')

         if not all([match_id, scorer, minute, team]):
            return jsonify({'error': 'All fields are required'}), 400

         match = Match.query.filter_by(id=match_id).first()


         if not match:
            return jsonify({'error': 'Match not found'}), 404


         team = data.get('team')  # either 'home' or 'away'

         if team == 'home':
            match.home_score += 1
         elif team == 'away':
           match.away_score += 1
         else:
           return jsonify({'error': 'team must be home or away'}), 400

         db.session.commit()


         socketio.emit('goal_scored', {
              'match_id': match_id,
              'scorer': scorer,
              'minute': minute,
              'team': team,
              'home_score': match.home_score,
              'away_score': match.away_score,
              'message': f'GOAL! {scorer} scores in minute {minute}!'
              })


         return jsonify({
            'message': 'Goal recorded and fans notified',
            'home_score': match.home_score,
            'away_score': match.away_score
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500





@notifications_bp.route('/match-update', methods=['POST'])
@jwt_required()
def update_match_status():
   """
Update match status and notify all connected fans
---
tags:
  - Notifications
security:
  - Bearer: []
parameters:
  - in: body
    name: body
    required: true
    schema:
      properties:
        match_id:
          type: integer
          description: ID of the match
        status:
          type: string
          description: New match status - live, finished, upcoming
responses:
  200:
    description: Match status updated and fans notified
  403:
    description: Admins only
  404:
    description: Match not found
"""
   try:
        current_user = json.loads(get_jwt_identity())

        if current_user['role'] != 'admin':
            return jsonify({'error': 'Admins only'}), 403

        data = request.get_json()
        match_id = data.get('match_id')
        status = data.get('status')

        if not all([match_id, status]):
            return jsonify({'error': 'All fields are required'}), 400

         # Validate status
        if status not in ['upcoming', 'live', 'finished']:
            return jsonify({'error': 'Invalid status'}), 400


         # Find and update match
        match = Match.query.filter_by(id=match_id).first()
        if not match:
            return jsonify({'error': 'Match not found'}), 404

        match.status = status
        db.session.commit()

           # Broadcast status update to ALL connected fans
        socketio.emit('match_status_updated', {
            'match_id': match_id,
            'status': status,
            'message': f'Match is now {status}!'
        })

        return jsonify({
            'message': f'Match status updated to {status}',
            'match': match.to_dict()
        }), 200

   except Exception as e:
        return jsonify({'error': str(e)}), 500