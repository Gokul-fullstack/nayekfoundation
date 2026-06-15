# NayePankh Volunteer Nexus

**Live Demo**: [https://nayekfoundation.onrender.com](https://nayepankh-volunteer-nexus.onrender.com)

## Overview

A production-ready volunteer engagement platform developed for the NayePankh Foundation Technical Internship application. The system combines a modern, animation-rich frontend with intelligent backend services including machine learning and conversational AI.

This single project satisfies the practical project requirements (Option 2) for multiple internship roles: Full Stack Development, Front End Development, Web Development, Backend Development, Python Development, Machine Learning, and Artificial Intelligence.

## Key Features

### Frontend & User Experience
- Split-screen hero layout with dynamic typed headline
- Interactive 3D tilted glassmorphic card displaying the NayePankh volunteer team
- Node-connection particle background (tsParticles) for visual depth
- Responsive design with dark/light mode toggle
- Scroll-triggered animations (GSAP)
- Step indicators with inline vector SVGs (no emojis)
- Professional typography and glassmorphism styling

### Backend & Full Stack
- Volunteer registration and login system (JWT authentication)
- Admin dashboard with volunteer management
- RESTful API endpoints for volunteer data
- SQLite database (configurable for PostgreSQL)
- Secure environment variable management

### Machine Learning
- Volunteer retention risk prediction using Random Forest classifier
- Trained on synthetic volunteer engagement data
- API endpoint `/predict` returns risk score (high/medium/low)
- Admin view with color-coded risk indicators

### Artificial Intelligence
- Gemini API powered chatbot with conversation context
- Answers FAQs about internships, events, and foundation mission
- Can guide users through registration process

### Reporting
- One-click PDF report generation (volunteer list + ML risk scores)
- CSV export functionality

## Technology Stack

| Category | Technologies |
|----------|--------------|
| Frontend | HTML5, Tailwind CSS, Three.js (for 3D card tilt), GSAP, tsParticles |
| Backend | Python 3.11, Flask, Flask-JWT-Extended |
| Database | SQLite (development), PostgreSQL (production ready) |
| Machine Learning | scikit-learn, pandas, joblib |
| AI | Google Gemini API |
| Deployment | Render (gunicorn) |
| Version Control | Git, GitHub |

## Project Structure
