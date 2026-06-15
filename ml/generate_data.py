"""
NayePankh 3D Volunteer Nexus — Synthetic Data Generator
Generates 500 volunteer records for ML model training.
"""

import os
import random
import numpy as np
import pandas as pd


def generate_data(n=500, output_path=None):
    """Generate synthetic volunteer data and save as CSV."""
    random.seed(42)
    np.random.seed(42)

    if output_path is None:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        output_path = os.path.join(base_dir, 'static', 'assets', 'data', 'volunteers.csv')

    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    records = []
    for _ in range(n):
        age = random.randint(18, 30)
        skills_count = random.randint(1, 8)
        city_tier = random.choice([1, 2, 3])
        past_events = random.randint(0, 20)
        hours_volunteered = random.randint(0, 500)
        distance_km = round(random.uniform(0, 50), 1)
        has_referral = random.choice([0, 1])
        communication_score = random.randint(1, 10)

        # Retention probability: logically correlated with positive features
        score = (
            past_events * 0.15
            + hours_volunteered * 0.005
            + has_referral * 1.5
            + communication_score * 0.3
            + skills_count * 0.2
            - distance_km * 0.04
            - (1 if city_tier == 3 else 0) * 0.5
            + (age - 18) * 0.05
        )
        prob = 1 / (1 + np.exp(-score + 3))  # sigmoid with offset
        retained = 1 if random.random() < prob else 0

        records.append({
            'age': age,
            'skills_count': skills_count,
            'city_tier': city_tier,
            'past_events': past_events,
            'hours_volunteered': hours_volunteered,
            'distance_km': distance_km,
            'has_referral': has_referral,
            'communication_score': communication_score,
            'retained': retained,
        })

    df = pd.DataFrame(records)
    df.to_csv(output_path, index=False)
    print(f"[SUCCESS] Generated {n} records -> {output_path}")
    print(f"    Retained: {df['retained'].sum()} / {n}  ({df['retained'].mean():.1%})")
    return df


if __name__ == '__main__':
    generate_data()
