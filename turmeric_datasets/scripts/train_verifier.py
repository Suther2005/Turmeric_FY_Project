import os
import sys
import time
import json
import random
import psutil
import numpy as np
import pandas as pd
from PIL import Image
from pathlib import Path

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import torchvision.transforms as transforms
import torchvision.models as models

from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
    confusion_matrix,
    brier_score_loss,
    classification_report
)

def set_seed(seed=42):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)

def get_process_memory_mb():
    process = psutil.Process(os.getpid())
    return process.memory_info().rss / (1024 * 1024)

class TurmericVerifierCachedDataset(Dataset):
    """
    In-memory cached dataset:
    Reads and decodes full-resolution source images once during initialization,
    resizing to 256x256 in RAM. Subsequent epochs retrieve cached 256x256 PIL images
    instantly in RAM and apply on-the-fly random crops/augmentations with zero I/O bottleneck.
    """
    def __init__(self, df: pd.DataFrame, root_dir: Path, transform=None, cache_size=(256, 256), desc="Dataset"):
        self.df = df.reset_index(drop=True)
        self.root_dir = Path(root_dir)
        self.transform = transform
        self.cache_size = cache_size
        
        print(f"Pre-caching {len(self.df)} images for {desc} (resizing once to {cache_size[0]}x{cache_size[1]})...", flush=True)
        t0 = time.time()
        
        self.cached_images = []
        self.labels = []
        self.subcategories = []
        self.sample_ids = []
        
        for idx in range(len(self.df)):
            row = self.df.iloc[idx]
            img_rel_path = row['relative_path']
            img_path = self.root_dir / img_rel_path
            
            try:
                # Open, convert to RGB, resize once to 256x256 cache resolution
                with Image.open(img_path) as raw_img:
                    rgb_img = raw_img.convert('RGB')
                    cached_img = rgb_img.resize(self.cache_size, Image.Resampling.BILINEAR)
            except Exception as e:
                raise RuntimeError(f"Error loading image {img_path}: {e}")
                
            self.cached_images.append(cached_img)
            self.labels.append(float(row['binary_target']))
            self.subcategories.append(row['subcategory'])
            self.sample_ids.append(row['sample_id'])
            
            if (idx + 1) % 250 == 0 or (idx + 1) == len(self.df):
                print(f"  Cached {idx + 1}/{len(self.df)} images in {time.time() - t0:.1f}s", flush=True)
                
        elapsed = time.time() - t0
        print(f"[OK] {desc} caching complete: {len(self.cached_images)} images in {elapsed:.2f}s ({len(self.cached_images)/elapsed:.1f} img/s)\n", flush=True)

    def __len__(self):
        return len(self.cached_images)

    def __getitem__(self, idx):
        image = self.cached_images[idx]
        label = self.labels[idx]
        subcategory = self.subcategories[idx]
        sample_id = self.sample_ids[idx]
        
        if self.transform:
            image = self.transform(image)
            
        return image, torch.tensor(label, dtype=torch.float32), subcategory, sample_id

class TurmericLeafVerifier(nn.Module):
    def __init__(self, pretrained=True):
        super().__init__()
        weights = models.MobileNet_V3_Small_Weights.DEFAULT if pretrained else None
        self.backbone = models.mobilenet_v3_small(weights=weights)
        in_features = self.backbone.classifier[0].in_features
        self.backbone.classifier = nn.Sequential(
            nn.Linear(in_features, 256),
            nn.Hardswish(),
            nn.Dropout(p=0.2),
            nn.Linear(256, 1)
        )

    def forward(self, x):
        return self.backbone(x).squeeze(-1)

def get_transforms():
    train_transform = transforms.Compose([
        transforms.RandomResizedCrop(224, scale=(0.75, 1.0)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomVerticalFlip(p=0.5),
        transforms.RandomRotation(degrees=15),
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2, hue=0.05),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    val_transform = transforms.Compose([
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    return train_transform, val_transform

def train_epoch(model, dataloader, criterion, optimizer, device):
    model.train()
    running_loss = 0.0
    all_preds, all_labels = [], []
    
    for images, labels, _, _ in dataloader:
        images = images.to(device)
        labels = labels.to(device)
        
        optimizer.zero_grad()
        logits = model(images)
        loss = criterion(logits, labels)
        loss.backward()
        optimizer.step()
        
        running_loss += loss.item() * images.size(0)
        probs = torch.sigmoid(logits).detach().cpu().numpy()
        all_preds.extend(probs)
        all_labels.extend(labels.cpu().numpy())
        
    epoch_loss = running_loss / len(dataloader.dataset)
    epoch_acc = accuracy_score(all_labels, (np.array(all_preds) >= 0.5).astype(int))
    return epoch_loss, epoch_acc

@torch.no_grad()
def evaluate(model, dataloader, criterion, device):
    model.eval()
    running_loss = 0.0
    all_probs, all_labels, all_subcats, all_ids = [], [], [], []
    
    for images, labels, subcats, ids in dataloader:
        images = images.to(device)
        labels = labels.to(device)
        
        logits = model(images)
        loss = criterion(logits, labels)
        
        running_loss += loss.item() * images.size(0)
        probs = torch.sigmoid(logits).cpu().numpy()
        all_probs.extend(probs)
        all_labels.extend(labels.cpu().numpy())
        all_subcats.extend(subcats)
        all_ids.extend(ids)
        
    val_loss = running_loss / len(dataloader.dataset)
    probs = np.array(all_probs)
    labels = np.array(all_labels)
    preds = (probs >= 0.5).astype(int)
    
    cm = confusion_matrix(labels, preds)
    tn, fp, fn, tp = cm.ravel() if cm.shape == (2, 2) else (0, 0, 0, 0)
    specificity = tn / (tn + fp) if (tn + fp) > 0 else 0.0
    
    metrics = {
        'loss': float(val_loss),
        'accuracy': float(accuracy_score(labels, preds)),
        'balanced_accuracy': float(balanced_accuracy_score(labels, preds)),
        'precision': float(precision_score(labels, preds, zero_division=0)),
        'recall': float(recall_score(labels, preds, zero_division=0)),
        'specificity': float(specificity),
        'f1': float(f1_score(labels, preds, zero_division=0)),
        'roc_auc': float(roc_auc_score(labels, probs)),
        'pr_auc': float(average_precision_score(labels, probs)),
        'brier_score': float(brier_score_loss(labels, probs)),
        'confusion_matrix': cm.tolist(),
        'tn': int(tn),
        'fp': int(fp),
        'fn': int(fn),
        'tp': int(tp),
        'probs': probs,
        'labels': labels,
        'subcats': all_subcats,
        'sample_ids': all_ids
    }
    return metrics

def run_threshold_analysis(labels, probs):
    thresholds = [0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40, 0.45, 0.50, 0.55, 0.60, 0.65, 0.70, 0.75, 0.80, 0.85, 0.90, 0.95]
    results = []
    
    for t in thresholds:
        preds = (probs >= t).astype(int)
        cm = confusion_matrix(labels, preds)
        tn, fp, fn, tp = cm.ravel()
        
        acc = (tp + tn) / (tp + tn + fp + fn)
        prec = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        rec = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1 = 2 * (prec * rec) / (prec + rec) if (prec + rec) > 0 else 0.0
        fpr = fp / (fp + tn) if (fp + tn) > 0 else 0.0
        frr = fn / (fn + tp) if (fn + tp) > 0 else 0.0
        youden_j = rec + (tn / (tn + fp)) - 1.0 if (tn + fp) > 0 else 0.0
        
        results.append({
            'threshold': t,
            'accuracy': float(acc),
            'precision': float(prec),
            'recall': float(rec),
            'f1_score': float(f1),
            'fpr_false_accept': float(fpr),
            'frr_false_reject': float(frr),
            'youden_j': float(youden_j),
            'tp': int(tp),
            'fp': int(fp),
            'tn': int(tn),
            'fn': int(fn)
        })
        
    return pd.DataFrame(results)

def benchmark_cpu_latency(model, num_warmup=25, num_runs=100):
    model.eval()
    model_cpu = model.to('cpu')
    dummy_input = torch.randn(1, 3, 224, 224)
    
    # Warmup
    for _ in range(num_warmup):
        with torch.no_grad():
            _ = model_cpu(dummy_input)
            
    latencies = []
    for _ in range(num_runs):
        start = time.perf_counter()
        with torch.no_grad():
            _ = model_cpu(dummy_input)
        end = time.perf_counter()
        latencies.append((end - start) * 1000) # ms
        
    return {
        'mean_ms': float(np.mean(latencies)),
        'median_ms': float(np.median(latencies)),
        'p90_ms': float(np.percentile(latencies, 90)),
        'p95_ms': float(np.percentile(latencies, 95)),
        'p99_ms': float(np.percentile(latencies, 99)),
        'min_ms': float(np.min(latencies)),
        'max_ms': float(np.max(latencies)),
        'std_ms': float(np.std(latencies)),
        'fps_throughput': float(1000.0 / np.mean(latencies))
    }

def analyze_validation_subcategories(val_metrics):
    df_val = pd.DataFrame({
        'sample_id': val_metrics['sample_ids'],
        'subcategory': val_metrics['subcats'],
        'label': val_metrics['labels'],
        'prob': val_metrics['probs'],
        'pred': (val_metrics['probs'] >= 0.50).astype(int)
    })
    
    subcat_summary = []
    for subcat, group in df_val.groupby('subcategory'):
        total = len(group)
        correct = (group['label'] == group['pred']).sum()
        mean_prob = group['prob'].mean()
        acc = correct / total
        subcat_summary.append({
            'subcategory': subcat,
            'ground_truth': int(group['label'].iloc[0]),
            'count': int(total),
            'correct': int(correct),
            'accuracy': float(acc),
            'mean_confidence': float(mean_prob)
        })
    return sorted(subcat_summary, key=lambda x: (x['ground_truth'], x['subcategory']))

def main():
    start_time_all = time.time()
    set_seed(42)
    initial_ram_mb = get_process_memory_mb()
    
    root_dir = Path("d:/curuma")
    manifest_path = root_dir / "turmeric_datasets" / "metadata" / "verifier_dataset_manifest.csv"
    
    print("=" * 70, flush=True)
    print("PHASE 2: TURMERIC LEAF VERIFIER MODEL TRAINING & BENCHMARKING (CACHED)", flush=True)
    print("=" * 70, flush=True)
    print(f"Loading verifier manifest from: {manifest_path}", flush=True)
    df = pd.read_csv(manifest_path)
    
    # Strictly filter train and val
    train_df = df[df['split'] == 'train'].copy()
    val_df = df[df['split'] == 'val'].copy()
    
    print(f"\n[DATA SPLITS APPROVED FOR TRAINING]", flush=True)
    print(f"  • Train split: {len(train_df)} images (Positives: {(train_df['binary_target']==1).sum()}, Negatives: {(train_df['binary_target']==0).sum()})", flush=True)
    print(f"  • Val split:   {len(val_df)} images (Positives: {(val_df['binary_target']==1).sum()}, Negatives: {(val_df['binary_target']==0).sum()})", flush=True)
    
    # Strictly isolate untouched splits
    other_splits = df[~df['split'].isin(['train', 'val'])]['split'].value_counts()
    print(f"\n[UNTOUCHED BENCHMARK / RESERVED SPLITS - STRICT ISOLATION]", flush=True)
    for s, count in other_splits.items():
        print(f"  [LOCKED & UNTOUCHED] {s}: {count} images", flush=True)
        
    train_transform, val_transform = get_transforms()
    
    # Pre-cache datasets in RAM
    train_dataset = TurmericVerifierCachedDataset(train_df, root_dir, transform=train_transform, cache_size=(256, 256), desc="Train Set")
    val_dataset = TurmericVerifierCachedDataset(val_df, root_dir, transform=val_transform, cache_size=(256, 256), desc="Val Set")
    
    # Benchmark dataset throughput
    t_bench = time.time()
    train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True, num_workers=0, pin_memory=False)
    val_loader = DataLoader(val_dataset, batch_size=32, shuffle=False, num_workers=0, pin_memory=False)
    
    # Measure 1 pass through train loader
    for _ in train_loader:
        pass
    loader_pass_time = time.time() - t_bench
    print(f"[BENCHMARK] Fast In-Memory DataLoader 1 full epoch pass time: {loader_pass_time:.3f}s ({len(train_dataset)/loader_pass_time:.1f} images/s)\n", flush=True)
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Training device: {device}", flush=True)
    
    model = TurmericLeafVerifier(pretrained=True).to(device)
    
    # Model size & parameter count
    num_params = sum(p.numel() for p in model.parameters())
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    model_param_mem_mb = (num_params * 4) / (1024 * 1024)
    
    print(f"Model Backbone: MobileNetV3-Small (Pretrained: True)", flush=True)
    print(f"Total Parameters:     {num_params:,} ({num_params/1e6:.2f}M)", flush=True)
    print(f"Trainable Parameters: {trainable_params:,} ({trainable_params/1e6:.2f}M)", flush=True)
    print(f"Parameter RAM (fp32): {model_param_mem_mb:.2f} MB\n", flush=True)
    
    # Calculate pos_weight for BCEWithLogitsLoss
    num_neg = (train_df['binary_target'] == 0).sum()
    num_pos = (train_df['binary_target'] == 1).sum()
    pos_weight_val = num_neg / num_pos
    pos_weight = torch.tensor([pos_weight_val], dtype=torch.float32).to(device)
    print(f"BCEWithLogitsLoss pos_weight: {pos_weight_val:.4f} (neg={num_neg}, pos={num_pos})", flush=True)
    
    criterion = nn.BCEWithLogitsLoss(pos_weight=pos_weight)
    learning_rate = 3e-4
    weight_decay = 1e-4
    num_epochs = 15
    optimizer = optim.AdamW(model.parameters(), lr=learning_rate, weight_decay=weight_decay)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=num_epochs, eta_min=1e-6)
    
    print(f"Optimizer: AdamW (lr={learning_rate}, weight_decay={weight_decay})", flush=True)
    print(f"Scheduler: CosineAnnealingLR (T_max={num_epochs}, eta_min=1e-6)", flush=True)
    print(f"Total Epochs: {num_epochs}\n", flush=True)
    
    best_val_f1 = -1.0
    best_metrics = None
    best_state_dict = None
    best_epoch = -1
    
    print("=" * 70, flush=True)
    print("TRAINING LOOP COMMENCING", flush=True)
    print("=" * 70, flush=True)
    
    training_history = []
    peak_train_ram_mb = initial_ram_mb
    training_loop_start = time.time()
    
    for epoch in range(1, num_epochs + 1):
        t0 = time.time()
        train_loss, train_acc = train_epoch(model, train_loader, criterion, optimizer, device)
        scheduler.step()
        val_metrics = evaluate(model, val_loader, criterion, device)
        elapsed = time.time() - t0
        
        current_ram = get_process_memory_mb()
        peak_train_ram_mb = max(peak_train_ram_mb, current_ram)
        
        training_history.append({
            'epoch': epoch,
            'train_loss': float(train_loss),
            'train_acc': float(train_acc),
            'val_loss': float(val_metrics['loss']),
            'val_acc': float(val_metrics['accuracy']),
            'val_f1': float(val_metrics['f1']),
            'val_precision': float(val_metrics['precision']),
            'val_recall': float(val_metrics['recall']),
            'val_specificity': float(val_metrics['specificity']),
            'val_roc_auc': float(val_metrics['roc_auc']),
            'val_pr_auc': float(val_metrics['pr_auc']),
            'lr': float(optimizer.param_groups[0]['lr']),
            'time_sec': float(elapsed),
            'ram_mb': float(current_ram)
        })
        
        is_best_str = ""
        if val_metrics['f1'] > best_val_f1:
            best_val_f1 = val_metrics['f1']
            best_metrics = val_metrics
            best_state_dict = {k: v.cpu().clone() for k, v in model.state_dict().items()}
            best_epoch = epoch
            is_best_str = " -> [BEST F1]"
            
        print(f"Epoch {epoch:02d}/{num_epochs:02d} [{elapsed:.2f}s | RAM: {current_ram:.1f} MB] | "
              f"TrLoss: {train_loss:.4f} TrAcc: {train_acc*100:.2f}% | "
              f"ValLoss: {val_metrics['loss']:.4f} ValAcc: {val_metrics['accuracy']*100:.2f}% "
              f"F1: {val_metrics['f1']*100:.2f}% (P: {val_metrics['precision']*100:.1f}%, R: {val_metrics['recall']*100:.1f}%) "
              f"AUC: {val_metrics['roc_auc']:.4f}{is_best_str}", flush=True)
              
    total_training_loop_time = time.time() - training_loop_start
    print("\n" + "=" * 70, flush=True)
    print(f"TRAINING COMPLETE in {total_training_loop_time:.2f}s ({total_training_loop_time/num_epochs:.2f}s/epoch). Best Epoch: {best_epoch} with Val F1: {best_val_f1*100:.2f}%", flush=True)
    print("=" * 70, flush=True)
    
    # Save best checkpoint strictly in turmeric_models/checkpoints (NOT in backend/)
    output_dir = root_dir / "turmeric_models" / "checkpoints"
    output_dir.mkdir(parents=True, exist_ok=True)
    best_ckpt_path = output_dir / "turmeric_leaf_verifier_mobilenetv3.pth"
    
    torch.save({
        'model_state_dict': best_state_dict,
        'architecture': 'mobilenet_v3_small',
        'threshold_default': 0.50,
        'best_epoch': best_epoch,
        'best_val_f1': best_val_f1,
        'val_metrics': {k: v for k, v in best_metrics.items() if k not in ['probs', 'labels', 'subcats', 'sample_ids']}
    }, best_ckpt_path)
    
    checkpoint_file_size_mb = os.path.getsize(best_ckpt_path) / (1024 * 1024)
    print(f"\nSaved local verifier checkpoint to: {best_ckpt_path} ({checkpoint_file_size_mb:.2f} MB)", flush=True)
    
    # Reload best model for evaluation & benchmarking
    model.load_state_dict(best_state_dict)
    model.eval()
    
    # Re-evaluate with best model
    val_metrics = evaluate(model, val_loader, criterion, device)
    probs = val_metrics['probs']
    labels = val_metrics['labels']
    
    # Threshold Analysis
    threshold_df = run_threshold_analysis(labels, probs)
    print("\n" + "=" * 70, flush=True)
    print("VALIDATION THRESHOLD SENSITIVITY ANALYSIS (0.05 to 0.95)", flush=True)
    print("=" * 70, flush=True)
    print(threshold_df.to_string(index=False), flush=True)
    
    # Subcategory Analysis
    subcat_summary = analyze_validation_subcategories(val_metrics)
    print("\n" + "=" * 70, flush=True)
    print("VALIDATION PERFORMANCE BY SUBCATEGORY", flush=True)
    print("=" * 70, flush=True)
    subcat_df = pd.DataFrame(subcat_summary)
    print(subcat_df.to_string(index=False), flush=True)
    
    # CPU Latency Benchmarking (Strict CPU mode)
    print("\n" + "=" * 70, flush=True)
    print("BENCHMARKING CPU INFERENCE LATENCY & THROUGHPUT (100 Runs)", flush=True)
    print("=" * 70, flush=True)
    latency_stats = benchmark_cpu_latency(model, num_warmup=25, num_runs=100)
    print(f"  • Mean Latency:       {latency_stats['mean_ms']:.2f} ms", flush=True)
    print(f"  • Median (P50):       {latency_stats['median_ms']:.2f} ms", flush=True)
    print(f"  • P90 Latency:        {latency_stats['p90_ms']:.2f} ms", flush=True)
    print(f"  • P95 Latency:        {latency_stats['p95_ms']:.2f} ms", flush=True)
    print(f"  • P99 Latency:        {latency_stats['p99_ms']:.2f} ms", flush=True)
    print(f"  • Min / Max Latency:  {latency_stats['min_ms']:.2f} ms / {latency_stats['max_ms']:.2f} ms", flush=True)
    print(f"  • Std Deviation:      {latency_stats['std_ms']:.2f} ms", flush=True)
    print(f"  • Single-Core FPS:    {latency_stats['fps_throughput']:.1f} inferences/sec", flush=True)
    
    # Peak Inference Memory
    inference_ram_mb = get_process_memory_mb()
    
    memory_profile = {
        'initial_process_ram_mb': float(initial_ram_mb),
        'peak_training_ram_mb': float(peak_train_ram_mb),
        'post_inference_ram_mb': float(inference_ram_mb),
        'model_parameters_count': int(num_params),
        'model_parameters_fp32_mb': float(model_param_mem_mb),
        'checkpoint_file_size_mb': float(checkpoint_file_size_mb)
    }
    
    print("\n" + "=" * 70, flush=True)
    print("MEMORY FOOTPRINT SUMMARY", flush=True)
    print("=" * 70, flush=True)
    print(f"  • Initial Process RAM:      {memory_profile['initial_process_ram_mb']:.2f} MB", flush=True)
    print(f"  • Peak Training RAM:        {memory_profile['peak_training_ram_mb']:.2f} MB", flush=True)
    print(f"  • Post-Inference RAM:       {memory_profile['post_inference_ram_mb']:.2f} MB", flush=True)
    print(f"  • Model Parameters (fp32):  {memory_profile['model_parameters_fp32_mb']:.2f} MB", flush=True)
    print(f"  • Checkpoint File on Disk:  {memory_profile['checkpoint_file_size_mb']:.2f} MB", flush=True)
    
    # Save full JSON report
    results_dir = root_dir / "research_results"
    results_dir.mkdir(parents=True, exist_ok=True)
    report_json_path = results_dir / "verifier_phase2_training_report.json"
    
    report_data = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "training_configuration": {
            "backbone": "MobileNetV3-Small",
            "pretrained": True,
            "input_resolution": "224x224x3",
            "cached_resolution": "256x256x3",
            "batch_size": 32,
            "learning_rate": learning_rate,
            "weight_decay": weight_decay,
            "num_epochs": num_epochs,
            "optimizer": "AdamW",
            "lr_scheduler": "CosineAnnealingLR (T_max=15, eta_min=1e-6)",
            "loss_function": "BCEWithLogitsLoss",
            "pos_weight": float(pos_weight_val),
            "train_samples": len(train_df),
            "train_positives": int((train_df['binary_target']==1).sum()),
            "train_negatives": int((train_df['binary_target']==0).sum()),
            "val_samples": len(val_df),
            "val_positives": int((val_df['binary_target']==1).sum()),
            "val_negatives": int((val_df['binary_target']==0).sum())
        },
        "training_history": training_history,
        "best_epoch": best_epoch,
        "total_training_loop_seconds": float(total_training_loop_time),
        "validation_metrics": {k: (v.tolist() if isinstance(v, np.ndarray) else v) for k, v in best_metrics.items() if k not in ['probs', 'labels', 'subcats', 'sample_ids']},
        "threshold_analysis": threshold_df.to_dict(orient='records'),
        "subcategory_analysis": subcat_summary,
        "cpu_latency_stats": latency_stats,
        "memory_profile": memory_profile,
        "total_elapsed_seconds": float(time.time() - start_time_all)
    }
    
    with open(report_json_path, "w", encoding="utf-8") as f:
        json.dump(report_data, f, indent=2)
    print(f"\n[OK] Phase 2 comprehensive report saved to: {report_json_path}", flush=True)
    
    # Save clean markdown report
    report_md_path = results_dir / "verifier_phase2_training_report.md"
    with open(report_md_path, "w", encoding="utf-8") as f:
        f.write("# Turmeric Leaf Verification Model (Stage-1 Verifier) — Phase 2 Training Report\n\n")
        f.write(f"**Date:** {time.strftime('%B %d, %Y %H:%M:%S')}  \n")
        f.write(f"**Architecture:** MobileNetV3-Small Binary Classifier  \n")
        f.write(f"**Training Status:** COMPLETE (Evaluated on local validation split; zero production integration)  \n\n")
        f.write("---\n\n")
        f.write("## 1. Training Configuration & Split Isolation\n\n")
        f.write(f"- **Backbone:** Pretrained `mobilenet_v3_small` with custom projection head (`Linear(576, 256) -> Hardswish -> Dropout(0.2) -> Linear(256, 1)`)\n")
        f.write(f"- **Input Shape:** $224 \\times 224 \\times 3$ (from $256 \\times 256$ in-memory cached base)\n")
        f.write(f"- **Loss Function:** `BCEWithLogitsLoss` with class weight `pos_weight = {pos_weight_val:.4f}` ($398/603$)\n")
        f.write(f"- **Optimizer:** AdamW ($lr=3\\times 10^{{-4}}$, weight decay = $1\\times 10^{{-4}}$)\n")
        f.write(f"- **LR Scheduler:** CosineAnnealingLR ($T_{{\\max}}=15, \\eta_{{\\min}}=1\\times 10^{{-6}}$)\n")
        f.write(f"- **Batch Size:** 32 | **Epochs:** {num_epochs}\n")
        f.write(f"- **Total Training Loop Runtime:** {total_training_loop_time:.2f}s ({total_training_loop_time/num_epochs:.2f}s/epoch)\n")
        f.write(f"- **Train Set:** {len(train_df)} samples (603 positive turmeric leaves, 398 negative controls)\n")
        f.write(f"- **Val Set:** {len(val_df)} samples (130 positive turmeric leaves, 103 negative controls)\n")
        f.write(f"- **Strict Split Isolation:**\n")
        f.write(f"  - `external_test` (200 frozen benchmark images): **UNTOUCHED / ISOLATED**\n")
        f.write(f"  - `external_reserve` (219 images): **UNTOUCHED / ISOLATED**\n")
        f.write(f"  - `external_edge_case` (203 dry leaf images): **UNTOUCHED / ISOLATED**\n\n")
        f.write("---\n\n")
        f.write("## 2. Validation Performance Metrics (Best Epoch: {})\n\n".format(best_epoch))
        f.write("| Metric | Value |\n")
        f.write("| :--- | :---: |\n")
        f.write(f"| **Validation Accuracy** | **{best_metrics['accuracy']*100:.2f}%** |\n")
        f.write(f"| **Balanced Accuracy** | **{best_metrics['balanced_accuracy']*100:.2f}%** |\n")
        f.write(f"| **Precision (Turmeric Leaf)** | **{best_metrics['precision']*100:.2f}%** |\n")
        f.write(f"| **Recall / Sensitivity (Turmeric Leaf)** | **{best_metrics['recall']*100:.2f}%** |\n")
        f.write(f"| **Specificity (Non-Turmeric Reject)** | **{best_metrics['specificity']*100:.2f}%** |\n")
        f.write(f"| **F1-Score** | **{best_metrics['f1']*100:.2f}%** |\n")
        f.write(f"| **ROC-AUC** | **{best_metrics['roc_auc']:.4f}** |\n")
        f.write(f"| **PR-AUC (Average Precision)** | **{best_metrics['pr_auc']:.4f}** |\n")
        f.write(f"| **Brier Score Loss** | **{best_metrics['brier_score']:.5f}** |\n\n")
        f.write("### Confusion Matrix (Default $\\tau = 0.50$, $N = 233$)\n\n")
        f.write("```\n")
        f.write("                       Predicted\n")
        f.write("                 Non-Turmeric (0)   Turmeric Leaf (1)    Total\n")
        f.write("Actual\n")
        f.write(f"Non-Turmeric (0)       {best_metrics['tn']:<18} {best_metrics['fp']:<20} {best_metrics['tn']+best_metrics['fp']}\n")
        f.write(f"Turmeric Leaf (1)      {best_metrics['fn']:<18} {best_metrics['tp']:<20} {best_metrics['fn']+best_metrics['tp']}\n")
        f.write("---------------------------------------------------------------\n")
        f.write(f"Total                  {best_metrics['tn']+best_metrics['fn']:<18} {best_metrics['fp']+best_metrics['tp']:<20} 233\n")
        f.write("```\n\n")
        f.write("---\n\n")
        f.write("## 3. Threshold Sensitivity Analysis\n\n")
        f.write(threshold_df.to_markdown(index=False))
        f.write("\n\n---\n\n")
        f.write("## 4. Subcategory Validation Performance\n\n")
        f.write(subcat_df.to_markdown(index=False))
        f.write("\n\n---\n\n")
        f.write("## 5. Computational Footprint & Latency Benchmarks\n\n")
        f.write("| Performance Dimension | Metric Value |\n")
        f.write("| :--- | :---: |\n")
        f.write(f"| **Model Parameters** | {num_params:,} ({num_params/1e6:.2f}M) |\n")
        f.write(f"| **Checkpoint Size on Disk** | {checkpoint_file_size_mb:.2f} MB |\n")
        f.write(f"| **Float32 Parameter Memory** | {model_param_mem_mb:.2f} MB |\n")
        f.write(f"| **Peak Process RAM (Training)** | {peak_train_ram_mb:.2f} MB |\n")
        f.write(f"| **Process RAM (Post-Inference)** | {inference_ram_mb:.2f} MB |\n")
        f.write(f"| **Mean CPU Latency (Batch=1)** | **{latency_stats['mean_ms']:.2f} ms** |\n")
        f.write(f"| **Median CPU Latency (P50)** | **{latency_stats['median_ms']:.2f} ms** |\n")
        f.write(f"| **P95 CPU Latency** | **{latency_stats['p95_ms']:.2f} ms** |\n")
        f.write(f"| **P99 CPU Latency** | **{latency_stats['p99_ms']:.2f} ms** |\n")
        f.write(f"| **Single-Core CPU Throughput** | **{latency_stats['fps_throughput']:.1f} FPS** |\n\n")
    print(f"[OK] Phase 2 markdown report saved to: {report_md_path}", flush=True)

if __name__ == "__main__":
    main()
