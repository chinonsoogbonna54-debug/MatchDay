from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, User, Match, Ticket, StadiumSection
from app import mail
from flask_mail import Message
import json
import uuid
import qrcode
import os
import hmac
import hashlib
import requests
from datetime import datetime




tickets_bp = Blueprint('tickets', __name__)


@tickets_bp.route('/book' , methods=['POST'])
@jwt_required()
def book_ticket():
    """
Book a ticket for a match
---
tags:
  - Tickets
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
          description: ID of the match to book
        section_id:
          type: integer
          description: ID the stadium section (VIP, Premium, Regular)
        payment_method:
          type: string
          description: Either 'paystack' or 'stripe'
responses:
  201:
    description: Ticket created and payment URL returned
  400:
    description: Match sold out, already booked or invalid data
  403:
    description: Fans only
  404:
    description: Match or section not found
"""
    try:
        current_user = json.loads(get_jwt_identity())

        if current_user['role'] != 'fan':
          return jsonify({'error': 'Fans only'}), 403
        
        data = request.get_json()
        match_id = data.get('match_id')
        section_id = data.get('section_id')

        match = Match.query.filter_by(id=match_id).first()

        if not match:
            return jsonify({'error': 'Match not found'}), 404

        if match.status != 'upcoming':
             return jsonify({'error': 'Match is not available for booking'}), 400
        
        section = StadiumSection.query.filter_by(id=section_id).first()

        if not section:
            return jsonify({'error': 'Section not found'}), 404

        if section.available_seats <= 0:
            return jsonify({'error': 'Section is sold out'}), 400
        

        existing_ticket = Ticket.query.filter_by(
            fan_id=current_user['id'],
            match_id=match_id,
            payment_status='paid'
        ).first()

        if existing_ticket:
            return jsonify({'error': 'You already have a ticket for this match'}), 400
        
        #Generate payment reference
        payment_reference = f"MATCHDAY-{uuid.uuid4().hex[:12]}"


        #Create pending ticke
        new_ticket = Ticket(
                fan_id=current_user['id'],
                match_id=match_id,
                section_id=section_id,
                payment_reference=payment_reference,
                payment_status='pending'
            )
        
        db.session.add(new_ticket)
        db.session.commit()

        #Initialize Paystack payment
        user = User.query.filter_by(id=current_user['id']).first()
        amount = int(section.price * 100)

        headers = {
            'Authorization': f"Bearer {current_app.config['PAYSTACK_SECRET_KEY']}",
            'Content-Type': 'application/json'
        }

        payload = {
            'email': user.email,
            'amount': amount,
            'reference': payment_reference,
            'callback_url': 'http://localhost:3000/payment/success'
        }

        response = requests.post(
            'https://api.paystack.co/transaction/initialize',
            json=payload,
            headers=headers
        )

        data = response.json()
        payment_url = data['data']['authorization_url']

        #Return payment URL
        return jsonify({
            'message': 'Ticket created successfully',
            'ticket': new_ticket.to_dict(),
            'payment_url': payment_url
        }), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500



        
        

@tickets_bp.route('/paystack/webhook' , methods=['POST'])
def paystack_webhook():
    """Handle Paystack payment webhook for matchday tickets"""
    try:
        # Step 1 - Verify signature
        paystack_signature = request.headers.get('x-paystack-signature')
        secret = current_app.config['PAYSTACK_SECRET_KEY']

        expected = hmac.new(
            secret.encode('utf-8'),
            request.data,
            hashlib.sha512
        ).hexdigest()

        if not hmac.compare_digest(paystack_signature, expected):
            return jsonify({'error': 'Invalid signature'}), 401

         # Step 2 - Get event data
        event = request.get_json()

            # Step 3 - Only process successful payments
        if event.get('event') != 'charge.success':
            return jsonify({'message': 'Event ignored'}), 200

        # Step 4 - Get reference from event
        reference = event['data']['reference']

        # Step 5 - Find cinema ticket by reference
        ticket = Ticket.query.filter_by(
            payment_reference=reference
        ).first()

        if not ticket:
            return jsonify({'error': 'Ticket not found'}), 404

          # Step 6 - Idempotency check - already processed?
        if ticket.payment_status == 'paid':
            return jsonify({'message': 'Already processed'}), 200

        # Step 7 - Find the cinema seat section
        stadium_section = StadiumSection.query.filter_by(
            id=ticket.section_id
        ).first()

            # Step 8 - Generate QR code
        qr_data = f"MATCHDAY-TICKET-{ticket.id}-{reference}"
        qr = qrcode.make(qr_data)
        qr_folder = 'static/qrcodes'
        os.makedirs(qr_folder, exist_ok=True)
        qr_path = f"{qr_folder}/matchday_ticket_{ticket.id}.png"
        qr.save(qr_path)


           # Step 9 - Update everything in one transaction
        ticket.payment_status = 'paid'
        ticket.qr_code = qr_path
        stadium_section.available_seats -= 1
        db.session.commit()

         # Step 10 - Send email AFTER commit
        fan = ticket.fan
        msg = Message(
            subject='Matchday — Your Ticket is Confirmed!',
            recipients=[fan.email],
            body=f"""
Hello {fan.firstname},

Your Matchday ticket is confirmed!

Match:  {ticket.match.home_club.name} vs {ticket.match.away_club.name}
Date: {ticket.match.date}
Section: {stadium_section.name}
Reference: {reference}

Show your QR code at the entrance.

Enjoy the Match!
Matchday Team
            """
        )
        try:
            mail.send(msg)
            ticket.email_sent = True
            db.session.commit()
        except:
            # Email failed but ticket is paid - can retry later
            pass

        return jsonify({'message': 'Payment processed successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500




@tickets_bp.route('/my-tickets' , methods=['GET'])
@jwt_required()
def get_tickets():
        """
Get all football Games Tickets
---
tags:
  - Tickets
responses:
  200:
    description: List of all Football Games Tickets
"""
        try:
            current_user = json.loads(get_jwt_identity())

            if current_user['role'] != 'fan':
              return jsonify({'error': 'Fans only'}), 403

            
            tickets = Ticket.query.filter_by(
            fan_id=current_user['id'],
            payment_status='paid'
             ).all()

            return jsonify({
                    'tickets': [ticket.to_dict() for ticket in tickets]
                }), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500





@tickets_bp.route('/<int:ticket_id>' , methods=['GET'])
def get_single_ticket(ticket_id):
    """
Get a single ticket by ID
---
tags:
  - Tickets
parameters:
  - in: path
    name: ticket_id
    type: integer
    required: true
    description: ID of the ticket
responses:
  200:
    description: Ticket details
  404:
    description: Ticket not found
"""
    try:
        ticket = Ticket.query.filter_by(id=ticket_id).first()

        if not ticket:
                    return jsonify({'error': 'Ticket not found'}), 404

        return jsonify({
                'ticket': ticket.to_dict()
            }), 200
    
    except Exception as e:
            return jsonify({'error': str(e)}), 500