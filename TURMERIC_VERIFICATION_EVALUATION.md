# Evaluation Report: Stage-1 Turmeric Leaf Verification
**Project:** Curcuma AI  
**Model:** MobileNetV3-Small Binary Foliar Verifier  
**Evaluation Date:** September 24, 2026  
**Operating Threshold:** $\tau_{\text{verifier}} = 0.50$ (Calibrated on Validation Split)  

---

## 1. Validation Split Evaluation ($N = 233$)

The balanced tuning and threshold calibration split consists of:
- **Turmeric Foliage (Positive Class):** $N = 130$
- **Non-Turmeric Distractors / Controls (Negative Class):** $N = 103$
- **Total:** $N = 233$

| Metric | Target Goal | Evaluated Value | Status |
|---|:---:|:---:|:---:|
| **Validation Accuracy** | $\ge 98.0\%$ | **100.00%** | **PASS** |
| **Balanced Accuracy** | $\ge 98.0\%$ | **100.00%** | **PASS** |
| **Precision (Turmeric Leaf)** | $\ge 98.0\%$ | **100.00%** | **PASS** |
| **Recall / Sensitivity** | $\ge 98.0\%$ | **100.00%** | **PASS** |
| **Specificity (Rejection Rate)** | $\ge 98.0\%$ | **100.00%** | **PASS** |
| **F1-Score** | $\ge 0.98$ | **1.0000** | **PASS** |
| **ROC-AUC** | $\ge 0.99$ | **1.0000** | **PASS** |
| **PR-AUC (Average Precision)** | $\ge 0.99$ | **1.0000** | **PASS** |
| **Brier Score Loss** | $\le 0.05$ | **0.0000** | **PASS** |

### Validation Confusion Matrix ($\tau = 0.50$)

```
                       Predicted
                 Non-Turmeric (0)   Turmeric Leaf (1)    Total
Actual
Non-Turmeric (0)       103                0                    103
Turmeric Leaf (1)      0                  130                  130
---------------------------------------------------------------
Total                  103                130                  233
```

- **Validation False Acceptance Rate (FAR, Non-Turmeric $\to$ Accepted):** **0.00%** (0 / 103)
- **Validation False Rejection Rate (FRR, Turmeric $\to$ Rejected):** **0.00%** (0 / 130)

---

## 2. Stage-1 Internal Negative-Control Benchmark ($N = 10$)

A small held-out set of non-turmeric distractors within `internal_test` was evaluated to verify rejection behavior on baseline non-foliar distractors (dry soil, weeds, human hands, non-foliar objects):

- **Cohort Name:** `internal_negative_controls`
- **Total Samples ($N$):** 10
- **Composition:** 0 Turmeric Foliage, 10 Non-Turmeric Controls
- **Rejection Rate ($\tau = 0.50$):** **10/10 (100.0%)**
- **False Acceptance Rate (FAR):** **0/10 (0.0%)**
- **Downstream Invocations:** **0 (Zero)**

---

## 3. Stage-1 External Turmeric Acceptance Cohort ($N = 200$)

The `external_test` cohort consists exclusively of authentic turmeric foliage across distinct disease conditions:

- **Cohort Name:** `external_test`
- **Total Samples ($N$):** 200
- **Composition:**
  - Healthy Turmeric Foliage: $N = 100$
  - Blotch-Infected Turmeric Foliage: $N = 100$
  - Non-Turmeric Controls: **$N = 0$ (None)**
- **Purpose:** Evaluate whether authentic turmeric leaves (healthy and diseased) are correctly admitted by the Stage-1 verifier without false rejection.

### Evaluation Results ($\tau = 0.50$):
- **External Turmeric Acceptance Rate:** **200 / 200 (100.0%)**
- **False Rejection Rate (FRR):** **0 / 200 (0.0%)**
- **False Acceptance Rate (FAR) / Specificity:** **NOT ESTIMABLE** from this cohort because no non-turmeric negative samples are present in `external_test`.

> **Important Scientific Note:** This cohort measures **turmeric foliar admission fidelity (recall)** and must NOT be reported as a full binary classification accuracy benchmark.

---

## 4. Negative Benchmark Stress Testing (Separate Independent Cohorts)

Automated integration tests executed on distinct held-out negative benchmark sets produced the following rejection results:

| Benchmark Cohort | Sample Count ($N$) | Positive Count | Negative Count | Purpose | Verifier Score (Mean) | Rejection Rate ($\tau=0.50$) | Downstream Disease Invocations |
|---|:---:|:---:|:---:|---|:---:|:---:|:---:|
| **Human Portraits** | 20 | 0 | 20 | Facial/Skin Rejection | $0.0017$ | **100.0%** (20/20) | **0 (Zero)** |
| **Document / Paper UI** | 20 | 0 | 20 | Text/Paper Rejection | $0.0019$ | **100.0%** (20/20) | **0 (Zero)** |
| **Unrelated Objects / Tools** | 20 | 0 | 20 | Tool/Hardware Rejection | $0.0021$ | **100.0%** (20/20) | **0 (Zero)** |
| **Anime / Digital Cartoon** | 20 | 0 | 20 | Synthetic Art Rejection | $0.0003$ | **100.0%** (20/20) | **0 (Zero)** |
| **Non-Turmeric Botanical** | 20 | 0 | 20 | Weed / Banana Foliage | $0.0223$ | **100.0%** (20/20) | **0 (Zero)** |
| **Turmeric Underground Rhizomes** | 20 | 0 | 20 | Non-Foliar Turmeric Organ | $0.0005$ | **100.0%** (20/20) | **0 (Zero)** |

---

## 5. Latency & Resource Efficiency Benchmarks

- **Verifier-Only Rejection Latency:** $17.6 \pm 1.0\text{ ms}$ (CPU)
- **Full In-Domain 3-Stage Latency:** $166.5 \pm 5.4\text{ ms}$ (CPU)
- **Early Rejection Speedup:** **$9.46\times$ faster**
- **Memory Footprint Growth:** $+81.3\text{ MB RAM}$ (Total model memory in backend: $< 420\text{ MB}$)

---

## 6. Scientific Limitations

1. **Cohort Separation:** Metric reporting strictly separates positive acceptance cohorts from negative control benchmarks.
2. **Partial Leaf Boundaries:** Severe insect damage removing $> 70\%$ of the lamina may produce ambiguous verifier scores; users are prompted to retake a centered, well-lit specimen photo.
