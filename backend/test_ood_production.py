"""
Backend Production Verification Script for Mahalanobis OOD Safeguard
====================================================================
Tests:
  1. API Health endpoint
  2. Model Info endpoint (OOD metadata)
  3. Valid Turmeric leaf image (In-Domain -> Classified by Hybrid Ensemble)
  4. Anime / Cartoon image (OOD -> Rejected with clear message)
  5. Unrelated Object image (OOD -> Rejected with clear message)
"""

import io
import json
import requests
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
API_URL = "http://127.0.0.1:8000"


def test_health_and_info():
    print("--- 1. Health & Model Info Endpoints ---")
    h_res = requests.get(f"{API_URL}/api/health")
    assert h_res.status_code == 200
    h_data = h_res.json()
    print("Health:", json.dumps(h_data, indent=2))
    assert h_data["status"] == "online"
    assert h_data["ood_safeguard_enabled"] is True
    assert h_data["ood_threshold"] == 63.10

    m_res = requests.get(f"{API_URL}/api/model-info")
    assert m_res.status_code == 200
    m_data = m_res.json()
    print("\nModel Info:", json.dumps(m_data, indent=2))
    assert m_data["ood_safeguard_loaded"] is True
    assert m_data["ood_threshold"] == 63.10


def test_valid_turmeric_image():
    print("\n--- 2. Valid Turmeric Image (Leaf Spot) ---")
    img_p = BASE_DIR / "turmeric_datasets" / "dataset_01" / "original" / "Leaf_Spot" / "leaf_spot_(1).jpg"
    with open(img_p, "rb") as f:
        res = requests.post(f"{API_URL}/api/predict", files={"file": (img_p.name, f, "image/jpeg")})
    assert res.status_code == 200, f"Error: {res.text}"
    data = res.json()
    print(json.dumps(data, indent=2))
    assert data["ood_status"] == "IN_DOMAIN"
    assert data["mahalanobis_distance"] <= 63.10
    assert data["disease"] == "Leaf Spot"
    assert data["confidence"] > 0.0
    assert data["model_mode"] == "REAL_MODEL"
    assert data["individual_predictions"] is not None


def test_anime_image():
    print("\n--- 3. Anime / Cartoon Image ---")
    img_p = BASE_DIR / "research_results" / "ood_benchmark" / "anime_cartoon" / "anime_01.png"
    with open(img_p, "rb") as f:
        res = requests.post(f"{API_URL}/api/predict", files={"file": (img_p.name, f, "image/png")})
    assert res.status_code == 200, f"Error: {res.text}"
    data = res.json()
    print(json.dumps(data, indent=2))
    assert data["ood_status"] == "OOD_REJECTED"
    assert data["mahalanobis_distance"] > 63.10
    assert data["disease"] == "Non-Turmeric / Out-of-Domain"
    assert data["confidence"] == 0.0
    assert data["probabilities"]["Leaf Spot"] == 0.0
    assert data["probabilities"]["Aphids"] == 0.0
    assert data["individual_predictions"] is None
    assert "outside the supported turmeric leaf domain" in data["ood_message"]


def test_unrelated_object_image():
    print("\n--- 4. Unrelated Object Image ---")
    img_p = BASE_DIR / "research_results" / "ood_benchmark" / "unrelated_objects" / "object_01.png"
    with open(img_p, "rb") as f:
        res = requests.post(f"{API_URL}/api/predict", files={"file": (img_p.name, f, "image/png")})
    assert res.status_code == 200, f"Error: {res.text}"
    data = res.json()
    print(json.dumps(data, indent=2))
    assert data["ood_status"] == "OOD_REJECTED"
    assert data["mahalanobis_distance"] > 63.10
    assert data["disease"] == "Non-Turmeric / Out-of-Domain"
    assert data["confidence"] == 0.0
    assert data["individual_predictions"] is None
    assert "outside the supported turmeric leaf domain" in data["ood_message"]


if __name__ == "__main__":
    test_health_and_info()
    test_valid_turmeric_image()
    test_anime_image()
    test_unrelated_object_image()
    print("\n[OK] All production OOD safeguard tests passed successfully!")
