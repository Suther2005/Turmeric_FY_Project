"""
Retrain EfficientNet-B0 on Clean Dataset_01 Manifest
====================================================
Training set: 603 images (Excludes leaf_spot_141, 142, 144)
Validation set: 130 images
Checkpoints: backend/checkpoints/efficientnet_b0_clean_best.pth
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

# Set seeds for deterministic training
SEED = 42
random.seed(SEED)
np.random.seed(SEED)
torch.manual_seed(SEED)

BASE_DIR = Path(__file__).resolve().parent.parent
DATASET_DIR = BASE_DIR / "turmeric_datasets"
SPLITS_CSV = DATASET_DIR / "metadata" / "dataset_splits_clean.csv"
CHECKPOINT_DIR = BASE_DIR / "backend" / "checkpoints"
CHECKPOINT_DIR.mkdir(parents=True, exist_ok=True)
CLEAN_MODEL_PATH = CHECKPOINT_DIR / "efficientnet_b0_clean_best.pth"

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
CLASS_NAMES = ["Aphids_Disease", "Blotch", "Healthy_Leaf", "Leaf_Spot"]

# Training & Eval transforms
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
        
        print(f"  [Cache] Pre-loading {len(samples)} images into memory at 256x256...", flush=True)
        for path, label in samples:
            with Image.open(path) as img:
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


def load_clean_splits():
    train_samples, val_samples, test_samples = [], [], []

    if not SPLITS_CSV.exists():
        raise FileNotFoundError(f"Clean manifest not found at {SPLITS_CSV}")

    print(f"[Dataset] Loading clean split manifest from {SPLITS_CSV}", flush=True)
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


def train_clean_efficientnet(
    max_epochs: int = 20,
    batch_size: int = 32,
    lr: float = 1e-4,
    weight_decay: float = 1e-4,
    patience: int = 5
):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[*] Training on device: {device}", flush=True)

    train_samples, val_samples, test_samples = load_clean_splits()
    print(f"[*] Clean Split Sizes - Train: {len(train_samples)}, Val: {len(val_samples)}, Internal Test: {len(test_samples)}", flush=True)
    
    assert len(train_samples) == 603, f"Expected 603 clean train samples, got {len(train_samples)}"
    assert len(val_samples) == 130, f"Expected 130 val samples, got {len(val_samples)}"
    assert len(test_samples) == 129, f"Expected 129 test samples, got {len(test_samples)}"

    train_ds = CachedTurmericDataset(train_samples, TRAIN_TRANSFORMS)
    val_ds = CachedTurmericDataset(val_samples, EVAL_TRANSFORMS)

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False)

    # Initialize EfficientNet-B0 with ImageNet pretrained weights
    print("[*] Building pretrained EfficientNet-B0 backbone...", flush=True)
    model = models.efficientnet_b0(weights=models.EfficientNet_B0_Weights.DEFAULT)
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.3),
        nn.Linear(in_features, 4)
    )
    model = model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=weight_decay)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', factor=0.5, patience=2)

    best_val_loss = float("inf")
    best_val_acc = 0.0
    best_epoch = 0
    patience_counter = 0
    early_stopped = False

    print("\n" + "=" * 75, flush=True)
    print("STARTING EFFICIENTNET-B0 CLEAN RETRAINING LOOP (Max 20 Epochs, Patience 5)", flush=True)
    print("=" * 75, flush=True)

    for epoch in range(1, max_epochs + 1):
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

        # Validation pass
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

        tr_loss_avg = train_loss / train_total
        tr_acc = (train_correct / train_total) * 100.0
        va_loss_avg = val_loss / val_total
        va_acc = (val_correct / val_total) * 100.0
        elapsed = time.time() - t0
        curr_lr = optimizer.param_groups[0]['lr']

        print(
            f"Epoch {epoch:02d}/{max_epochs:02d} | "
            f"Train Loss: {tr_loss_avg:.4f} Acc: {tr_acc:.2f}% | "
            f"Val Loss: {va_loss_avg:.4f} Acc: {va_acc:.2f}% | "
            f"LR: {curr_lr:.2e} | Time: {elapsed:.1f}s",
            flush=True
        )

        scheduler.step(va_loss_avg)

        # Check for best validation loss & accuracy
        if va_loss_avg < best_val_loss:
            best_val_loss = va_loss_avg
            best_val_acc = va_acc
            best_epoch = epoch
            patience_counter = 0

            # Save clean best checkpoint
            torch.save({
                "epoch": epoch,
                "model_state_dict": model.state_dict(),
                "best_val_loss": best_val_loss,
                "val_acc": best_val_acc,
                "architecture": "EfficientNet-B0",
                "class_names": CLASS_NAMES
            }, str(CLEAN_MODEL_PATH))
            print(f"  --> [NEW BEST] Saved checkpoint to {CLEAN_MODEL_PATH} (Val Loss: {va_loss_avg:.4f}, Val Acc: {va_acc:.2f}%)", flush=True)
        else:
            patience_counter += 1
            print(f"  --> No improvement in val loss (patience: {patience_counter}/{patience})", flush=True)
            if patience_counter >= patience:
                print(f"\n[!] Early stopping triggered at epoch {epoch} (no val loss improvement for {patience} epochs).", flush=True)
                early_stopped = True
                break

    print("\n" + "=" * 75, flush=True)
    print("TRAINING COMPLETE — SUMMARY OF RESULTS", flush=True)
    print("=" * 75, flush=True)
    print(f"1. Best Validation Loss:      {best_val_loss:.4f}")
    print(f"2. Best Validation Accuracy:  {best_val_acc:.2f}%")
    print(f"3. Epoch of Best Checkpoint:  Epoch {best_epoch}")
    print(f"4. Final Validation Accuracy: {va_acc:.2f}% (Epoch {epoch})")
    print(f"5. Early Stopping Occurred:   {early_stopped}")
    print(f"6. Saved Checkpoint Path:     {CLEAN_MODEL_PATH}")
    print("=" * 75, flush=True)

    return {
        "best_val_loss": best_val_loss,
        "best_val_acc": best_val_acc,
        "best_epoch": best_epoch,
        "final_val_acc": va_acc,
        "early_stopped": early_stopped,
        "checkpoint_path": str(CLEAN_MODEL_PATH)
    }


if __name__ == "__main__":
    train_clean_efficientnet(
        max_epochs=20,
        batch_size=32,
        lr=1e-4,
        weight_decay=1e-4,
        patience=5
    )
