"""
NayePankh 3D Volunteer Nexus — Retention Prediction
Loads the trained model and predicts volunteer retention risk.
"""

import os
import random

import joblib
import numpy as np

_model = None
_features = None


def _load_model():
    """Lazy-load the persisted model and feature list."""
    global _model, _features
    if _model is not None:
        return True

    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, 'model.pkl')
    features_path = os.path.join(base_dir, 'features.pkl')

    if os.path.exists(model_path) and os.path.exists(features_path):
        _model = joblib.load(model_path)
        _features = joblib.load(features_path)
        return True
    return False


def predict_retention(data_dict):
    """
    Predict retention for a single volunteer.

    Parameters
    ----------
    data_dict : dict
        Keys should include feature columns (age, skills_count, city_tier,
        past_events, hours_volunteered, distance_km, has_referral,
        communication_score).  Missing keys are filled with defaults.

    Returns
    -------
    dict  {probability, risk_level, engagement_score}
    """
    defaults = {
        'age': 22,
        'skills_count': 3,
        'city_tier': 2,
        'past_events': 2,
        'hours_volunteered': 20,
        'distance_km': 15.0,
        'has_referral': 0,
        'communication_score': 5,
    }

    if _load_model():
        # Build feature vector in the correct order
        row = [float(data_dict.get(f, defaults.get(f, 0))) for f in _features]
        X = np.array([row])

        proba = _model.predict_proba(X)[0]
        # probability of retention (class 1)
        probability = float(proba[1]) if len(proba) > 1 else float(proba[0])
    else:
        # Mock prediction when model is not available
        random.seed(hash(str(data_dict)) % (2 ** 32))
        probability = round(random.uniform(0.3, 0.95), 4)

    # Risk level
    if probability > 0.7:
        risk_level = 'low'
    elif probability >= 0.4:
        risk_level = 'medium'
    else:
        risk_level = 'high'

    # Engagement score: weighted blend of available features
    skills = float(data_dict.get('skills_count', defaults['skills_count']))
    events = float(data_dict.get('past_events', defaults['past_events']))
    hours = float(data_dict.get('hours_volunteered', defaults['hours_volunteered']))
    comm = float(data_dict.get('communication_score', defaults['communication_score']))

    engagement_score = round(min(10.0, (
        skills * 0.15 + events * 0.25 + hours * 0.01 + comm * 0.35 + probability * 2
    )), 2)

    return {
        'probability': round(probability, 4),
        'risk_level': risk_level,
        'engagement_score': engagement_score,
    }
