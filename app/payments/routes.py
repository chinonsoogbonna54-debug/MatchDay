from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, User, Ticket, StadiumSection
from app import mail
from flask_mail import Message
import json
import stripe
import qrcode
import os


payments_bp = Blueprint('payments', __name__)



@payments_bp.route('/create-intent', methods=['POST'])
@jwt_required()
def create_payment_intent():
      """
    Create a Stripe payment intent for matchday booking
    ---
    tags:
      - Payments
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          properties:
            booking_id:
              type: integer
              description: ID of the matchday booking to pay for
    responses:
      200:
        description: Payment intent created successfully
      400:
        description: Booking already paid or invalid
      403:
        description: Fans only
      404:
        description: Booking not found
    """
      try:
             current_user = json.loads(get_jwt_identity())
            
             if current_user['role'] != 'fan':
                          return jsonify({'error': 'Fans only'}), 403

             data = request.get_json()
             ticket_id = data.get('ticket_id')

             if not ticket_id:
              return jsonify({'error': 'ticket_id is required'}), 400

             ticket = Ticket.query.filter_by(id=ticket_id).first()

             if not ticket:
                    return jsonify({'error': 'Ticket not found'}), 404

             if ticket.fan_id != current_user['id']:
                return jsonify({'error': 'Unauthorized'}), 403

             if ticket.payment_status != 'pending':
                return jsonify({'error': 'Booking already paid'}), 400

             section = StadiumSection.query.filter_by(id=ticket.section_id).first()

             amount = int(section.price * 100)  # convert to cents

                     # Set Stripe API key
             stripe.api_key = current_app.config['STRIPE_SECRET_KEY']

                 # Create payment intent
             intent = stripe.PaymentIntent.create(
            amount=amount,
            currency='usd',
            metadata={
                'booking_id': ticket.id,
                'payment_reference': ticket.payment_reference
                }
            )

             return jsonify({
            'message': 'Payment intent created',
            'client_secret': intent.client_secret,
            'amount': amount,
            'currency': 'usd'
            }), 200

      except Exception as e:
        return jsonify({'error': str(e)}), 500






@payments_bp.route('/stripe/webhook', methods=['POST'])
def stripe_webhook():
    """Handle Stripe payment webhook for matchday tickets"""
    try:
        stripe.api_key = current_app.config['STRIPE_SECRET_KEY']
        stripe_signature = request.headers.get('Stripe-Signature')
        webhook_secret = current_app.config['STRIPE_WEBHOOK_SECRET']

        # Verify webhook signature
        try:
            event = stripe.Webhook.construct_event(
                request.data,
                stripe_signature,
                webhook_secret
            )
        except stripe.error.SignatureVerificationError:
            return jsonify({'error': 'Invalid signature'}), 401

        # Only process successful payments
        if event['type'] != 'payment_intent.succeeded':
            return jsonify({'message': 'Event ignored'}), 200

        # Get payment reference from metadata
        payment_intent = event['data']['object']
        reference = payment_intent['metadata']['payment_reference']

         # Find ticket by reference
        ticket = Ticket.query.filter_by(
            payment_reference=reference
        ).first()

        if not ticket:
            return jsonify({'error': 'Ticket not found'}), 404

        # Idempotency check
        if ticket.payment_status == 'paid':
            return jsonify({'message': 'Already processed'}), 200

        # Find section
        section = StadiumSection.query.filter_by(id=ticket.section_id).first()

         # Generate QR code
        qr_data = f"MATCHDAY-TICKET-{ticket.id}-{reference}"
        qr = qrcode.make(qr_data)
        qr_folder = 'static/qrcodes'
        os.makedirs(qr_folder, exist_ok=True)
        qr_path = f"{qr_folder}/matchday_ticket_{ticket.id}.png"
        qr.save(qr_path)

        # Update everything in one transaction
        ticket.payment_status = 'paid'
        ticket.qr_code = qr_path
        section.available_seats -= 1
        db.session.commit()

         # Send email after commit
        fan = ticket.fan
        msg = Message(
            subject='Matchday — Your Ticket is Confirmed!',
            recipients=[fan.email],
            body=f"""
Hello {fan.firstname},

Your Matchday ticket is confirmed!

Match:  {ticket.match.home_club.name} vs {ticket.match.away_club.name}
Date: {ticket.match.date}
Section: {section.name}
Reference: {reference}

Show your QR code at reception.

Enjoy the Match!
Matchday Team
            """
        )
        try:
            mail.send(msg)
            ticket.email_sent = True
            db.session.commit()
        except:
            pass

        return jsonify({'message': 'Payment processed successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
