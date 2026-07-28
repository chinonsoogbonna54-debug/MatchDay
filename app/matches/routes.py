from flask import Blueprint, current_app, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import requests
from app.models import db, User, StadiumSection, Match
from datetime import date
import json
import requests
from flask import current_app



matches_bp = Blueprint('matches', __name__)



@matches_bp.route('/', methods=['GET'])
def get_matches():
        """
Get all football Matches
---
tags:
  - Matches
responses:
  200:
    description: List of all Football matches
"""
        try:
            matches = Match.query.filter(
                    Match.status.in_(['upcoming', 'live'])
                ).all()

            return jsonify({
                'matches': [match.to_dict() for match in matches]
            }), 200
        
        except Exception as e:
            return jsonify({'error': str(e)}), 500





@matches_bp.route('/<int:match_id>', methods=['GET'])
def get_single_match(match_id):
    """
Get a single match by ID
---
tags:
  - Match
parameters:
  - in: path
    name: match_id
    type: integer
    required: true
    description: ID of the match
responses:
  200:
    description: Match details
  404:
    description: Match not found
"""
    try:
         match = Match.query.filter_by(id=match_id).first()

         if not match:
            return jsonify({'error': 'Match not found'}), 404
         

         sections = StadiumSection.query.filter_by(stadium_id=match.stadium_id).all()
         
         return jsonify({
              'match': match.to_dict(),
              'sections': [section.to_dict() for section in sections]
          }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

@matches_bp.route('/club/<int:club_id>', methods=['GET'])
def get_club_matches(club_id):
    """
Get all matches for a single club
---
tags:
  - Matches
parameters:
  - in: path
    name: club_id
    type: integer
    required: true
    description: ID of the club
responses:
  200:
    description: List of club matches
  404:
    description: Club not found
"""
    try:
        matches = Match.query.filter(
            (Match.home_club_id == club_id) | (Match.away_club_id == club_id)
        ).all()

        if not matches:
            return jsonify({'error': 'No matches found for this club'}), 404

        return jsonify({
            'matches': [match.to_dict() for match in matches]
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500









@matches_bp.route('/live', methods=['GET'])
def get_live_scores():
    """
    Get live football scores from external API
    ---
    tags:
      - Matches
    responses:
      200:
        description: List of live matches
      500:
        description: Failed to fetch scores
    """
    try:
        headers = {
    'X-Auth-Token': current_app.config['FOOTBALL_API_KEY']
            }


        response = requests.get(
            'https://api.football-data.org/v4/matches?status=LIVE',
            headers=headers
        )

        data = response.json()


           # Extract only what we need
        matches = []
        for match in data.get('matches', []):
            matches.append({
                'id': match['id'],
                'home_team': match['homeTeam']['name'],
                'away_team': match['awayTeam']['name'],
                'home_score': match['score']['fullTime']['home'],
                'away_score': match['score']['fullTime']['away'],
                'status': match['status'],
                'minute': match.get('minute', None),
                'competition': match['competition']['name'],
                'date': match['utcDate']
            })

        return jsonify({
            'matches': matches,
            'total': len(matches)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500





@matches_bp.route('/today', methods=['GET'])
def get_today_matches():
    """
    Get today's football matches from external API
    ---
    tags:
      - Matches
    responses:
      200:
        description: List of today's matches
      500:
        description: Failed to fetch matches
    """
    try:
        today = date.today().strftime('%Y-%m-%d')

        headers = {
            'X-Auth-Token': current_app.config['FOOTBALL_API_KEY']
                    }

        response = requests.get(
                    f'https://api.football-data.org/v4/matches?dateFrom={today}&dateTo={today}',
                    headers=headers
                )


        data = response.json()

        matches = []
        for match in data.get('matches', []):
            matches.append({
                'id': match['id'],
                'home_team': match['homeTeam']['name'],
                'away_team': match['awayTeam']['name'],
                'home_score': match['score']['fullTime']['home'],
                'away_score': match['score']['fullTime']['away'],
                'status': match['status'],
                'competition': match['competition']['name'],
                'date': match['utcDate']
            })

        return jsonify({
            'matches': matches,
            'total': len(matches)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500










     