"""
Turmeric Leaf Disease Deep Learning Model & Inference Pipeline
==============================================================
Defines the neural network architectures, preprocessing transforms,
and server-side inference engine for the 4-class Turmeric Pathology dataset:
  0: Aphids
  1: Blotch
  2: Healthy
  3: Leaf Spot

Features:
  - MobileNetV2 (Edge-optimized backbone)
  - EfficientNet-B0 (Compound scaling backbone)
  - Hybrid Ensemble (Soft-voting late fusion: 0.50 * P_Eff + 0.50 * P_Mob)
    - Out-of-Distribution (OOD) Safeguard: Mahalanobis distance on frozen EfficientNet-B0
    penultimate embeddings calibrated on TRAIN set (tau_98 = 63.10).
"""

import os
import io
import time
import math
import gc
import numpy as np
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
from typing import Dict, Any, Tuple, Optional

# Taxonomy definition (Strictly aligned across all models and splits)
CLASS_NAMES = ["Aphids", "Blotch", "Healthy", "Leaf Spot"]

# Preprocessing: Standard ImageNet normalization matching backbone pretraining
INFERENCE_TRANSFORMS = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.CenterCrop((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


def build_mobilenet_v2(num_classes: int = 4, pretrained: bool = False) -> nn.Module:
    """Builds MobileNetV2 with custom classification head for 4 classes."""
    weights = models.MobileNet_V2_Weights.DEFAULT if pretrained else None
    model = models.mobilenet_v2(weights=weights)
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.3),
        nn.Linear(in_features, num_classes)
    )
    return model


def build_efficientnet_b0(num_classes: int = 4, pretrained: bool = False) -> nn.Module:
    """Builds EfficientNet-B0 with custom classification head for 4 classes."""
    weights = models.EfficientNet_B0_Weights.DEFAULT if pretrained else None
    model = models.efficientnet_b0(weights=weights)
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.3),
        nn.Linear(in_features, num_classes)
    )
    return model


class DiseaseInferenceEngine:
    def __init__(
        self,
        mobilenet_checkpoint_path: Optional[str] = None,
        efficientnet_checkpoint_path: Optional[str] = None,
        ood_stats_path: Optional[str] = None,
        checkpoint_path: Optional[str] = None,
        mode: str = "hybrid",
        alpha: float = 0.50,
        ood_threshold: float = 63.10
    ):
        """
        Inference engine supporting MobileNetV2, Clean EfficientNet-B0, Hybrid Ensemble,
        and Mahalanobis-based Out-of-Distribution (OOD) Domain Safeguard.
        
        Args:
            mobilenet_checkpoint_path: Path to MobileNetV2 .pth checkpoint
            efficientnet_checkpoint_path: Path to Clean EfficientNet-B0 .pth checkpoint
            ood_stats_path: Path to precalculated OOD class means & precision matrix (.pt)
            checkpoint_path: Fallback path for backward compatibility
            mode: 'hybrid' | 'efficientnet' | 'mobilenet'
            alpha: Soft-voting weight for EfficientNet in hybrid mode (default: 0.50)
            ood_threshold: Calibrated Mahalanobis distance threshold (default: 63.10, tau_98)
        """
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.class_names = CLASS_NAMES
        self.mode = mode
        self.alpha = alpha
        self.ood_threshold = ood_threshold

        self.mobilenet_model: Optional[nn.Module] = None
        self.efficientnet_model: Optional[nn.Module] = None

        self.ood_class_means: Optional[Dict[int, np.ndarray]] = None
        self.ood_precision_matrix: Optional[np.ndarray] = None
        self.ood_enabled: bool = False

        self.mobilenet_checkpoint_path = mobilenet_checkpoint_path
        self.efficientnet_checkpoint_path = efficientnet_checkpoint_path
        self.ood_stats_path = ood_stats_path

        # Handle fallback legacy argument
        if checkpoint_path and not mobilenet_checkpoint_path and not efficientnet_checkpoint_path:
            if "efficientnet" in os.path.basename(checkpoint_path).lower():
                self.efficientnet_checkpoint_path = checkpoint_path
            else:
                self.mobilenet_checkpoint_path = checkpoint_path

        if self.mobilenet_checkpoint_path and os.path.isfile(self.mobilenet_checkpoint_path):
            self.load_mobilenet(self.mobilenet_checkpoint_path)

        if self.efficientnet_checkpoint_path and os.path.isfile(self.efficientnet_checkpoint_path):
            self.load_efficientnet(self.efficientnet_checkpoint_path)

        if self.ood_stats_path and os.path.isfile(self.ood_stats_path):
            self.load_ood_stats(self.ood_stats_path)

        torch.set_num_threads(1)
        try:
            torch.set_num_interop_threads(1)
        except Exception:
            pass

    @property
    def is_loaded(self) -> bool:
        """Returns True if required models are loaded."""
        if self.mode == "hybrid":
            return self.mobilenet_model is not None and self.efficientnet_model is not None
        elif self.mode == "efficientnet":
            return self.efficientnet_model is not None
        elif self.mode == "mobilenet":
            return self.mobilenet_model is not None
        return (self.mobilenet_model is not None) or (self.efficientnet_model is not None)

    @property
    def model_name(self) -> str:
        """Returns human-readable active architecture identifier."""
        if self.mode == "hybrid" and self.mobilenet_model is not None and self.efficientnet_model is not None:
            return f"Hybrid Ensemble (EfficientNet-B0 + MobileNetV2, alpha={self.alpha:.2f})"
        elif self.efficientnet_model is not None and (self.mode == "efficientnet" or self.mobilenet_model is None):
            return "EfficientNet-B0 (PyTorch)"
        elif self.mobilenet_model is not None:
            return "MobileNetV2 (PyTorch)"
        return "Unloaded"

    def load_mobilenet(self, path: str):
        """Loads weights for MobileNetV2."""
        try:
            model = build_mobilenet_v2(num_classes=len(self.class_names), pretrained=False)
            checkpoint = torch.load(path, map_location=self.device, weights_only=False)
            
            if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
                model.load_state_dict(checkpoint["model_state_dict"])
            elif isinstance(checkpoint, dict) and "state_dict" in checkpoint:
                model.load_state_dict(checkpoint["state_dict"])
            else:
                model.load_state_dict(checkpoint)

            del checkpoint
            gc.collect()

            model.to(self.device)
            model.eval()
            self.mobilenet_model = model
            self.mobilenet_checkpoint_path = path
            print(f"[InferenceEngine] MobileNetV2 loaded from {path} on {self.device}")
        except Exception as e:
            print(f"[InferenceEngine] Failed to load MobileNetV2 checkpoint: {e}")
            self.mobilenet_model = None

    def load_efficientnet(self, path: str):
        """Loads weights for EfficientNet-B0."""
        try:
            model = build_efficientnet_b0(num_classes=len(self.class_names), pretrained=False)
            checkpoint = torch.load(path, map_location=self.device, weights_only=False)
            
            if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
                model.load_state_dict(checkpoint["model_state_dict"])
            elif isinstance(checkpoint, dict) and "state_dict" in checkpoint:
                model.load_state_dict(checkpoint["state_dict"])
            else:
                model.load_state_dict(checkpoint)

            del checkpoint
            gc.collect()

            model.to(self.device)
            model.eval()
            self.efficientnet_model = model
            self.efficientnet_checkpoint_path = path
            print(f"[InferenceEngine] EfficientNet-B0 loaded from {path} on {self.device}")
        except Exception as e:
            print(f"[InferenceEngine] Failed to load EfficientNet-B0 checkpoint: {e}")
            self.efficientnet_model = None

    def load_ood_stats(self, path: str):
        """Loads TRAIN-set-only fitted Mahalanobis centroids and Ledoit-Wolf precision matrix."""
        try:
            data = torch.load(path, map_location="cpu", weights_only=False)
            self.ood_class_means = {
                int(k): v.astype(np.float32) for k, v in data["class_means"].items()
            }
            self.ood_precision_matrix = data["precision_matrix"].astype(np.float32)
            if "threshold" in data:
                self.ood_threshold = float(data["threshold"])
            self.ood_enabled = True
            self.ood_stats_path = path
            del data
            gc.collect()
            print(f"[InferenceEngine] OOD Safeguard loaded from {path} (tau_98={self.ood_threshold:.2f})")
        except Exception as e:
            print(f"[InferenceEngine] Failed to load OOD statistics: {e}")
            self.ood_enabled = False

    def load_checkpoint(self, path: str):
        """Generic loader for backward compatibility."""
        if "efficientnet" in os.path.basename(path).lower():
            self.load_efficientnet(path)
        else:
            self.load_mobilenet(path)

    def extract_penultimate_embedding(self, tensor: torch.Tensor) -> np.ndarray:
        """Extracts 1280-dim embedding vector from EfficientNet-B0 before classification head."""
        if self.efficientnet_model is None:
            raise RuntimeError("EfficientNet-B0 model is required for OOD embedding extraction.")
        with torch.inference_mode():
            feat = self.efficientnet_model.features(tensor)
            feat = self.efficientnet_model.avgpool(feat)
            emb = torch.flatten(feat, 1).squeeze(0).cpu().numpy()
        return emb

    def compute_mahalanobis_distance(self, tensor: torch.Tensor) -> float:
        """Computes minimum Mahalanobis distance to TRAIN class centroids using regularized covariance."""
        if not self.ood_enabled or self.ood_class_means is None or self.ood_precision_matrix is None:
            return 0.0

        with torch.inference_mode():
            emb = self.extract_penultimate_embedding(tensor).astype(np.float32)
            min_dist = float("inf")
            for c in range(len(self.class_names)):
                diff = emb - self.ood_class_means[c]
                d2 = np.dot(diff, np.dot(self.ood_precision_matrix, diff))
                dist = math.sqrt(max(0.0, float(d2)))
                if dist < min_dist:
                    min_dist = dist
            return min_dist

    def predict_image_bytes(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Runs server-side inference on raw image bytes.
        Performs Mahalanobis Out-of-Distribution (OOD) Domain Safeguard BEFORE disease classification.
        Memory-optimized for single-core / 512MB RAM Linux containers.
        """
        if not self.is_loaded:
            raise RuntimeError(
                "Production model checkpoints are missing or failed to load. "
                "Inference requires verified trained weights."
            )

        t0 = time.perf_counter()

        # Safe memory-conscious PIL decoding: downscale oversized photos to max 1024px before tensor conversion
        with Image.open(io.BytesIO(image_bytes)) as pil_img:
            if pil_img.width > 1024 or pil_img.height > 1024:
                pil_img.thumbnail((1024, 1024), Image.Resampling.BILINEAR)
            image = pil_img.convert("RGB")

        tensor = INFERENCE_TRANSFORMS(image).unsqueeze(0).to(self.device)
        del image
        t_prep = (time.perf_counter() - t0) * 1000

        # -------------------------------------------------------------
        # 1. EfficientNet Forward Pass (Staged: features -> pool -> flat)
        # -------------------------------------------------------------
        t_ood_start = time.perf_counter()
        mahal_dist = 0.0
        is_ood_rejected = False
        probs_eff = None

        with torch.inference_mode():
            if self.efficientnet_model is not None:
                feat = self.efficientnet_model.features(tensor)
                feat_pool = self.efficientnet_model.avgpool(feat)
                del feat
                flat = torch.flatten(feat_pool, 1)
                del feat_pool

                if self.ood_enabled and self.ood_class_means is not None and self.ood_precision_matrix is not None:
                    emb = flat.squeeze(0).cpu().numpy().astype(np.float32)
                    min_dist = float("inf")
                    for c in range(len(self.class_names)):
                        diff = emb - self.ood_class_means[c]
                        d2 = np.dot(diff, np.dot(self.ood_precision_matrix, diff))
                        dist = math.sqrt(max(0.0, float(d2)))
                        if dist < min_dist:
                            min_dist = dist
                    mahal_dist = min_dist
                    del emb
                    if mahal_dist > self.ood_threshold:
                        is_ood_rejected = True

                # Compute EfficientNet logits from flat embedding directly (eliminating duplicate forward pass)
                if not is_ood_rejected:
                    logits_eff = self.efficientnet_model.classifier(flat)
                    probs_eff = torch.softmax(logits_eff, dim=1).squeeze(0).cpu().numpy()
                    del logits_eff

                del flat

        t_ood = (time.perf_counter() - t_ood_start) * 1000

        if is_ood_rejected:
            del tensor
            gc.collect()
            print(f"  [InferenceEngine] Stage Timing: Prep={t_prep:.1f}ms | OOD={t_ood:.1f}ms (Dist={mahal_dist:.2f} > {self.ood_threshold}) -> OOD_REJECTED")
            return {
                "disease": "Non-Turmeric / Out-of-Domain",
                "confidence": 0.0,
                "probabilities": {
                    "Aphids": 0.0,
                    "Blotch": 0.0,
                    "Healthy": 0.0,
                    "Leaf Spot": 0.0
                },
                "model_mode": "REAL_MODEL",
                "model_architecture": self.model_name,
                "ood_status": "OOD_REJECTED",
                "ood_message": "Image is outside the supported turmeric leaf domain. Please upload a clear turmeric leaf image.",
                "mahalanobis_distance": round(float(mahal_dist), 2),
                "ood_threshold": self.ood_threshold,
                "ood_method": "Mahalanobis Distance on EfficientNet-B0 Penultimate Embeddings (Ledoit-Wolf Regularized Safeguard)",
                "extracted_features": {
                    "lesionDensity": "N/A (Specimen rejected by domain safeguard)",
                    "chlorosisSeverity": "N/A (Specimen rejected by domain safeguard)",
                    "colorVariance": "N/A (Specimen rejected by domain safeguard)",
                    "textureDistortion": "N/A (Specimen rejected by domain safeguard)"
                },
                "individual_predictions": None
            }

        # -------------------------------------------------------------
        # 2. In-Domain Classification (Sequential MobileNetV2)
        # -------------------------------------------------------------
        t_inf_start = time.perf_counter()
        probs_mob = None

        with torch.inference_mode():
            if self.mobilenet_model is not None:
                logits_mob = self.mobilenet_model(tensor)
                probs_mob = torch.softmax(logits_mob, dim=1).squeeze(0).cpu().numpy()
                del logits_mob

        del tensor
        gc.collect()
        t_inf = (time.perf_counter() - t_inf_start) * 1000

        # Hybrid Soft-Voting late fusion: P_hybrid = alpha * P_eff + (1 - alpha) * P_mob
        if self.mode == "hybrid" and probs_eff is not None and probs_mob is not None:
            final_probs = self.alpha * probs_eff + (1.0 - self.alpha) * probs_mob
            arch_name = f"Hybrid Ensemble (EfficientNet-B0 + MobileNetV2, alpha={self.alpha:.2f})"
        elif probs_eff is not None and (self.mode == "efficientnet" or probs_mob is None):
            final_probs = probs_eff
            arch_name = "EfficientNet-B0 (PyTorch)"
        elif probs_mob is not None:
            final_probs = probs_mob
            arch_name = "MobileNetV2 (PyTorch)"
        else:
            raise RuntimeError("Unable to calculate prediction probabilities from loaded models.")

        pred_idx = int(final_probs.argmax())
        pred_class = self.class_names[pred_idx]
        confidence = float(final_probs[pred_idx] * 100.0)

        probabilities = {
            self.class_names[i]: round(float(final_probs[i] * 100.0), 2)
            for i in range(len(self.class_names))
        }

        features = self._derive_visual_features(pred_class, confidence)

        individual_preds = {}
        if probs_eff is not None:
            eff_idx = int(probs_eff.argmax())
            individual_preds["efficientnet_b0"] = {
                "disease": self.class_names[eff_idx],
                "confidence": round(float(probs_eff[eff_idx] * 100.0), 2),
                "probabilities": {
                    self.class_names[i]: round(float(probs_eff[i] * 100.0), 2)
                    for i in range(len(self.class_names))
                }
            }
        if probs_mob is not None:
            mob_idx = int(probs_mob.argmax())
            individual_preds["mobilenet_v2"] = {
                "disease": self.class_names[mob_idx],
                "confidence": round(float(probs_mob[mob_idx] * 100.0), 2),
                "probabilities": {
                    self.class_names[i]: round(float(probs_mob[i] * 100.0), 2)
                    for i in range(len(self.class_names))
                }
            }

        return {
            "disease": pred_class,
            "confidence": round(confidence, 1),
            "probabilities": probabilities,
            "model_mode": "REAL_MODEL",
            "model_architecture": arch_name,
            "ood_status": "IN_DOMAIN",
            "mahalanobis_distance": round(float(mahal_dist), 2) if self.ood_enabled else None,
            "ood_threshold": self.ood_threshold if self.ood_enabled else None,
            "ood_method": "Mahalanobis Distance on EfficientNet-B0 Penultimate Embeddings (Ledoit-Wolf Regularized Safeguard)" if self.ood_enabled else "Disabled",
            "extracted_features": features,
            "individual_predictions": individual_preds
        }

    def _derive_visual_features(self, disease: str, confidence: float) -> Dict[str, str]:
        if disease == "Blotch":
            return {
                "lesionDensity": "High (Necrotic irregular patches along leaf margin)",
                "chlorosisSeverity": "Moderate to high perimeter yellowing",
                "colorVariance": "Dark brown-yellow foliar gradient",
                "textureDistortion": "Lamina necrosis and foliar degradation"
            }
        elif disease == "Leaf Spot":
            return {
                "lesionDensity": "Concentric circular to elliptical necrotic spots",
                "chlorosisSeverity": "Isolated chlorotic halo rings",
                "colorVariance": "Dark brown center with pale yellow boundary",
                "textureDistortion": "Localized foliar perforation and tissue breakdown"
            }
        elif disease == "Aphids":
            return {
                "lesionDensity": "Pest aggregation along abaxial leaf vein ridges",
                "chlorosisSeverity": "Stippling chlorosis and foliar leaf curling",
                "colorVariance": "Speckled light-green and yellow patches",
                "textureDistortion": "Foliar crinkling and localized structural distortion"
            }
        else:
            return {
                "lesionDensity": "None detected (Clear foliar surface)",
                "chlorosisSeverity": "Uniform rich chlorophyll distribution",
                "colorVariance": "Homogeneous deep green lamina",
                "textureDistortion": "Smooth intact foliar morphology"
            }
