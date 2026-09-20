"""
TurmeriCare AI - Backend API Service
====================================
FastAPI server providing server-side inference, input validation,
and health checks for Turmeric Pathology Disease Detection (Step 1).
"""

import os
import io
import sys
import time
from pathlib import Path
from typing import Dict, Any

# Ensure backend package directory is on sys.path for root-level and module-level execution
BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from fastapi import FastAPI, File, UploadFile, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image, UnidentifiedImageError

try:
    from backend.model import DiseaseInferenceEngine, CLASS_NAMES
except ImportError:
    from model import DiseaseInferenceEngine, CLASS_NAMES

# Locate checkpoints
BASE_DIR = Path(__file__).resolve().parent
CHECKPOINTS_DIR = BASE_DIR / "checkpoints"
MOBILENET_CHECKPOINT = CHECKPOINTS_DIR / "best_model.pth"
EFFICIENTNET_CHECKPOINT = CHECKPOINTS_DIR / "efficientnet_b0_best.pth"
OOD_STATS_CHECKPOINT = CHECKPOINTS_DIR / "ood_stats.pt"
CHECKPOINT_PATH = MOBILENET_CHECKPOINT  # Backward compatibility reference

# Initialize inference engine with verified checkpoints for Clean Hybrid Ensemble (alpha=0.50) + OOD Safeguard (tau_98=63.10)
engine = DiseaseInferenceEngine(
    mobilenet_checkpoint_path=str(MOBILENET_CHECKPOINT) if MOBILENET_CHECKPOINT.exists() else None,
    efficientnet_checkpoint_path=str(EFFICIENTNET_CHECKPOINT) if EFFICIENTNET_CHECKPOINT.exists() else None,
    ood_stats_path=str(OOD_STATS_CHECKPOINT) if OOD_STATS_CHECKPOINT.exists() else None,
    mode="hybrid",
    alpha=0.50,
    ood_threshold=63.10
)

app = FastAPI(
    title="TurmeriCare AI - Pathology Inference Service",
    description="Backend API for deep learning-based turmeric leaf disease classification with Mahalanobis OOD safeguard.",
    version="1.0.0"
)

# CORS configuration for frontend clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for seamless development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024  # 20 MB limit
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp", "image/jpg"}


@app.get("/api/health")
async def health_check() -> Dict[str, Any]:
    """Health check endpoint providing engine status and device information."""
    return {
        "status": "online",
        "service": "TurmeriCare AI Inference Service",
        "model_loaded": engine.is_loaded,
        "model_architecture": engine.model_name,
        "ood_safeguard_enabled": engine.ood_enabled,
        "ood_threshold": engine.ood_threshold,
        "device": str(engine.device),
        "target_classes": CLASS_NAMES,
        "timestamp": time.time()
    }


@app.get("/api/model-info")
async def model_info() -> Dict[str, Any]:
    """Provides active model metadata and class taxonomy."""
    return {
        "classes": CLASS_NAMES,
        "checkpoint_exists": MOBILENET_CHECKPOINT.exists() or EFFICIENTNET_CHECKPOINT.exists(),
        "checkpoint_path": str(EFFICIENTNET_CHECKPOINT) if EFFICIENTNET_CHECKPOINT.exists() else str(MOBILENET_CHECKPOINT),
        "mobilenet_loaded": engine.mobilenet_model is not None,
        "efficientnet_loaded": engine.efficientnet_model is not None,
        "ood_safeguard_loaded": engine.ood_enabled,
        "ood_threshold": engine.ood_threshold,
        "ood_method": "Mahalanobis Distance on EfficientNet-B0 Penultimate Embeddings (Ledoit-Wolf Regularized Safeguard)",
        "is_model_loaded": engine.is_loaded,
        "model_architecture": engine.model_name,
        "ensemble_alpha": engine.alpha,
        "input_resolution": "224x224",
        "normalization": {
            "mean": [0.485, 0.456, 0.406],
            "std": [0.229, 0.224, 0.225]
        }
    }


@app.post("/api/predict")
async def predict_disease(file: UploadFile = File(...)) -> Dict[str, Any]:
    """
    Inference endpoint for Turmeric Leaf Disease Detection.
    Accepts JPG/JPEG/PNG image file, validates content, and runs server-side model inference.
    """
    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No image file provided. Please upload a valid turmeric leaf image."
        )

    # Validate file extension
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Only JPG, JPEG, and PNG images are supported."
        )

    # Read bytes safely
    try:
        image_bytes = await file.read()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to read uploaded file contents."
        )

    # Size check
    if len(image_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty (0 bytes)."
        )

    if len(image_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Image size ({len(image_bytes) / (1024*1024):.1f} MB) exceeds maximum allowed limit of 20 MB."
        )

    # Corrupt / non-image validation with PIL
    try:
        with Image.open(io.BytesIO(image_bytes)) as pil_img:
            pil_img.verify()
    except (UnidentifiedImageError, Exception):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is corrupted or not a valid decodeable image."
        )

    # Perform inference
    try:
        result = engine.predict_image_bytes(image_bytes)
        result["filename"] = file.filename
        return result
    except Exception as e:
        # Avoid exposing raw server tracebacks to the client
        print(f"[Inference Error] {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing the leaf image tensor. Please verify image quality."
        )


if __name__ == "__main__":
    import uvicorn
    # Check if checkpoint exists and reload engine
    if CHECKPOINT_PATH.exists() and not engine.is_loaded:
        engine.load_checkpoint(str(CHECKPOINT_PATH))
    print("[TurmeriCare API] Starting server on http://localhost:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000)
