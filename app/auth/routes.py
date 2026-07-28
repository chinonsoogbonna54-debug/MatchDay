from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token
from app.models import PasswordResetToken, db, User
import json
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature
from flask_mail import Message
from app import mail
from datetime import datetime, timedelta



auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/signup', methods=['POST'])
def signup():
    """
    Register a new fan
    ---
    tags:
      - Auth
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
    responses:
      201:
        description: User registered successfully
      400:
        description: User already exists or missing fields
    """
    try:
        data = request.get_json()
        firstname = data.get('firstname')
        lastname = data.get('lastname')
        email = data.get('email')
        password = data.get('password')


        if not all([firstname, lastname, email, password]):
                return jsonify({'error': 'All fields are required'}), 400
        
        existing = User.query.filter(
            (User.email == email) 
        ).first()

        if existing:
            return jsonify({'error': 'User already exists'}), 400
        
        new_user = User(
            firstname=firstname,
            lastname=lastname,
            email=email,
            role='fan'
        )


        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()


        token = create_access_token(identity=json.dumps({
            'id': new_user.id,
            'role': new_user.role,
            'firstname': new_user.firstname
        }))


        return jsonify({
            'message': 'User registered successfully',
            'token': token,
            'user': new_user.to_dict()
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

        

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Login a user
    ---
    tags:
      - Auth
    parameters:
      - in: body
        name: body
        required: true
        schema:
          properties:
            identifier:
              type: string
              description:  email
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
         

         user = User.query.filter(
            (User.email == email) 
        ).first()
         
         if not user:
            return jsonify({'error': 'User not found'}), 404
         

         if not user.check_password(password):
            return jsonify({'error': 'Wrong password'}), 401
         
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
         

   

          
@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
      """
Request a password reset link
---
tags:
  - Auth
parameters:
  - in: body
    name: body
    required: true
    schema:
      properties:
        email:
          type: string
          description: Your registered email address
responses:
  200:
    description: Reset link sent if email exists
  400:
    description: Email is required
        """
      try:
           data = request.get_json()
           email = data.get('email')


           if not email:
            return jsonify({'error': 'Email is required'}), 400
           

           user = User.query.filter(
            (User.email == email) 
        ).first()
           
           if not user:
            return jsonify({'message': 'If this email exists you will receive a reset link'}), 200
           

           # Generate token using itsdangerous
           s = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
           token = s.dumps(email, salt='matchday-password-reset')


           # Save token to database
           expires_at = datetime.utcnow() + timedelta(minutes=30)
           reset_token = PasswordResetToken(
          user_id=user.id,
          token=token,
          expires_at=expires_at
           )
           db.session.add(reset_token)
           db.session.commit()



            # Send email
           reset_link = f"http://localhost:3000/reset-password?token={token}"
           msg = Message(
            subject='MatchDay — Reset Your Password',
            recipients=[email],
            body=f"""
          Hello {user.firstname},

          You requested a password reset for your Matchday account.

          Click the link below to reset your password:
          {reset_link}

          This link expires in 30 minutes.

          If you did not request this, please ignore this email.

          MatchDay Team
                      """
                  )
           mail.send(msg)

           return jsonify({'message': 'If this email exists you will receive a reset link'}), 200

      except Exception as e:
        return jsonify({'error': str(e)}), 500


           


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
   """
Reset password using token
---
tags:
  - Auth
parameters:
  - in: body
    name: body
    required: true
    schema:
      properties:
        token:
          type: string
          description: Token received in email
        new_password:
          type: string
          description: Your new password
responses:
  200:
    description: Password reset successfully
  400:
    description: Invalid or expired token
 """
   try:
            data = request.get_json()
            token = data.get('token')
            new_password = data.get('new_password')


            if not all([token, new_password]):
             return jsonify({'error': 'All fields are required'}), 400
            

             # Find token in database
            reset_token = PasswordResetToken.query.filter_by(
            token=token,
            used=False
            ).first()


            if not reset_token:
             return jsonify({'error': 'Invalid or already used token'}), 400
            

              # Check if token is expired
            if datetime.utcnow() > reset_token.expires_at:
             return jsonify({'error': 'Token has expired'}), 400
            

             # Verify token using itsdangerous
            s = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
            try:
              email = s.loads(token, salt='matchday-password-reset', max_age=1800)
            except SignatureExpired:
              return jsonify({'error': 'Token has expired'}), 400
            except BadSignature:
             return jsonify({'error': 'Invalid token'}), 400
            

             # Find user and update password
            user = User.query.filter_by(email=email).first()
            if not user:
              return jsonify({'error': 'User not found'}), 404
            

            user.set_password(new_password)

        # Mark token as used so it can't be used again
            reset_token.used = True

            db.session.commit()

            return jsonify({'message': 'Password reset successfully'}), 200

   except Exception as e:
         return jsonify({'error': str(e)}), 500
            