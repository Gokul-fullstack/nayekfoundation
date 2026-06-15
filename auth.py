from datetime import datetime, timedelta, timezone
from functools import wraps

import jwt
from flask import request, jsonify, g, current_app


def generate_token(user_id, role):
    """Generate a JWT token that expires in 24 hours."""
    payload = {
        'user_id': user_id,
        'role': role,
        'exp': datetime.now(timezone.utc) + timedelta(hours=24),
        'iat': datetime.now(timezone.utc),
    }
    return jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')


def verify_token(token):
    """Verify a JWT token and return the payload, or None on failure."""
    try:
        payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def login_required(f):
    """Decorator that requires a valid JWT Bearer token in the Authorization header."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Missing or invalid authorization header'}), 401

        token = auth_header.split(' ', 1)[1]
        payload = verify_token(token)
        if payload is None:
            return jsonify({'error': 'Invalid or expired token'}), 401

        g.user_id = payload['user_id']
        g.user_role = payload['role']
        return f(*args, **kwargs)

    return decorated


def admin_required(f):
    """Decorator that requires a valid JWT token with admin role."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Missing or invalid authorization header'}), 401

        token = auth_header.split(' ', 1)[1]
        payload = verify_token(token)
        if payload is None:
            return jsonify({'error': 'Invalid or expired token'}), 401

        if payload.get('role') != 'admin':
            return jsonify({'error': 'Admin access required'}), 403

        g.user_id = payload['user_id']
        g.user_role = payload['role']
        return f(*args, **kwargs)

    return decorated
