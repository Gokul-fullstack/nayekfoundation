"""
NayePankh 3D Volunteer Nexus — Main Flask Application
"""

import csv
import io
import uuid
from datetime import datetime, timedelta, timezone

from flask import (
    Flask, request, jsonify, render_template, send_file, g,
)
from flask_cors import CORS

from config import Config
from models import db, User, Volunteer, ChatMessage, Event
from auth import generate_token, login_required, admin_required
from ml.predict import predict_retention
from chatbot.gemini_chat import chat_with_gemini
from chatbot.fallback_chat import fallback_chat
from reports.pdf_generator import generate_report

# ──────────────────────────────────────────────────────────────────────
# App Factory
# ──────────────────────────────────────────────────────────────────────

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)
CORS(app)


@app.before_request
def _create_tables():
    """Create database tables on the very first request."""
    db.create_all()
    # Remove this hook after first execution so it doesn't run again
    app.before_request_funcs[None].remove(_create_tables)


# ──────────────────────────────────────────────────────────────────────
# Page Routes (render_template)
# ──────────────────────────────────────────────────────────────────────

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/about')
def about():
    return render_template('about.html')


@app.route('/initiatives')
def initiatives():
    return render_template('initiatives.html')


@app.route('/events')
def events_page():
    return render_template('events.html')


@app.route('/contact')
def contact_page():
    return render_template('contact.html')


@app.route('/register')
def register_page():
    return render_template('register.html')


@app.route('/login')
def login_page():
    return render_template('login.html')


@app.route('/dashboard')
def dashboard_page():
    return render_template('dashboard.html')


@app.route('/admin')
def admin_page():
    return render_template('admin.html')


# ──────────────────────────────────────────────────────────────────────
# Auth API
# ──────────────────────────────────────────────────────────────────────

@app.route('/api/auth/register', methods=['POST'])
def api_register():
    data = request.get_json(silent=True) or {}

    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 409

    # Create user
    user = User(email=email, role='volunteer')
    user.set_password(password)
    db.session.add(user)
    db.session.flush()  # get user.id

    # Create volunteer profile
    skills_raw = data.get('skills', '')
    if isinstance(skills_raw, list):
        skills_raw = ','.join(skills_raw)

    volunteer = Volunteer(
        user_id=user.id,
        name=data.get('name', ''),
        age=int(data.get('age', 0)),
        city=data.get('city', ''),
        state=data.get('state', ''),
        phone=data.get('phone', ''),
        bio=data.get('bio', ''),
        skills=skills_raw,
        availability=data.get('availability', ''),
        latitude=data.get('latitude'),
        longitude=data.get('longitude'),
        status='pending',
    )

    # Run retention prediction
    pred = predict_retention({
        'age': volunteer.age,
        'skills_count': len(skills_raw.split(',')) if skills_raw else 1,
        'city_tier': 2,
        'past_events': 0,
        'hours_volunteered': 0,
        'distance_km': 10,
        'has_referral': 0,
        'communication_score': 5,
    })
    volunteer.retention_score = pred['probability']
    volunteer.engagement_score = pred['engagement_score']

    db.session.add(volunteer)
    db.session.commit()

    token = generate_token(user.id, user.role)
    return jsonify({
        'message': 'Registration successful',
        'token': token,
        'role': user.role,
        'volunteer_id': volunteer.id,
    }), 201


@app.route('/api/auth/login', methods=['POST'])
def api_login():
    data = request.get_json(silent=True) or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()
    if user is None or not user.check_password(password):
        return jsonify({'error': 'Invalid email or password'}), 401

    token = generate_token(user.id, user.role)
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'role': user.role,
        'user_id': user.id,
    })


# ──────────────────────────────────────────────────────────────────────
# Volunteer API
# ──────────────────────────────────────────────────────────────────────

@app.route('/api/volunteers/me', methods=['GET'])
@login_required
def api_get_my_profile():
    volunteer = Volunteer.query.filter_by(user_id=g.user_id).first()
    if not volunteer:
        return jsonify({'error': 'Volunteer profile not found'}), 404

    d = volunteer.to_dict()
    # Dynamically derive stats from engagement_score for display
    d['hours_volunteered'] = int((volunteer.engagement_score or 0.0) * 8)
    d['events_attended'] = int((volunteer.engagement_score or 0.0) / 1.8)
    
    # Calculate recommended events
    events = Event.query.all()
    recommended = []
    # Match location first (city or state)
    for e in events:
        if volunteer.city.lower() in e.location.lower() or volunteer.state.lower() in e.location.lower():
            recommended.append(e.to_dict())
    
    # Pad recommendations with latest events
    for e in sorted(events, key=lambda x: x.date, reverse=True):
        if len(recommended) >= 3:
            break
        e_dict = e.to_dict()
        if e_dict not in recommended:
            recommended.append(e_dict)
            
    d['recommended_events'] = recommended[:3]
    return jsonify(d)


@app.route('/api/volunteers/me', methods=['PUT'])
@login_required
def api_update_my_profile():
    volunteer = Volunteer.query.filter_by(user_id=g.user_id).first()
    if not volunteer:
        return jsonify({'error': 'Volunteer profile not found'}), 404

    data = request.get_json(silent=True) or {}
    
    # Update fields
    volunteer.name = data.get('name', volunteer.name).strip()
    volunteer.phone = data.get('phone', volunteer.phone).strip()
    
    age_val = data.get('age')
    if age_val is not None:
        volunteer.age = int(age_val)
        
    volunteer.city = data.get('city', volunteer.city).strip()
    volunteer.state = data.get('state', volunteer.state).strip()
    volunteer.bio = data.get('bio', volunteer.bio).strip()
    
    skills_raw = data.get('skills', volunteer.skills)
    if isinstance(skills_raw, list):
        skills_raw = ','.join(skills_raw)
    volunteer.skills = skills_raw

    # Re-run retention prediction on profile update
    pred = predict_retention({
        'age': volunteer.age,
        'skills_count': len(skills_raw.split(',')) if skills_raw else 1,
        'city_tier': 2,
        'past_events': int((volunteer.engagement_score or 0.0) / 1.8),
        'hours_volunteered': int((volunteer.engagement_score or 0.0) * 8),
        'distance_km': 10,
        'has_referral': 1 if volunteer.id % 2 == 0 else 0,
        'communication_score': 7,
    })
    volunteer.retention_score = pred['probability']
    volunteer.engagement_score = pred['engagement_score']

    db.session.commit()
    
    d = volunteer.to_dict()
    d['hours_volunteered'] = int((volunteer.engagement_score or 0.0) * 8)
    d['events_attended'] = int((volunteer.engagement_score or 0.0) / 1.8)
    return jsonify({'message': 'Profile updated successfully', 'volunteer': d})


@app.route('/api/volunteers', methods=['GET'])
@admin_required
def api_volunteers():
    query = Volunteer.query

    status_filter = request.args.get('status')
    city_filter = request.args.get('city')
    search_term = request.args.get('search')

    if status_filter:
        query = query.filter_by(status=status_filter)
    if city_filter:
        query = query.filter(Volunteer.city.ilike(f'%{city_filter}%'))
    if search_term:
        query = query.filter(
            (Volunteer.name.ilike(f'%{search_term}%'))
            | (Volunteer.city.ilike(f'%{search_term}%'))
            | (Volunteer.skills.ilike(f'%{search_term}%'))
        )

    volunteers = query.order_by(Volunteer.created_at.desc()).all()

    result = []
    for v in volunteers:
        d = v.to_dict()
        # Attach retention prediction
        d['retention'] = {
            'probability': v.retention_score,
            'risk_level': (
                'low' if (v.retention_score or 0) >= 0.7
                else 'medium' if (v.retention_score or 0) >= 0.4
                else 'high'
            ),
            'engagement_score': v.engagement_score,
        }
        result.append(d)

    return jsonify(result)


@app.route('/api/volunteers/<int:vol_id>/status', methods=['PUT'])
@admin_required
def api_update_volunteer_status(vol_id):
    volunteer = Volunteer.query.get_or_404(vol_id)
    data = request.get_json(silent=True) or {}
    new_status = data.get('status')

    if new_status not in ('approved', 'rejected'):
        return jsonify({'error': 'Status must be approved or rejected'}), 400

    volunteer.status = new_status
    db.session.commit()
    return jsonify({'message': f'Volunteer {new_status}', 'volunteer': volunteer.to_dict()})


# ──────────────────────────────────────────────────────────────────────
# Stats API
# ──────────────────────────────────────────────────────────────────────

@app.route('/api/stats', methods=['GET'])
def api_stats():
    total = Volunteer.query.count()
    pending = Volunteer.query.filter_by(status='pending').count()
    approved = Volunteer.query.filter_by(status='approved').count()
    rejected = Volunteer.query.filter_by(status='rejected').count()

    active_cities = db.session.query(
        db.func.count(db.func.distinct(Volunteer.city))
    ).scalar() or 0

    avg_retention = db.session.query(
        db.func.avg(Volunteer.retention_score)
    ).scalar() or 0.0

    # Recent signups — last 30 days, grouped by day
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    recent_rows = (
        db.session.query(
            db.func.date(Volunteer.created_at).label('day'),
            db.func.count(Volunteer.id).label('count'),
        )
        .filter(Volunteer.created_at >= thirty_days_ago)
        .group_by(db.func.date(Volunteer.created_at))
        .order_by(db.func.date(Volunteer.created_at))
        .all()
    )
    recent_signups = [{'date': str(r.day), 'count': r.count} for r in recent_rows]

    return jsonify({
        'total_volunteers': total,
        'pending_count': pending,
        'approved_count': approved,
        'rejected_count': rejected,
        'active_cities': active_cities,
        'avg_retention_score': round(float(avg_retention), 4),
        'recent_signups': recent_signups,
    })


# ──────────────────────────────────────────────────────────────────────
# ML Prediction API
# ──────────────────────────────────────────────────────────────────────

@app.route('/api/predict', methods=['POST'])
def api_predict():
    data = request.get_json(silent=True) or {}
    result = predict_retention(data)
    return jsonify(result)


# ──────────────────────────────────────────────────────────────────────
# Chatbot API
# ──────────────────────────────────────────────────────────────────────

@app.route('/api/chat', methods=['POST'])
def api_chat():
    data = request.get_json(silent=True) or {}
    message = data.get('message', '').strip()
    session_id = data.get('session_id', str(uuid.uuid4()))

    if not message:
        return jsonify({'error': 'Message is required'}), 400

    # Save user message
    user_msg = ChatMessage(session_id=session_id, role='user', content=message)
    db.session.add(user_msg)

    # Build history from DB
    history_rows = (
        ChatMessage.query
        .filter_by(session_id=session_id)
        .order_by(ChatMessage.created_at.asc())
        .limit(20)
        .all()
    )
    history = [{'role': m.role, 'content': m.content} for m in history_rows]

    # Try Gemini first, fallback to rule-based
    result = chat_with_gemini(message, history)
    if result is None:
        result = fallback_chat(message)

    # Save assistant reply
    bot_msg = ChatMessage(session_id=session_id, role='assistant', content=result['reply'])
    db.session.add(bot_msg)
    db.session.commit()

    return jsonify({
        'reply': result['reply'],
        'suggestions': result.get('suggestions', []),
        'session_id': session_id,
    })


# ──────────────────────────────────────────────────────────────────────
# Reports API
# ──────────────────────────────────────────────────────────────────────

@app.route('/api/report/pdf', methods=['GET'])
@admin_required
def api_report_pdf():
    volunteers = Volunteer.query.order_by(Volunteer.created_at.desc()).all()
    volunteers_data = [v.to_dict() for v in volunteers]

    total = len(volunteers_data)
    approved = sum(1 for v in volunteers_data if v['status'] == 'approved')
    pending = sum(1 for v in volunteers_data if v['status'] == 'pending')
    rejected = sum(1 for v in volunteers_data if v['status'] == 'rejected')
    avg_ret = (
        sum(v.get('retention_score', 0) or 0 for v in volunteers_data) / total
        if total else 0
    )

    stats = {
        'total_volunteers': total,
        'approved_count': approved,
        'pending_count': pending,
        'rejected_count': rejected,
        'avg_retention_score': avg_ret,
    }

    buf = generate_report(volunteers_data, stats)
    return send_file(
        buf,
        mimetype='application/pdf',
        as_attachment=True,
        download_name='nayepankh_volunteer_report.pdf',
    )


@app.route('/api/export/csv', methods=['GET'])
@admin_required
def api_export_csv():
    volunteers = Volunteer.query.order_by(Volunteer.created_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        'ID', 'Name', 'Age', 'City', 'State', 'Phone', 'Skills',
        'Status', 'Retention Score', 'Engagement Score', 'Created At',
    ])
    for v in volunteers:
        writer.writerow([
            v.id, v.name, v.age, v.city, v.state, v.phone,
            v.skills, v.status, v.retention_score, v.engagement_score,
            v.created_at.isoformat() if v.created_at else '',
        ])

    buf = io.BytesIO(output.getvalue().encode('utf-8'))
    buf.seek(0)
    return send_file(
        buf,
        mimetype='text/csv',
        as_attachment=True,
        download_name='nayepankh_volunteers.csv',
    )


# ──────────────────────────────────────────────────────────────────────
# Events API
# ──────────────────────────────────────────────────────────────────────

@app.route('/api/events', methods=['GET'])
def api_events():
    events = Event.query.order_by(Event.date.desc()).all()
    return jsonify([e.to_dict() for e in events])


# ──────────────────────────────────────────────────────────────────────
# Contact API
# ──────────────────────────────────────────────────────────────────────

@app.route('/api/contact', methods=['POST'])
def api_contact():
    data = request.get_json(silent=True) or {}
    name = data.get('name', '')
    email = data.get('email', '')
    subject = data.get('subject', '')
    message = data.get('message', '')

    if not name or not email or not message:
        return jsonify({'error': 'Name, email and message are required'}), 400

    # In production this would send an email
    print(f"[Contact] From: {name} <{email}> | Subject: {subject} | Message: {message}")
    return jsonify({'message': 'Thank you for reaching out! We will get back to you soon.'})


# ──────────────────────────────────────────────────────────────────────
# Error Handlers
# ──────────────────────────────────────────────────────────────────────

@app.errorhandler(404)
def not_found(e):
    if request.path.startswith('/api/'):
        return jsonify({'error': 'Resource not found'}), 404
    return render_template('index.html'), 404


@app.errorhandler(500)
def internal_error(e):
    return jsonify({'error': 'Internal server error'}), 500


# ──────────────────────────────────────────────────────────────────────
# Entry Point
# ──────────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    app.run(debug=True, port=5000)
