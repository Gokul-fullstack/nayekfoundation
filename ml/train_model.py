"""
NayePankh 3D Volunteer Nexus — Model Training Script
Trains RandomForest, LogisticRegression, and DecisionTree; saves the best model.
"""

import os
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score


def train(csv_path=None):
    """Train multiple classifiers and persist the best one."""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.dirname(base_dir)

    if csv_path is None:
        csv_path = os.path.join(project_dir, 'static', 'assets', 'data', 'volunteers.csv')

    if not os.path.exists(csv_path):
        print(f"[!] Data file not found: {csv_path}")
        print("    Run  python -m ml.generate_data  first.")
        return

    df = pd.read_csv(csv_path)
    feature_cols = [
        'age', 'skills_count', 'city_tier', 'past_events',
        'hours_volunteered', 'distance_km', 'has_referral', 'communication_score',
    ]
    X = df[feature_cols]
    y = df['retained']

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y,
    )

    models = {
        'RandomForest': RandomForestClassifier(n_estimators=100, random_state=42),
        'LogisticRegression': LogisticRegression(max_iter=1000, random_state=42),
        'DecisionTree': DecisionTreeClassifier(max_depth=8, random_state=42),
    }

    best_name = None
    best_acc = 0.0
    best_model = None

    print("\n========================================")
    print("  NayePankh -- Model Training Results  ")
    print("========================================\n")

    for name, model in models.items():
        model.fit(X_train, y_train)
        preds = model.predict(X_test)
        acc = accuracy_score(y_test, preds)
        print(f"  {name:25s}  Accuracy: {acc:.4f}")
        if acc > best_acc:
            best_acc = acc
            best_name = name
            best_model = model

    print(f"\n  * Best model: {best_name} ({best_acc:.4f})")

    model_path = os.path.join(base_dir, 'model.pkl')
    features_path = os.path.join(base_dir, 'features.pkl')

    joblib.dump(best_model, model_path)
    joblib.dump(feature_cols, features_path)

    print(f"  -> Saved model   : {model_path}")
    print(f"  -> Saved features: {features_path}\n")


if __name__ == '__main__':
    train()
