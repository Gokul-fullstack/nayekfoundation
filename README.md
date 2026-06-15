# 🕊️ NayePankh 3D Volunteer Nexus

An ultimate, cinematic, AI-powered volunteer engagement platform designed for **NayePankh Foundation** ("Giving Wings to Every Dream"). 

This project integrates high-performance 3D graphics, motion storytelling, real-time analytics, machine learning predictions, and generative AI features into a single, cohesive full-stack web application. It is strategically engineered to demonstrate core competencies across **7+ technical internship roles** in a single code submission.

---

## 📊 Internship Coverage Matrix

| Internship Role | Key Features Implemented | File/Component References |
| :--- | :--- | :--- |
| **Full Stack Development** | User authentication + SQLite database mapping + dynamic API endpoints + PDF/CSV report generation. | [app.py](file:///c:/Users/gokul/Downloads/Projects/nayekfoundation/app.py), [models.py](file:///c:/Users/gokul/Downloads/Projects/nayekfoundation/models.py), [reports/pdf_generator.py](file:///c:/Users/gokul/Downloads/Projects/nayekfoundation/reports/pdf_generator.py) |
| **Front End Development** | 3D interactive globe + custom cursor + responsive cards + glassmorphism UI layout. | [components.css](file:///c:/Users/gokul/Downloads/Projects/nayekfoundation/static/css/components.css), [three-globe.js](file:///c:/Users/gokul/Downloads/Projects/nayekfoundation/static/js/three-globe.js), [cursor.js](file:///c:/Users/gokul/Downloads/Projects/nayekfoundation/static/js/cursor.js) |
| **Web Development** | 10 fully responsive templates (Home, About, Initiatives, Events, Contact, Register, Login, Dashboards) served by Flask. | [templates/](file:///c:/Users/gokul/Downloads/Projects/nayekfoundation/templates/) |
| **Backend Development** | RESTful endpoints + JWT tokens helper decorators + automated database creation & seeder. | [auth.py](file:///c:/Users/gokul/Downloads/Projects/nayekfoundation/auth.py), [seed_db.py](file:///c:/Users/gokul/Downloads/Projects/nayekfoundation/seed_db.py) |
| **Python Development** | Clean, modular Python scripts, virtual env compatibility, and ReportLab PDF document building. | [reports/pdf_generator.py](file:///c:/Users/gokul/Downloads/Projects/nayekfoundation/reports/pdf_generator.py) |
| **Machine Learning** | Random Forest Classifier trained on synthetic data to predict volunteer retention risk. | [ml/train_model.py](file:///c:/Users/gokul/Downloads/Projects/nayekfoundation/ml/train_model.py), [ml/predict.py](file:///c:/Users/gokul/Downloads/Projects/nayekfoundation/ml/predict.py) |
| **Artificial Intelligence** | Conversational AI chatbot powered by Google Gemini API with smart keyword-matching fallback mechanisms. | [chatbot/gemini_chat.py](file:///c:/Users/gokul/Downloads/Projects/nayekfoundation/chatbot/gemini_chat.py), [chatbot/fallback_chat.py](file:///c:/Users/gokul/Downloads/Projects/nayekfoundation/chatbot/fallback_chat.py) |

---

## 🛠️ Technology Stack

- **Backend:** Python 3, Flask, SQLite, SQLAlchemy, PyJWT
- **Frontend:** HTML5, Vanilla CSS3 (Custom Properties), Javascript (ES6+)
- **3D & Animation:** Three.js, GSAP (ScrollTrigger), vanilla-tilt.js, Typed.js, tsParticles
- **Analytics & Maps:** Chart.js, Leaflet.js
- **Machine Learning:** Scikit-Learn, Pandas, NumPy, Joblib
- **AI Chatbot:** Google GenerativeAI API (Gemini-1.5-Flash model)
- **Reporting:** ReportLab (automated PDF compiler)

---

## ✨ Features Breakdown

### 🎨 Frontend & Design Aesthetics
- **3D Hero Globe:** An interactive wireframe Earth that rotates on the homepage, highlighting major volunteering cities.
- **Particle System:** Floating stars/dots using tsParticles overlays.
- **GSAP Reveal Effects:** Sections fade and rise gracefully as you scroll down.
- **Tilt Cards:** Initiative display panels tilt dynamically with depth shadows.
- **Glassmorphism Theme:** Elegant transparent frosted cards with blurred backgrounds.
- **Theme Switcher:** Seamless transition between dark and light themes.

### ⚙️ Full Stack & Backend Core
- **Multi-Step Form Wizard:** Interactive registration system with client-side validation, location coordinate detection, and progress tracker.
- **JWT Auth:** Token-based route protection for volunteer and admin resources.
- **Admin Dashboard:** Central panel containing database tables, interactive maps, and chart widgets.
- **PDF Report Engine:** Compiles volunteer engagement tables and statistics into a PDF report using ReportLab.
- **CSV Data Exporter:** Allows admins to download the volunteer database as a `.csv` file.

### 🧠 Machine Learning & Data Pipeline
- **Retention Risk Predictor:** Trains on 500+ records to calculate volunteer retention probabilities based on features like availability, city tier, and skills.
- **Model Comparison:** Evaluates Random Forest, Decision Tree, and Logistic Regression models.

### 🤖 Generative AI Chatbot
- **Gemini Assistant:** Provides contextual answers about NayePankh's mission, contact details, and events.
- **Fallback Matcher:** Ensures functionality offline or if API keys are missing.

---

## 🚀 Installation & Local Setup

### 1. Clone the Project
Open terminal/cmd and run:
```bash
git clone https://github.com/your-username/nayepankh-volunteer-nexus.git
cd nayepankh-volunteer-nexus
```

### 2. Configure Environment Variables
Create a `.env` file in the root folder:
```env
FLASK_SECRET_KEY=supersecretkey123
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Setup Virtual Environment & Install Dependencies
```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### 4. Initialize Data & Train Machine Learning Model
Generate synthetic data, train the classifier, and seed the database with sample entries:
```bash
python ml/generate_data.py
python ml/train_model.py
python seed_db.py
```

### 5. Start the Application
Run the Flask development server:
```bash
python app.py
```
Open **`http://127.5.0.1:5000`** in your browser.

---

## 🔒 Admin Access Credentials
For evaluation and testing:
- **Admin Email:** `admin@nayepankh.com`
- **Admin Password:** `admin123`

---

## 📧 Contact & Support
- **Organization:** NayePankh Foundation
- **Email:** `contact@nayepankh.com`
- **Phone:** `+91-8318500748`
