"""
NayePankh 3D Volunteer Nexus — Database Seeder
Creates admin user, 25 sample volunteers, and 8 sample events.
"""

import random
from datetime import datetime, timedelta, timezone

from app import app
from models import db, User, Volunteer, Event

# ── Seed Data ─────────────────────────────────────────────────────────

VOLUNTEERS = [
    {'name': 'Aarav Sharma', 'age': 22, 'city': 'Mumbai', 'state': 'Maharashtra', 'phone': '+91-9876543210', 'lat': 19.0760, 'lng': 72.8777},
    {'name': 'Priya Patel', 'age': 20, 'city': 'Delhi', 'state': 'Delhi', 'phone': '+91-9876543211', 'lat': 28.6139, 'lng': 77.2090},
    {'name': 'Rohan Gupta', 'age': 24, 'city': 'Bangalore', 'state': 'Karnataka', 'phone': '+91-9876543212', 'lat': 12.9716, 'lng': 77.5946},
    {'name': 'Ananya Singh', 'age': 19, 'city': 'Kolkata', 'state': 'West Bengal', 'phone': '+91-9876543213', 'lat': 22.5726, 'lng': 88.3639},
    {'name': 'Vikram Reddy', 'age': 25, 'city': 'Chennai', 'state': 'Tamil Nadu', 'phone': '+91-9876543214', 'lat': 13.0827, 'lng': 80.2707},
    {'name': 'Sneha Mishra', 'age': 21, 'city': 'Lucknow', 'state': 'Uttar Pradesh', 'phone': '+91-9876543215', 'lat': 26.8467, 'lng': 80.9462},
    {'name': 'Arjun Nair', 'age': 23, 'city': 'Pune', 'state': 'Maharashtra', 'phone': '+91-9876543216', 'lat': 18.5204, 'lng': 73.8567},
    {'name': 'Kavya Joshi', 'age': 20, 'city': 'Jaipur', 'state': 'Rajasthan', 'phone': '+91-9876543217', 'lat': 26.9124, 'lng': 75.7873},
    {'name': 'Rahul Verma', 'age': 26, 'city': 'Hyderabad', 'state': 'Telangana', 'phone': '+91-9876543218', 'lat': 17.3850, 'lng': 78.4867},
    {'name': 'Ishita Desai', 'age': 18, 'city': 'Ahmedabad', 'state': 'Gujarat', 'phone': '+91-9876543219', 'lat': 23.0225, 'lng': 72.5714},
    {'name': 'Aditya Kumar', 'age': 27, 'city': 'Mumbai', 'state': 'Maharashtra', 'phone': '+91-9876543220', 'lat': 19.0860, 'lng': 72.8897},
    {'name': 'Meera Iyer', 'age': 22, 'city': 'Delhi', 'state': 'Delhi', 'phone': '+91-9876543221', 'lat': 28.6239, 'lng': 77.2190},
    {'name': 'Saurabh Tiwari', 'age': 24, 'city': 'Bangalore', 'state': 'Karnataka', 'phone': '+91-9876543222', 'lat': 12.9816, 'lng': 77.6046},
    {'name': 'Divya Chauhan', 'age': 19, 'city': 'Kolkata', 'state': 'West Bengal', 'phone': '+91-9876543223', 'lat': 22.5826, 'lng': 88.3739},
    {'name': 'Karthik Menon', 'age': 28, 'city': 'Chennai', 'state': 'Tamil Nadu', 'phone': '+91-9876543224', 'lat': 13.0927, 'lng': 80.2807},
    {'name': 'Neha Agarwal', 'age': 21, 'city': 'Lucknow', 'state': 'Uttar Pradesh', 'phone': '+91-9876543225', 'lat': 26.8567, 'lng': 80.9562},
    {'name': 'Yash Malhotra', 'age': 23, 'city': 'Pune', 'state': 'Maharashtra', 'phone': '+91-9876543226', 'lat': 18.5304, 'lng': 73.8667},
    {'name': 'Pooja Saxena', 'age': 20, 'city': 'Jaipur', 'state': 'Rajasthan', 'phone': '+91-9876543227', 'lat': 26.9224, 'lng': 75.7973},
    {'name': 'Amit Rao', 'age': 25, 'city': 'Hyderabad', 'state': 'Telangana', 'phone': '+91-9876543228', 'lat': 17.3950, 'lng': 78.4967},
    {'name': 'Tanvi Bhatt', 'age': 22, 'city': 'Ahmedabad', 'state': 'Gujarat', 'phone': '+91-9876543229', 'lat': 23.0325, 'lng': 72.5814},
    {'name': 'Nikhil Kapoor', 'age': 26, 'city': 'Mumbai', 'state': 'Maharashtra', 'phone': '+91-9876543230', 'lat': 19.0660, 'lng': 72.8677},
    {'name': 'Riya Banerjee', 'age': 19, 'city': 'Delhi', 'state': 'Delhi', 'phone': '+91-9876543231', 'lat': 28.6339, 'lng': 77.2290},
    {'name': 'Harsh Pandey', 'age': 24, 'city': 'Bangalore', 'state': 'Karnataka', 'phone': '+91-9876543232', 'lat': 12.9616, 'lng': 77.5846},
    {'name': 'Simran Kaur', 'age': 21, 'city': 'Lucknow', 'state': 'Uttar Pradesh', 'phone': '+91-9876543233', 'lat': 26.8367, 'lng': 80.9362},
    {'name': 'Deepak Yadav', 'age': 23, 'city': 'Jaipur', 'state': 'Rajasthan', 'phone': '+91-9876543234', 'lat': 26.9024, 'lng': 75.7773},
]

ALL_SKILLS = [
    'Python', 'JavaScript', 'React', 'Flask', 'Data Analysis',
    'Machine Learning', 'UI/UX', 'Content Writing', 'Social Media', 'Fundraising',
]

STATUSES = ['pending', 'approved', 'approved', 'approved', 'rejected']  # weighted toward approved

BIOS = [
    'Passionate about social change and community building.',
    'Aspiring data scientist who loves giving back to society.',
    'Creative designer with a heart for education.',
    'Tech enthusiast volunteering to bridge the digital divide.',
    'Environmental activist committed to a greener future.',
    'Believes every child deserves access to quality education.',
    'Healthcare advocate who organizes free health camps.',
    'Social media strategist spreading awareness for good causes.',
    'Youth leader inspiring peers to contribute to society.',
    'Fundraising expert with experience in NGO operations.',
]

AVAILABILITY_OPTIONS = [
    'Weekends', 'Weekdays', 'Full-time', 'Flexible',
    'Evenings only', 'Mornings only', 'Weekends and holidays',
]

EVENTS = [
    {
        'title': 'Education Drive 2026',
        'date': '2026-07-15',
        'location': 'Lucknow, Uttar Pradesh',
        'description': 'A mega education drive providing free books, stationery, and mentorship to 500+ underprivileged children across Lucknow.',
        'image_url': '/static/assets/images/education.png',
        'volunteer_count': 120,
    },
    {
        'title': 'Tree Plantation — Green India',
        'date': '2026-08-05',
        'location': 'Delhi NCR',
        'description': 'Join us in planting 10,000 trees across Delhi NCR. Together we can combat air pollution and create a greener tomorrow.',
        'image_url': '/static/assets/images/environment.png',
        'volunteer_count': 250,
    },
    {
        'title': 'Free Health Camp',
        'date': '2026-06-20',
        'location': 'Mumbai, Maharashtra',
        'description': 'Free medical check-ups, eye tests, and medicine distribution for underserved communities in Mumbai suburbs.',
        'image_url': '/static/assets/images/healthcare.png',
        'volunteer_count': 80,
    },
    {
        'title': 'Blood Donation Camp',
        'date': '2026-07-01',
        'location': 'Bangalore, Karnataka',
        'description': 'Every drop counts! Donate blood and save lives. Refreshments and certificates provided for all donors.',
        'image_url': '/static/assets/images/healthcare.png',
        'volunteer_count': 150,
    },
    {
        'title': 'Clean City Campaign',
        'date': '2026-08-15',
        'location': 'Chennai, Tamil Nadu',
        'description': 'A city-wide cleanliness drive on Independence Day. Cleaning beaches, parks, and public spaces across Chennai.',
        'image_url': '/static/assets/images/environment.png',
        'volunteer_count': 200,
    },
    {
        'title': 'Food Distribution Drive',
        'date': '2026-06-25',
        'location': 'Kolkata, West Bengal',
        'description': 'Distributing nutritious meals to 1,000+ homeless and daily wage workers in Kolkata.',
        'image_url': '/static/assets/images/food.png',
        'volunteer_count': 100,
    },
    {
        'title': 'Digital Literacy Workshop',
        'date': '2026-07-20',
        'location': 'Jaipur, Rajasthan',
        'description': 'Teaching basic computer skills, internet safety, and digital tools to rural youth and senior citizens.',
        'image_url': '/static/assets/images/education.png',
        'volunteer_count': 60,
    },
    {
        'title': 'Women Empowerment Summit',
        'date': '2026-09-01',
        'location': 'Hyderabad, Telangana',
        'description': 'A one-day summit with workshops on self-defence, financial literacy, and entrepreneurship for women.',
        'image_url': '/static/assets/images/women.png',
        'volunteer_count': 180,
    },
]


def seed():
    """Populate the database with sample data."""
    random.seed(42)

    with app.app_context():
        db.create_all()

        # ── Admin User ────────────────────────────────────────────────
        if not User.query.filter_by(email='admin@nayepankh.com').first():
            admin = User(email='admin@nayepankh.com', role='admin')
            admin.set_password('admin123')
            db.session.add(admin)
            print('[SUCCESS] Admin user created: admin@nayepankh.com / admin123')
        else:
            print('[INFO] Admin user already exists.')

        # ── Volunteers ────────────────────────────────────────────────
        created_vols = 0
        for v in VOLUNTEERS:
            email = v['name'].lower().replace(' ', '.') + '@volunteer.nayepankh.com'
            if User.query.filter_by(email=email).first():
                continue

            user = User(email=email, role='volunteer')
            user.set_password('volunteer123')
            db.session.add(user)
            db.session.flush()

            num_skills = random.randint(2, 5)
            skills = ','.join(random.sample(ALL_SKILLS, num_skills))
            status = random.choice(STATUSES)
            retention = round(random.uniform(0.25, 0.95), 4)
            engagement = round(random.uniform(2.0, 9.5), 2)

            vol = Volunteer(
                user_id=user.id,
                name=v['name'],
                age=v['age'],
                city=v['city'],
                state=v['state'],
                phone=v['phone'],
                bio=random.choice(BIOS),
                skills=skills,
                availability=random.choice(AVAILABILITY_OPTIONS),
                status=status,
                retention_score=retention,
                engagement_score=engagement,
                latitude=v['lat'],
                longitude=v['lng'],
                created_at=datetime.now(timezone.utc) - timedelta(days=random.randint(1, 90)),
            )
            db.session.add(vol)
            created_vols += 1

        print(f'[SUCCESS] Created {created_vols} sample volunteers.')

        # ── Events ────────────────────────────────────────────────────
        created_events = 0
        for e in EVENTS:
            if not Event.query.filter_by(title=e['title']).first():
                event = Event(**e)
                db.session.add(event)
                created_events += 1

        print(f'[SUCCESS] Created {created_events} sample events.')

        db.session.commit()
        print('\n[SUCCESS] Database seeded successfully!')


if __name__ == '__main__':
    seed()
