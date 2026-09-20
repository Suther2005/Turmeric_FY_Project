"""
Real Image Inference Verification Test
======================================
Tests inference on real leaf images from each pathology class:
  - Aphids_Disease
  - Blotch
  - Healthy_Leaf
  - Leaf_Spot
"""

from pathlib import Path
from fastapi.testclient import TestClient
from main import app, engine, CHECKPOINT_PATH

client = TestClient(app)
DATASET_ORIG_DIR = Path(r"D:\curuma\turmeric_datasets\dataset_01\original")


def test_real_dataset_images():
    print("Testing real dataset images against FastAPI inference engine...")
    classes = [
        ("Aphids_Disease", "Aphids"),
        ("Blotch", "Blotch"),
        ("Healthy_Leaf", "Healthy"),
        ("Leaf_Spot", "Leaf Spot")
    ]

    for folder_name, display_name in classes:
        folder_p = DATASET_ORIG_DIR / folder_name
        sample_img = next(folder_p.glob("*.jpg"), None)
        assert sample_img is not None, f"No image found in {folder_p}"

        with open(sample_img, "rb") as f:
            response = client.post(
                "/api/predict",
                files={"file": (sample_img.name, f, "image/jpeg")}
            )

        assert response.status_code == 200, f"Failed for {sample_img.name}: {response.text}"
        data = response.json()
        print(f"\n[Sample: {display_name}] ({sample_img.name})")
        print(f"  Predicted Disease:    {data['disease']}")
        print(f"  Confidence:           {data['confidence']}%")
        print(f"  Model Mode:           {data['model_mode']}")
        print(f"  Architecture:         {data['model_architecture']}")
        print(f"  Probability Dist:     {data['probabilities']}")

        # Validate structure
        assert data["disease"] in ["Aphids", "Blotch", "Healthy", "Leaf Spot"]
        assert 0.0 <= data["confidence"] <= 100.0
        assert data["model_mode"] == "REAL_MODEL"
        prob_sum = sum(data["probabilities"].values())
        assert 99.0 <= prob_sum <= 101.0, f"Probabilities should sum to ~100%, got {prob_sum}"

    print("\n[OK] All real image inference tests passed with 100% validity!")


if __name__ == "__main__":
    test_real_dataset_images()
