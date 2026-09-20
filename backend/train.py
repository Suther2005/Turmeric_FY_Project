"""
Turmeric Pathology Fast Model Training Script (CPU/GPU Optimized)
================================================================
Pre-caches resized images to memory for fast training on CPU.
Partitions:
  - Dataset 01: 70% Train (606), 15% Val (130), 15% Test (129)
  - Target classes: Aphids (0), Blotch (1), Healthy (2), Leaf Spot (3)
"""

import os
import csv
import time
import random
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from torchvision import models, transforms
from PIL import Image
from pathlib import Path

# Set seeds for reproducibility
SEED = 42
random.seed(SEED)
np.random.seed(SEED)
torch.manual_seed(SEED)

BASE_DIR = Path(__file__).resolve().parent.parent
DATASET_DIR = BASE_DIR / "turmeric_datasets"
SPLITS_CSV = DATASET_DIR / "metadata" / "dataset_splits.csv"
CHECKPOINT_DIR = BASE_DIR / "backend" / "checkpoints"
CHECKPOINT_DIR.mkdir(parents=True, exist_ok=True)
BEST_MODEL_PATH = CHECKPOINT_DIR / "best_model.pth"

CLASS_MAP = {
    "Aphids_Disease": 0,
    "Aphids": 0,
    "Blotch": 1,
    "Healthy_Leaf": 2,
    "Healthy": 2,
    "Leaf_Spot": 3,
    "Leaf Spot": 3
}
INV_CLASS_MAP = {0: "Aphids", 1: "Blotch", 2: "Healthy", 3: "Leaf Spot"}

# Standard 224x224 transformations
TRAIN_TRANSFORMS = transforms.Compose([
    transforms.RandomCrop(224),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(15),
    transforms.ColorJitter(brightness=0.1, contrast=0.1),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

EVAL_TRANSFORMS = transforms.Compose([
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])


class CachedTurmericDataset(Dataset):
    def __init__(self, samples, transform=None):
        self.cached_images = []
        self.labels = []
        self.transform = transform
        
        print(f"  [Cache] Pre-loading {len(samples)} images into memory at 256x256...")
        for path, label in samples:
            with Image.open(path) as img:
                # Fast thumbnail resize to 256x256
                resized = img.convert("RGB").resize((256, 256), Image.Resampling.BILINEAR)
                self.cached_images.append(resized)
                self.labels.append(label)

    def __len__(self):
        return len(self.labels)

    def __getitem__(self, idx):
        img = self.cached_images[idx]
        label = self.labels[idx]
        if self.transform:
            img = self.transform(img)
        return img, label


def load_splits_from_csv():
    train_samples, val_samples, test_samples = [], [], []

    if SPLITS_CSV.exists():
        print(f"[Dataset] Reading manifest from {SPLITS_CSV}")
        with open(SPLITS_CSV, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row.get("dataset") == "Dataset_01":
                    rel_p = row["relative_path"]
                    full_p = DATASET_DIR / rel_p
                    cname = row["original_class"]
                    if cname in CLASS_MAP and full_p.exists():
                        item = (str(full_p), CLASS_MAP[cname])
                        split = row["split"]
                        if split == "train":
                            train_samples.append(item)
                        elif split == "val":
                            val_samples.append(item)
                        elif split == "internal_test":
                            test_samples.append(item)

    return train_samples, val_samples, test_samples


def train_model(epochs: int = 5, batch_size: int = 32, lr: float = 3e-4):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[*] Training on device: {device}")

    train_samples, val_samples, test_samples = load_splits_from_csv()
    print(f"[*] Split sizes - Train: {len(train_samples)}, Val: {len(val_samples)}, Test: {len(test_samples)}")

    train_ds = CachedTurmericDataset(train_samples, TRAIN_TRANSFORMS)
    val_ds = CachedTurmericDataset(val_samples, EVAL_TRANSFORMS)
    test_ds = CachedTurmericDataset(test_samples, EVAL_TRANSFORMS)

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False)
    test_loader = DataLoader(test_ds, batch_size=batch_size, shuffle=False)

    # Initialize MobileNetV2 with pretrained backbone
    model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.DEFAULT)
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.3),
        nn.Linear(in_features, 4)
    )
    model = model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)

    best_val_acc = 0.0

    print("\n" + "=" * 60)
    print("STARTING TRAINING LOOP")
    print("=" * 60)

    for epoch in range(1, epochs + 1):
        t0 = time.time()
        model.train()
        train_loss, train_correct, train_total = 0.0, 0, 0

        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            train_loss += loss.item() * images.size(0)
            _, preds = torch.max(outputs, 1)
            train_correct += (preds == labels).sum().item()
            train_total += labels.size(0)

        scheduler.step()

        # Validation
        model.eval()
        val_loss, val_correct, val_total = 0.0, 0, 0
        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                loss = criterion(outputs, labels)
                val_loss += loss.item() * images.size(0)
                _, preds = torch.max(outputs, 1)
                val_correct += (preds == labels).sum().item()
                val_total += labels.size(0)

        tr_acc = (train_correct / train_total) * 100.0 if train_total > 0 else 0
        va_acc = (val_correct / val_total) * 100.0 if val_total > 0 else 0
        elapsed = time.time() - t0

        print(f"Epoch {epoch:02d}/{epochs:02d} | Train Loss: {train_loss/train_total:.4f} Acc: {tr_acc:.2f}% | Val Loss: {val_loss/val_total:.4f} Acc: {va_acc:.2f}% | Time: {elapsed:.1f}s")

        if va_acc >= best_val_acc:
            best_val_acc = va_acc
            torch.save({
                "epoch": epoch,
                "model_state_dict": model.state_dict(),
                "val_acc": va_acc,
                "architecture": "MobileNetV2",
                "classes": list(INV_CLASS_MAP.values())
            }, str(BEST_MODEL_PATH))
            print(f"  --> Saved new best checkpoint to {BEST_MODEL_PATH} (Val Acc: {va_acc:.2f}%)")

    # Evaluation on Held-out Internal Test Set
    print("\n" + "=" * 60)
    print("EVALUATING ON HELD-OUT TEST SET (n=129)")
    print("=" * 60)
    
    checkpoint = torch.load(str(BEST_MODEL_PATH), map_location=device, weights_only=True)
    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()

    test_correct, test_total = 0, 0
    per_class_correct = {0: 0, 1: 0, 2: 0, 3: 0}
    per_class_total = {0: 0, 1: 0, 2: 0, 3: 0}

    with torch.no_grad():
        for images, labels in test_loader:
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            _, preds = torch.max(outputs, 1)
            test_correct += (preds == labels).sum().item()
            test_total += labels.size(0)

            for p, l in zip(preds.cpu().numpy(), labels.cpu().numpy()):
                per_class_total[l] += 1
                if p == l:
                    per_class_correct[l] += 1

    test_acc = (test_correct / test_total) * 100.0
    print(f"Overall Test Accuracy: {test_acc:.2f}% ({test_correct}/{test_total})")
    for idx, name in INV_CLASS_MAP.items():
        tot = per_class_total[idx]
        corr = per_class_correct[idx]
        acc = (corr / tot * 100.0) if tot > 0 else 0
        print(f"  Class [{idx}] {name:<12}: {acc:.2f}% ({corr}/{tot})")

    print("\nTraining and evaluation complete!")
    return test_acc


if __name__ == "__main__":
    train_model(epochs=5, batch_size=32, lr=3e-4)
