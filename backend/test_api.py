"""
Backend API & Inference Unit Tests
==================================
Verifies health endpoint, valid prediction, corrupt file rejection,
oversized file rejection, and empty file handling.
"""

import io
import sys
from pathlib import Path
from fastapi.testclient import TestClient
from PIL import Image

BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

try:
    from backend.main import app, engine, CHECKPOINT_PATH
except ImportError:
    from main import app, engine, CHECKPOINT_PATH

client = TestClient(app)


def create_test_image(format="JPEG", color=(100, 200, 50), size=(300, 300)) -> io.BytesIO:
    buf = io.BytesIO()
    img = Image.new("RGB", size, color=color)
    img.save(buf, format=format)
    buf.seek(0)
    return buf


def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "target_classes" in data
    assert len(data["target_classes"]) == 4


def test_model_info():
    response = client.get("/api/model-info")
    assert response.status_code == 200
    data = response.json()
    assert "classes" in data
    assert data["classes"] == ["Aphids", "Blotch", "Healthy", "Leaf Spot"]


from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent.parent
SAMPLE_LEAF = next((BASE_DIR / "turmeric_datasets" / "dataset_01" / "original" / "Leaf_Spot").glob("*.jpg"))


def test_predict_valid_image():
    with open(SAMPLE_LEAF, "rb") as f:
        response = client.post(
            "/api/predict",
            files={"file": (SAMPLE_LEAF.name, f, "image/jpeg")}
        )
    assert response.status_code == 200
    data = response.json()
    assert data["ood_status"] == "IN_DOMAIN"
    assert data["disease"] in ["Aphids", "Blotch", "Healthy", "Leaf Spot"]
    assert data["confidence"] > 0.0
    assert "probabilities" in data
    assert len(data["probabilities"]) == 4
    for c in ["Aphids", "Blotch", "Healthy", "Leaf Spot"]:
        assert c in data["probabilities"]
    assert data["model_mode"] == "REAL_MODEL"
    assert "extracted_features" in data
    assert data["individual_predictions"] is not None


def test_predict_ood_rejection():
    # Test that solid synthetic dummy box triggers OOD rejection
    buf = create_test_image(format="JPEG")
    response = client.post(
        "/api/predict",
        files={"file": ("synthetic_box.jpg", buf, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["ood_status"] in ["OOD_REJECTED", "VERIFIER_REJECTED"]
    assert data["disease"] in ["Non-Turmeric / Out-of-Domain", "Unverified / Low Foliar Confidence"]
    assert data["confidence"] == 0.0
    assert "turmeric leaf" in data["ood_message"].lower()


def test_predict_invalid_extension():
    buf = io.BytesIO(b"dummy text content")
    response = client.post(
        "/api/predict",
        files={"file": ("test.txt", buf, "text/plain")}
    )
    assert response.status_code == 400
    assert "Unsupported file format" in response.json()["detail"]


def test_predict_corrupt_image():
    buf = io.BytesIO(b"not an actual image file at all")
    response = client.post(
        "/api/predict",
        files={"file": ("corrupt.jpg", buf, "image/jpeg")}
    )
    assert response.status_code == 400
    assert "corrupted" in response.json()["detail"].lower()


def test_predict_empty_file():
    buf = io.BytesIO(b"")
    response = client.post(
        "/api/predict",
        files={"file": ("empty.png", buf, "image/png")}
    )
    assert response.status_code == 400


if __name__ == "__main__":
    print("Running API test suite...")
    test_health()
    print("  [OK] Health check passed")
    test_model_info()
    print("  [OK] Model info endpoint passed")
    test_predict_valid_image()
    print("  [OK] Valid prediction test passed")
    test_predict_ood_rejection()
    print("  [OK] OOD domain safeguard rejection passed")
    test_predict_invalid_extension()
    print("  [OK] Invalid extension rejection passed")
    test_predict_corrupt_image()
    print("  [OK] Corrupt image rejection passed")
    test_predict_empty_file()
    print("  [OK] Empty file rejection passed")
    print("All backend API unit tests passed successfully!")
