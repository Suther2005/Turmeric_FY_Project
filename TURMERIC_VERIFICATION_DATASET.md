# Dataset Specification: Stage-1 Turmeric Leaf Verification
**Project:** TurmeriCare AI / Curcuma AI  
**Dataset Reference:** `turmeric_verification` / `turmeric_datasets`  
**Purpose:** Binary classification of single clear turmeric foliar specimens versus non-foliar / non-turmeric controls.  

---

## 1. Dataset Taxonomy & Class Composition

To ensure reliable Stage-1 foliar gating, the verification training dataset comprises strictly balanced positive turmeric leaves and diverse negative controls:

| Split | Positive Turmeric Leaf ($y=1$) | Negative Controls ($y=0$) | Total Samples | Split Proportion |
|---|:---:|:---:|:---:|:---:|
| **Train Split** | 603 | 398 | **1,001** | ~70.0% |
| **Validation Split** | 130 | 103 | **233** | ~16.3% |
| **Held-Out Test Split** | 129 | 71 | **200** | ~13.7% |
| **Total Cohort** | **862** | **572** | **1,434** | **100.0%** |

---

## 2. Positive Sample Criteria ($y=1$)

Positive samples satisfy the following botanical and photographic conditions:
1. **Turmeric Botanical Integrity:** Authentic foliage of *Curcuma longa* L.
2. **Pathology Distribution:** Balanced representation across:
   - Healthy turmeric leaves ($N = 215$ in train)
   - Leaf Spot (*Colletotrichum capsici*, $N = 142$ in train)
   - Leaf Blotch (*Taphrina maculans*, $N = 126$ in train)
   - Aphid Infestation (*Pentalonia nigronervosa*, $N = 120$ in train)
3. **Capture Variations:** Realistic field lighting, morning and midday angles, partial foliage with intact lamina, and varied soil/mulch background conditions.

---

## 3. Negative Sample Controls ($y=0$)

Negative samples encompass 5 primary visual and semantic failure modes:
1. **Non-Turmeric Botanical:** Alternate crop foliage (banana, mango, ginger, weeds, grass).
2. **Subterranean Plant Organs:** Harvested turmeric rhizomes and roots without foliage.
3. **Environmental / Background:** Soil surface, mulch beds, irrigation equipment, farm tools.
4. **Human & Object Distractors:** Hands holding tools, farmer portraits, fabric, clothing.
5. **Document & Digital UI:** Paper reports, field note sheets, screenshot graphics.

---

## 4. Preprocessing & Data Augmentation Pipeline

- **Inference Preprocessing:**
  $$\text{Input Image} \xrightarrow{\text{Resize}(256, 256)} \xrightarrow{\text{CenterCrop}(224, 224)} \xrightarrow{\text{ToTensor}()} \xrightarrow{\text{ImageNet Normalize}}$$
- **Training Augmentation:**
  - Random Horizontal Flip ($p = 0.5$)
  - Random Rotation ($\pm 15^\circ$)
  - Color Jitter (Brightness 0.15, Contrast 0.15, Saturation 0.10)
  - Random Affine (Translation $\pm 5\%$, Scale 0.95–1.05)

---

## 5. Strict Data Isolation & Zero Data Leakage

- **Zero Test Contamination:** No validation or held-out test images were included in the training manifest or used for gradient updates.
- **Model Checkpoint Isolation:** Checkpoint `turmeric_leaf_verifier_mobilenetv3.pth` was saved based strictly on minimum validation loss (`BCEWithLogitsLoss`) at Epoch 3.
