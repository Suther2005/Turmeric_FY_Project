"""
Offline Out-of-Distribution (OOD) Validation Experiment
======================================================
Evaluates Tier 1 (Foliar Engineering Gate) and Tier 2 (Mahalanobis Feature-Space Gate)
using frozen EfficientNet-B0 embeddings on Dataset 01 (Train: 606, Val: 130) and an OOD benchmark.
"""

import os
import io
import csv
import json
import math
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
from typing import Dict, List, Tuple, Any

import torch
import torch.nn as nn
from torchvision import models, transforms
from sklearn.covariance import LedoitWolf

BASE_DIR = Path(__file__).resolve().parent.parent
DATASET_DIR = BASE_DIR / "turmeric_datasets"
SPLITS_CSV = DATASET_DIR / "metadata" / "dataset_splits.csv"
CHECKPOINT_PATH = BASE_DIR / "backend" / "checkpoints" / "efficientnet_b0_best.pth"
OOD_DIR = BASE_DIR / "research_results" / "ood_benchmark"
OOD_DIR.mkdir(parents=True, exist_ok=True)

CLASS_NAMES = ["Aphids", "Blotch", "Healthy", "Leaf Spot"]
CLASS_MAP = {
    "Aphids_Disease": 0, "Aphids": 0,
    "Blotch": 1,
    "Healthy_Leaf": 2, "Healthy": 2,
    "Leaf_Spot": 3, "Leaf Spot": 3
}

INFERENCE_TRANSFORMS = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.CenterCrop((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


def create_ood_benchmark_dataset():
    """Constructs a deterministic, diverse 50-image OOD evaluation dataset across 5 categories."""
    categories = ["anime_cartoon", "human_portraits", "document_ui", "unrelated_objects", "non_turmeric_botanical"]
    for cat in categories:
        (OOD_DIR / cat).mkdir(parents=True, exist_ok=True)

    np.random.seed(42)
    # 1. Anime / Cartoon (10 images)
    for i in range(10):
        img = Image.new("RGB", (300, 300), color=(np.random.randint(180, 255), np.random.randint(150, 240), np.random.randint(200, 255)))
        draw = ImageDraw.Draw(img)
        # Manga hair / eyes / geometric stylization
        draw.polygon([(50, 50), (150, 10), (250, 60), (200, 180), (80, 180)], fill=(np.random.randint(20, 80), np.random.randint(50, 120), np.random.randint(180, 255)))
        draw.ellipse([80, 100, 130, 150], fill=(255, 255, 255), outline=(0, 0, 0), width=3)
        draw.ellipse([170, 100, 220, 150], fill=(255, 255, 255), outline=(0, 0, 0), width=3)
        draw.ellipse([100, 115, 125, 145], fill=(20, 20, 20))
        draw.ellipse([190, 115, 215, 145], fill=(20, 20, 20))
        draw.line([(150, 140), (145, 170), (160, 170)], fill=(200, 100, 100), width=3)
        draw.arc([120, 190, 180, 220], start=0, end=180, fill=(200, 50, 50), width=4)
        img.save(OOD_DIR / "anime_cartoon" / f"anime_{i+1:02d}.png")

    # 2. Human Portraits / Faces (10 images)
    for i in range(10):
        # Skin tone background and face contours
        skin = (np.random.randint(200, 255), np.random.randint(160, 210), np.random.randint(130, 180))
        img = Image.new("RGB", (300, 300), color=(np.random.randint(40, 80), np.random.randint(40, 80), np.random.randint(50, 90)))
        draw = ImageDraw.Draw(img)
        draw.ellipse([70, 50, 230, 240], fill=skin)
        # Hair
        draw.arc([60, 30, 240, 180], 180, 360, fill=(40, 25, 15), width=35)
        # Eyes / Mouth
        draw.ellipse([100, 120, 130, 135], fill=(255, 255, 255))
        draw.ellipse([170, 120, 200, 135], fill=(255, 255, 255))
        draw.ellipse([110, 122, 122, 133], fill=(50, 30, 20))
        draw.ellipse([180, 122, 192, 133], fill=(50, 30, 20))
        draw.line([(130, 200), (170, 200)], fill=(180, 60, 60), width=4)
        img.save(OOD_DIR / "human_portraits" / f"portrait_{i+1:02d}.png")

    # 3. Document / UI Screenshot (10 images)
    for i in range(10):
        img = Image.new("RGB", (300, 300), color=(250, 250, 252))
        draw = ImageDraw.Draw(img)
        # Code lines / UI boxes
        draw.rectangle([10, 10, 290, 40], fill=(230, 235, 245))
        for line_y in range(55, 280, 14):
            w = np.random.randint(50, 240)
            color = (np.random.randint(30, 80), np.random.randint(60, 120), np.random.randint(150, 220)) if np.random.rand() > 0.5 else (60, 60, 60)
            draw.rectangle([20, line_y, 20 + w, line_y + 8], fill=color)
        img.save(OOD_DIR / "document_ui" / f"document_{i+1:02d}.png")

    # 4. Unrelated Objects (10 images: metallic tools, vehicles, furniture)
    for i in range(10):
        bg = (np.random.randint(180, 220), np.random.randint(180, 220), np.random.randint(190, 230))
        img = Image.new("RGB", (300, 300), color=bg)
        draw = ImageDraw.Draw(img)
        # Metallic / vehicle shape
        draw.polygon([(40, 180), (80, 100), (220, 100), (270, 180)], fill=(np.random.randint(180, 220), 20, 20))
        draw.rectangle([30, 180, 280, 220], fill=(160, 160, 170), outline=(50, 50, 50), width=2)
        draw.ellipse([60, 200, 110, 250], fill=(30, 30, 30))
        draw.ellipse([200, 200, 250, 250], fill=(30, 30, 30))
        img.save(OOD_DIR / "unrelated_objects" / f"object_{i+1:02d}.png")

    # 5. Non-Turmeric Botanical (10 images: wood bark, bright flowers, autumn leaves, succulent)
    for i in range(10):
        if i < 4:
            # Wood bark (pure dark brown/gray texture)
            arr = np.random.randint(60, 110, (300, 300, 3), dtype=np.uint8)
            arr[:, :, 0] = arr[:, :, 0] + 20  # redder
            arr[:, :, 2] = arr[:, :, 2] - 20  # less blue
            img = Image.fromarray(arr)
        elif i < 7:
            # Bright Red/Magenta Flower
            img = Image.new("RGB", (300, 300), color=(30, 30, 30))
            draw = ImageDraw.Draw(img)
            draw.ellipse([50, 50, 250, 250], fill=(240, 20, 80))
            draw.ellipse([100, 100, 200, 200], fill=(255, 200, 20))
        else:
            # Autumn Orange/Red foliage
            arr = np.zeros((300, 300, 3), dtype=np.uint8)
            arr[:, :, 0] = np.random.randint(180, 240, (300, 300))  # High Red
            arr[:, :, 1] = np.random.randint(60, 120, (300, 300))   # Low Green
            arr[:, :, 2] = np.random.randint(10, 40, (300, 300))    # Low Blue
            img = Image.fromarray(arr)
        img.save(OOD_DIR / "non_turmeric_botanical" / f"botanical_{i+1:02d}.png")

    print(f"[Benchmark] Generated 50 OOD benchmark images across 5 categories in {OOD_DIR}")


def extract_tier1_features(img: Image.Image) -> Dict[str, float]:
    """Computes Tier 1 foliar color and texture statistics."""
    rgb = np.array(img.convert("RGB")).astype(np.float32)
    hsv = cv2.cvtColor((rgb).astype(np.uint8), cv2.COLOR_RGB2HSV)
    gray = cv2.cvtColor((rgb).astype(np.uint8), cv2.COLOR_RGB2GRAY)

    R, G, B = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    # Excess Green Index: 2G - R - B normalized by (2G + R + B + 1e-5)
    exg_raw = 2.0 * G - R - B
    exg_norm = exg_raw / (2.0 * G + R + B + 1e-5)
    mean_exg = float(np.mean(exg_norm))

    # Biological foliage mask in HSV:
    # Foliar green/yellow/chlorotic range: Hue in [22, 95], Sat > 35, Val > 35
    # Foliar necrotic brown range: Hue in [8, 22], Sat in [40, 220], Val in [30, 190]
    H, S, V = hsv[:, :, 0], hsv[:, :, 1], hsv[:, :, 2]
    green_mask = (H >= 22) & (H <= 95) & (S >= 35) & (V >= 35)
    necrotic_mask = (H >= 8) & (H < 22) & (S >= 40) & (V >= 30) & (V <= 200)
    foliar_mask = green_mask | necrotic_mask
    foliar_pixel_ratio = float(np.sum(foliar_mask)) / float(foliar_mask.size)

    # Texture & structural gradient: Laplacian variance on grayscale
    laplacian = cv2.Laplacian(gray, cv2.CV_64F)
    lap_var = float(laplacian.var())

    return {
        "mean_exg": mean_exg,
        "foliar_pixel_ratio": foliar_pixel_ratio,
        "laplacian_var": lap_var
    }


def load_dataset_splits() -> Tuple[List[Tuple[Path, int]], List[Tuple[Path, int]], List[Tuple[Path, int]]]:
    train_samples, val_samples, test_samples = [], [], []
    with open(SPLITS_CSV, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get("dataset") == "Dataset_01":
                rel_p = row["relative_path"]
                full_p = DATASET_DIR / rel_p
                cname = row["standardized_class"]
                label = CLASS_MAP.get(cname, CLASS_MAP.get(row["original_class"], None))
                split = row["split"]
                if label is not None and full_p.exists():
                    item = (full_p, label)
                    if split == "train":
                        train_samples.append(item)
                    elif split == "val":
                        val_samples.append(item)
                    elif split == "test":
                        test_samples.append(item)

    return train_samples, val_samples, test_samples


def build_feature_extractor(checkpoint_path: Path, device: torch.device):
    """Loads EfficientNet-B0 and extracts penultimate 1280-dim embedding vector."""
    model = models.efficientnet_b0(weights=None)
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.3),
        nn.Linear(in_features, 4)
    )
    checkpoint = torch.load(str(checkpoint_path), map_location=device, weights_only=False)
    if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
        model.load_state_dict(checkpoint["model_state_dict"])
    elif isinstance(checkpoint, dict) and "state_dict" in checkpoint:
        model.load_state_dict(checkpoint["state_dict"])
    else:
        model.load_state_dict(checkpoint)

    model.to(device)
    model.eval()

    class PenultimateExtractor(nn.Module):
        def __init__(self, base_model):
            super().__init__()
            self.features = base_model.features
            self.avgpool = base_model.avgpool

        def forward(self, x):
            x = self.features(x)
            x = self.avgpool(x)
            x = torch.flatten(x, 1)
            return x

    extractor = PenultimateExtractor(model).to(device)
    extractor.eval()
    return model, extractor


def run_experiment():
    print("=" * 70)
    print("RUNNING OFFLINE OOD VALIDATION EXPERIMENT")
    print("=" * 70)

    create_ood_benchmark_dataset()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Device: {device}")

    train_samples, val_samples, test_samples = load_dataset_splits()
    print(f"Dataset 01 Splits: Train={len(train_samples)}, Val={len(val_samples)}, Test={len(test_samples)}")

    # Collect OOD files
    ood_samples = {}
    for cat_dir in OOD_DIR.iterdir():
        if cat_dir.is_dir():
            ood_samples[cat_dir.name] = list(cat_dir.glob("*.png")) + list(cat_dir.glob("*.jpg"))
    total_ood = sum(len(v) for v in ood_samples.values())
    print(f"OOD Benchmark Samples: Total={total_ood} across {len(ood_samples)} categories")

    # -------------------------------------------------------------
    # 1. Tier 1 Engineering Gate Analysis
    # -------------------------------------------------------------
    print("\n" + "-" * 50)
    print("Evaluating Tier 1 Foliar Engineering Gate")
    print("-" * 50)

    val_tier1 = []
    for path, _ in val_samples:
        with Image.open(path) as img:
            val_tier1.append(extract_tier1_features(img))

    ood_tier1 = {cat: [] for cat in ood_samples}
    all_ood_tier1 = []
    for cat, files in ood_samples.items():
        for f in files:
            with Image.open(f) as img:
                feats = extract_tier1_features(img)
                ood_tier1[cat].append(feats)
                all_ood_tier1.append(feats)

    # Summaries
    val_exg = [x["mean_exg"] for x in val_tier1]
    val_foliar = [x["foliar_pixel_ratio"] for x in val_tier1]
    val_lap = [x["laplacian_var"] for x in val_tier1]

    ood_exg = [x["mean_exg"] for x in all_ood_tier1]
    ood_foliar = [x["foliar_pixel_ratio"] for x in all_ood_tier1]
    ood_lap = [x["laplacian_var"] for x in all_ood_tier1]

    print(f"Validation In-Domain Foliar Ratio: Mean={np.mean(val_foliar):.4f}, Min={np.min(val_foliar):.4f}, P05={np.percentile(val_foliar, 5):.4f}, Max={np.max(val_foliar):.4f}")
    print(f"OOD Total Foliar Ratio:           Mean={np.mean(ood_foliar):.4f}, Min={np.min(ood_foliar):.4f}, P95={np.percentile(ood_foliar, 95):.4f}, Max={np.max(ood_foliar):.4f}")

    # Tier 1 Candidate Threshold: Foliar Pixel Coverage Ratio >= 0.25 (25% biological lamina coverage)
    tier1_thresh = 0.25
    val_passed_tier1 = sum(1 for x in val_foliar if x >= tier1_thresh)
    ood_rejected_tier1 = sum(1 for x in ood_foliar if x < tier1_thresh)
    print(f"\nTier 1 Rule (Foliar Coverage >= {tier1_thresh*100}%):")
    print(f"  In-domain Val Pass Rate: {val_passed_tier1}/{len(val_samples)} ({val_passed_tier1/len(val_samples)*100:.2f}%)")
    print(f"  OOD Rejection Rate:      {ood_rejected_tier1}/{total_ood} ({ood_rejected_tier1/total_ood*100:.2f}%)")

    # -------------------------------------------------------------
    # 2. Tier 2 Mahalanobis Feature Space Analysis
    # -------------------------------------------------------------
    print("\n" + "-" * 50)
    print("Evaluating Tier 2 Mahalanobis Distance on Penultimate Embeddings")
    print("-" * 50)

    full_model, extractor = build_feature_extractor(CHECKPOINT_PATH, device)

    def extract_features_from_list(sample_list):
        embeddings = []
        labels = []
        with torch.no_grad():
            for p, lbl in sample_list:
                with Image.open(p) as img:
                    t = INFERENCE_TRANSFORMS(img.convert("RGB")).unsqueeze(0).to(device)
                    emb = extractor(t).squeeze(0).cpu().numpy()
                    embeddings.append(emb)
                    labels.append(lbl)
        return np.array(embeddings), np.array(labels)

    print("Extracting penultimate embeddings for 606 TRAIN images...")
    train_embs, train_labels = extract_features_from_list(train_samples)
    print(f"Train embeddings shape: {train_embs.shape}")

    print("Extracting penultimate embeddings for 130 VAL images...")
    val_embs, val_labels = extract_features_from_list(val_samples)

    print("Extracting penultimate embeddings for 50 OOD images...")
    ood_embs = {}
    all_ood_embs = []
    with torch.no_grad():
        for cat, files in ood_samples.items():
            cat_list = []
            for f in files:
                with Image.open(f) as img:
                    t = INFERENCE_TRANSFORMS(img.convert("RGB")).unsqueeze(0).to(device)
                    emb = extractor(t).squeeze(0).cpu().numpy()
                    cat_list.append(emb)
                    all_ood_embs.append(emb)
            ood_embs[cat] = np.array(cat_list)
    all_ood_embs = np.array(all_ood_embs)

    # Compute class means on TRAIN ONLY
    class_means = {}
    for c in range(4):
        c_idx = np.where(train_labels == c)[0]
        class_means[c] = np.mean(train_embs[c_idx], axis=0)

    # Compute shared centered matrix
    centered_train = np.zeros_like(train_embs)
    for c in range(4):
        c_idx = np.where(train_labels == c)[0]
        centered_train[c_idx] = train_embs[c_idx] - class_means[c]

    # Fit Ledoit-Wolf Shrinkage Covariance on TRAIN ONLY for numerical stability (D=1280, N=606)
    print("Fitting Ledoit-Wolf regularized covariance on centered TRAIN embeddings...")
    lw = LedoitWolf(assume_centered=True)
    lw.fit(centered_train)
    precision_matrix = lw.precision_  # Inverse covariance matrix
    shrinkage = lw.shrinkage_
    print(f"Ledoit-Wolf optimal shrinkage intensity: {shrinkage:.4f}")

    def compute_min_mahalanobis(embs: np.ndarray) -> np.ndarray:
        dists = []
        for vec in embs:
            min_d = float("inf")
            for c in range(4):
                diff = vec - class_means[c]
                # d^2 = diff @ precision @ diff
                d2 = np.dot(diff, np.dot(precision_matrix, diff))
                d = math.sqrt(max(0.0, float(d2)))
                if d < min_d:
                    min_d = d
            dists.append(min_d)
        return np.array(dists)

    val_mahal = compute_min_mahalanobis(val_embs)
    all_ood_mahal = compute_min_mahalanobis(all_ood_embs)
    cat_ood_mahal = {cat: compute_min_mahalanobis(ood_embs[cat]) for cat in ood_embs}

    print(f"\nIn-Domain Validation Mahalanobis Distance:")
    print(f"  Mean: {np.mean(val_mahal):.2f}, Std: {np.std(val_mahal):.2f}, Min: {np.min(val_mahal):.2f}, Max: {np.max(val_mahal):.2f}")
    print(f"  P90: {np.percentile(val_mahal, 90):.2f}, P95: {np.percentile(val_mahal, 95):.2f}, P98: {np.percentile(val_mahal, 98):.2f}, P99: {np.percentile(val_mahal, 99):.2f}")

    print(f"\nOOD Benchmark Mahalanobis Distance:")
    print(f"  Overall Mean: {np.mean(all_ood_mahal):.2f}, Min: {np.min(all_ood_mahal):.2f}, Max: {np.max(all_ood_mahal):.2f}")
    for cat in ood_samples:
        print(f"  Category '{cat:<22}': Mean={np.mean(cat_ood_mahal[cat]):.2f}, Min={np.min(cat_ood_mahal[cat]):.2f}, Max={np.max(cat_ood_mahal[cat]):.2f}")

    # Threshold calibration on Validation set only
    tau_95 = float(np.percentile(val_mahal, 95.0))
    tau_98 = float(np.percentile(val_mahal, 98.0))
    tau_99 = float(np.percentile(val_mahal, 99.0))
    tau_max = float(np.max(val_mahal))

    # Evaluate candidates
    results = {}
    candidates = [
        ("TPR 95% (Val P95)", tau_95),
        ("TPR 98% (Val P98)", tau_98),
        ("TPR 99% (Val P99)", tau_99),
        ("Max Val In-Domain", tau_max)
    ]

    for label, thresh in candidates:
        val_accepted = int(np.sum(val_mahal <= thresh))
        val_false_rejected = int(len(val_samples) - val_accepted)
        ood_rejected = int(np.sum(all_ood_mahal > thresh))
        ood_false_accepted = int(len(all_ood_mahal) - ood_rejected)
        
        # Per category rejection
        cat_rej = {cat: int(np.sum(cat_ood_mahal[cat] > thresh)) for cat in ood_samples}
        
        results[label] = {
            "threshold": round(thresh, 2),
            "in_domain_acceptance": f"{val_accepted}/{len(val_samples)} ({val_accepted/len(val_samples)*100:.2f}%)",
            "val_false_rejection": val_false_rejected,
            "ood_rejection": f"{ood_rejected}/{total_ood} ({ood_rejected/total_ood*100:.2f}%)",
            "ood_false_acceptance": ood_false_accepted,
            "per_category_rejection": cat_rej
        }

    # Combined Two-Tier Gate Evaluation
    # Sample passes iff (foliar_pixel_ratio >= 0.25) AND (mahal_dist <= tau_98)
    combined_val_pass = 0
    for i in range(len(val_samples)):
        if val_foliar[i] >= tier1_thresh and val_mahal[i] <= tau_98:
            combined_val_pass += 1

    combined_ood_rejected = 0
    for i in range(total_ood):
        if ood_foliar[i] < tier1_thresh or all_ood_mahal[i] > tau_98:
            combined_ood_rejected += 1

    print("\n" + "=" * 70)
    print("RESULTS SUMMARY")
    print("=" * 70)
    print(json.dumps(results, indent=2))
    print(f"\nCombined Two-Tier Pipeline (Foliar Coverage >= 25% + Mahalanobis <= {tau_98:.2f}):")
    print(f"  In-Domain Val Acceptance: {combined_val_pass}/{len(val_samples)} ({combined_val_pass/len(val_samples)*100:.2f}%)")
    print(f"  OOD Rejection:           {combined_ood_rejected}/{total_ood} ({combined_ood_rejected/total_ood*100:.2f}%)")

    # Save artifact metrics for report generator
    summary_data = {
        "dataset_splits": {"train": len(train_samples), "val": len(val_samples), "test": len(test_samples)},
        "total_ood": total_ood,
        "ood_categories": list(ood_samples.keys()),
        "shrinkage_intensity": float(shrinkage),
        "tier1": {
            "threshold": tier1_thresh,
            "val_foliar": {"mean": float(np.mean(val_foliar)), "min": float(np.min(val_foliar)), "p05": float(np.percentile(val_foliar, 5))},
            "ood_foliar": {"mean": float(np.mean(ood_foliar)), "max": float(np.max(ood_foliar)), "p95": float(np.percentile(ood_foliar, 95))},
            "val_pass_rate": f"{val_passed_tier1}/{len(val_samples)} ({val_passed_tier1/len(val_samples)*100:.2f}%)",
            "ood_reject_rate": f"{ood_rejected_tier1}/{total_ood} ({ood_rejected_tier1/total_ood*100:.2f}%)"
        },
        "tier2": {
            "val_mahal": {
                "mean": float(np.mean(val_mahal)), "std": float(np.std(val_mahal)),
                "min": float(np.min(val_mahal)), "max": float(np.max(val_mahal)),
                "p95": float(tau_95), "p98": float(tau_98), "p99": float(tau_99)
            },
            "ood_mahal": {
                "mean": float(np.mean(all_ood_mahal)),
                "min": float(np.min(all_ood_mahal)),
                "max": float(np.max(all_ood_mahal)),
                "by_category": {cat: {"mean": float(np.mean(cat_ood_mahal[cat])), "min": float(np.min(cat_ood_mahal[cat]))} for cat in ood_samples}
            },
            "candidates": results
        },
        "combined": {
            "in_domain_acceptance": f"{combined_val_pass}/{len(val_samples)} ({combined_val_pass/len(val_samples)*100:.2f}%)",
            "ood_rejection": f"{combined_ood_rejected}/{total_ood} ({combined_ood_rejected/total_ood*100:.2f}%)",
            "false_rejections": len(val_samples) - combined_val_pass,
            "false_acceptances": total_ood - combined_ood_rejected
        }
    }

    with open(BASE_DIR / "research_results" / "ood_experiment_data.json", "w", encoding="utf-8") as f:
        json.dump(summary_data, f, indent=2)

    print("\nExperiment completed successfully and metrics written to research_results/ood_experiment_data.json")


if __name__ == "__main__":
    run_experiment()
