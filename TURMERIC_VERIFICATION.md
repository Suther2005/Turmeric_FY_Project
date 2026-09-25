# Stage-1 Turmeric Leaf Verification Architecture & Pipeline Specification
**Project:** TurmeriCare AI / Curcuma AI  
**Module:** Stage-1 Botanical Foliar Verification Gate  
**Model Architecture:** MobileNetV3-Small (Binary Classifier)  
**Checkpoint Path:** `backend/checkpoints/turmeric_leaf_verifier_mobilenetv3.pth`  

---

## 1. Conceptual Role & Pipeline Boundaries

In real-world deployment, farmers capture images under variable field illumination, complex backgrounds, and varying crop conditions. Without an upfront verification layer, users may accidentally upload unrelated images (e.g. soil, hands, weeds, other crops, document scans), causing a closed-set 4-class disease classifier to produce arbitrary high-confidence false diagnoses.

### Conceptual Hierarchy

| Layer | Question Being Answered | Mechanism | Output / Action |
|---|---|---|---|
| **Stage 1: Botanical Foliar Verifier** | *"Does this image contain / represent a single clear turmeric leaf specimen?"* | MobileNetV3-Small Binary Classifier ($\tau = 0.50$) | Pass $\to$ Stage 2<br>Fail $\to$ Halt immediately |
| **Stage 2: Mahalanobis OOD Safeguard** | *"Is this foliar image within the known training feature distribution?"* | Minimum Mahalanobis distance on EfficientNet-B0 penultimate features ($\tau = 63.10$) | Pass $\to$ Stage 3<br>Fail $\to$ Reject as Out-of-Domain |
| **Stage 3: Pathology Ensemble** | *"Which of the 4 target pathology classes does this leaf exhibit?"* | Equal-weighted Late-Fusion Soft Voting: $0.50 \cdot P_{\text{EffB0}} + 0.50 \cdot P_{\text{MobV2}}$ | Diagnosis (*Aphids*, *Blotch*, *Healthy*, *Leaf Spot*) |

---

## 2. Model Architecture

The Stage-1 Verifier employs a lightweight **MobileNetV3-Small** backbone optimized for minimal parameter count and rapid execution (~17.5 ms on CPU):

```
Input Image Tensor: (3, 224, 224)
        │
        ▼
MobileNetV3-Small Feature Extractor (Frozen stem & inverted residual blocks)
        │
        ▼
Adaptive Average Pooling: (576-dimensional vector)
        │
        ▼
Custom Projection Classification Head:
  ├── Linear(576, 256)
  ├── Hardswish Activation
  ├── Dropout(p = 0.20)
  └── Linear(256, 1)  -> Raw Logit (Scalar)
        │
        ▼
Sigmoid Function -> Probability Score p ∈ [0.0, 1.0]
```

---

## 3. Threshold Calibration & Decision Boundary

- **Decision Rule:**
  $$\text{Decision} = \begin{cases} \text{VERIFIED\_TURMERIC\_LEAF}, & \text{if } \sigma(\text{logit}) \ge 0.50 \\ \text{VERIFICATION\_FAILED}, & \text{if } \sigma(\text{logit}) < 0.50 \end{cases}$$
- **Threshold Calibration Source:** Evaluated on the held-out validation cohort ($N = 233$, 130 positive, 103 negative controls). The threshold $\tau = 0.50$ was selected strictly from the validation set without test-set contamination.

---

## 4. Short-Circuit Execution & Latency Profile

When Stage 1 detects a non-foliar or invalid image, the backend immediately halts and returns a structured rejection payload:

```json
{
  "disease": "Unverified / Low Foliar Confidence",
  "confidence": 0.0,
  "probabilities": {
    "Aphids": 0.0,
    "Blotch": 0.0,
    "Healthy": 0.0,
    "Leaf Spot": 0.0
  },
  "verification_status": "VERIFICATION_FAILED",
  "verifier_score": 0.0017,
  "verifier_threshold": 0.50,
  "ood_status": "VERIFIER_REJECTED",
  "ood_message": "Clear Turmeric Leaf Required: Image could not be verified as a clear turmeric leaf."
}
```

### Latency Benchmarks (CPU Execution)
- **Full 3-Stage Pipeline (In-Domain Leaf):** $166.5 \pm 5.4\text{ ms}$
- **Short-Circuit Rejection (Non-Foliar / Negative):** $17.6 \pm 1.0\text{ ms}$
- **Speedup on Invalid Inputs:** **$9.46\times$ Faster** than evaluating the complete ensemble.
