# Sources Documentation
## Turmeric Leaf Disease Dataset Collection
**Date of Search:** 2026-09-06
**Researcher:** Data Collection Agent (Antigravity AI)
**Purpose:** CSE Final Year Deep Learning Research Project - Turmeric Leaf Disease Detection

---

## DATASET 01

```
Dataset:         Image Dataset for Turmeric Plant Leaf Disease Detection
Repository:      Mendeley Data
Dataset URL:     https://data.mendeley.com/datasets/jtttfbx342
Dataset DOI:     10.17632/jtttfbx342.2
Associated paper: Smartphone image dataset for turmeric plant leaf disease from Bangladesh spice fields
Paper URL:       https://www.ncbi.nlm.nih.gov/pmc/ (exact PMC link requires search by title in Data in Brief journal)
Paper journal:   Data in Brief (Elsevier), published 2025
DOI:             10.17632/jtttfbx342.2 (dataset DOI; paper DOI not confirmed independently)
License:         CC BY 4.0
Authors:         Hossain Md Riyad; Rashid Mohammad Rifat Ahmmad; Jahangir Tasfia binte;
                 Hossain Md. Samir; Rahman Md. Mahamudur; Gani Raiyan; Ahmed Jubaer;
                 Islam Raihan Ul; Khan M. Saddam Hossain
Publication date: Version 1: January 2, 2025 | Version 2: June 11, 2025

Original image count: 865
  - Aphids Disease: 221 images
  - Blotch: 238 images
  - Leaf Spot: 193 images
  - Healthy Leaf: 213 images

Augmented image count: 3,496
  - Aphids Disease (augmented): 847 images
  - Blotch (augmented): 909 images
  - Leaf Spot (augmented): 919 images
  - Healthy Leaf (augmented): 821 images

Total published images: 4,361 (865 original + 3,496 augmented)

Classes (4 total):
  1. Aphids Disease
  2. Blotch
  3. Leaf Spot
  4. Healthy Leaf

Collection location: Pabna district, Bangladesh (spice fields)
Collection conditions: Outdoor field conditions; smartphone photography
Camera/device: Smartphone (specific model not reported)
Field data: YES - collected from actual spice farming fields
Annotation type: Image classification (folder-label format)
Bounding boxes: No
Segmentation masks: No
Severity labels: Not reported
Severity scheme: Not reported

Notes:
- This is the primary Bangladesh spice field dataset for turmeric leaf diseases.
- The dataset explicitly separates original images (865) from augmented images (3,496).
- The Kaggle dataset 'dis_tur' by user 'yuvrajsalve' appears to be a repackaged mirror
  of this dataset. Researchers should use the original Mendeley source.
- Confirmed via direct reading of Mendeley dataset page metadata (HTML meta tags).
- Version 2 (June 2025) is the current latest version.
```

---

## DATASET 02

```
Dataset:         Turmeric Plant Disease Dataset: Advancing AI for Agricultural Sustainability
Repository:      Mendeley Data
Dataset URL:     https://data.mendeley.com/datasets/g46dvrcvwn
Dataset DOI:     10.17632/g46dvrcvwn.2
Associated paper: Referenced in multiple PMC papers as used for inception-v3 and other models (2025)
Paper URL:       Not independently confirmed; ResearchGate references cite this dataset
Paper journal:   Not confirmed
DOI:             10.17632/g46dvrcvwn.2 (dataset DOI)
License:         CC BY 4.0 (standard Mendeley)
Authors:         Not confirmed from public sources; ResearchGate links indicate Bangladeshi institution
Publication date: January 29, 2025

Original image count: 1,063
Augmented image count: 4,548
Total published images: 5,611 (1,063 original + 4,548 augmented)

Classes (5 total):
  1. Healthy Leaf
  2. Dry Leaf
  3. Leaf Blotch
  4. Rhizome Disease Roots
  5. Rhizome Healthy Roots

Collection location: Charpolisha area, Jamalpur region, Bangladesh (plantation conditions)
Collection conditions: Outdoor plantation conditions
Camera/device: Not reported
Field data: PROBABLE - referenced as plantation collection; researcher verification required
Annotation type: Image classification (folder-label format)
Bounding boxes: No
Segmentation masks: No
Severity labels: Not reported
Severity scheme: Not reported

IMPORTANT NOTE: Per-class original image counts are NOT reported in publicly available metadata.
Per-class augmented image counts are NOT reported in publicly available metadata.
DO NOT fabricate these numbers.

Notes:
- Broader scope than Dataset 01: covers both leaf diseases AND rhizome conditions.
- The 'Leaf Blotch' class in this dataset should NOT be assumed to be identical to 'Blotch' in
  Dataset 01 without botanical/pathological verification from the original authors.
- Rhizome disease classes are unique to this dataset among confirmed publicly available datasets.
- Different collection location from Dataset 01 (Jamalpur/Charpolisha vs Pabna).
- However, both are in Bangladesh - visual independence requires hash-level verification.
```

---

## DATASET 03 (REJECTED)

```
Dataset:         dis_tur - Image Dataset for Turmeric Plant Leaf Disease Detection
Repository:      Kaggle
Dataset URL:     https://www.kaggle.com/datasets/yuvrajsalve/dis-tur
Associated paper: None provided by uploader
Paper URL:       Not reported
DOI:             Not reported
License:         Not verified (Kaggle uploader has not specified)
Uploader:        yuvrajsalve (Kaggle username)
Publication date: Not reported

Original image count: Not reported (uploader has not documented this)
Augmented image count: Not reported

Classes: Aphids Disease, Blotch, Leaf Spot, Healthy Leaf
(Identical to Mendeley Dataset 01 classes)

Collection location: Not reported by uploader
Collection conditions: Not reported by uploader
Camera/device: Not reported
Field data: NOT VERIFIED
Annotation type: Image classification (folder-label format)
Bounding boxes: No
Segmentation masks: No
Severity labels: Not reported

REJECTION REASON:
This dataset is very likely a repackaged mirror of Mendeley Dataset 01 (jtttfbx342).
Evidence: identical class names and directory structure reported, no independent
provenance documented, no original paper or DOI provided by Kaggle uploader.
DO NOT USE as independent data. If you need this data, download directly from
Mendeley (DOI: 10.17632/jtttfbx342.2) which is the verified original source.
```

---

## DATASET 04 (REJECTED)

```
Dataset:         Turmeric_disease Object Detection Dataset
Repository:      Roboflow Universe
Dataset URL:     https://universe.roboflow.com/turmeric-leaf-disease/turmeric_disease
Associated paper: None reported
Paper URL:       Not reported
DOI:             Not reported
License:         CC BY 4.0 (stated on Roboflow platform)
Workspace/project: turmeric-leaf-disease / turmeric_disease
Publication date: Updated March 2025

Image count: Approximately 25 images (per search result reference - NOT independently verified;
            requires direct platform access for exact count)

Classes: leaf, dry_leaf
(These class names do NOT correspond to disease names used in other confirmed datasets)

Collection location: Not reported
Collection conditions: Not reported
Camera/device: Not reported
Field data: NOT VERIFIED - no collection methodology documented
Annotation type: Object detection (bounding boxes - YOLO/COCO/VOC export formats available)
Bounding boxes: Yes
Segmentation masks: No
Severity labels: Not reported

REJECTION REASON:
(1) Very small image count (~25 images is insufficient for research-grade training or validation).
(2) No associated paper or DOI.
(3) No documented collection provenance.
(4) Class labels ('leaf', 'dry_leaf') do not map to standard turmeric disease terminology.
(5) Cannot determine if images were independently collected.
PARTIAL VALUE: The bounding box annotation format is a feature not present in Mendeley datasets.
However, the tiny size and lack of provenance make it unsuitable as a primary research dataset.
```

---

## SEARCH METHODOLOGY

Platforms searched:
- Mendeley Data (data.mendeley.com)
- Kaggle (kaggle.com)
- Zenodo (zenodo.org) - No dedicated turmeric disease dataset found
- Figshare (figshare.com) - No confirmed dedicated turmeric disease dataset found
- IEEE DataPort (ieee.org) - No confirmed dedicated turmeric disease dataset found
- Roboflow Universe (universe.roboflow.com)
- PubMed / PMC (pubmed.ncbi.nlm.nih.gov; ncbi.nlm.nih.gov/pmc)
- ResearchGate
- Google Scholar (via search_web)
- Direct paper reading via read_url_content

Search terms used:
- turmeric leaf disease dataset Mendeley Data Kaggle Zenodo download
- Curcuma longa disease dataset images plant disease detection
- turmeric plant disease detection dataset deep learning research paper
- turmeric leaf disease dataset Zenodo DOI site:zenodo.org
- turmeric disease dataset figshare.com OR ieee.org OR dataport download
- turmeric leaf disease field smartphone images outdoor farm dataset research paper 2022 2023 2024
- turmeric aphid blotch leaf spot dataset zenodo OR figshare OR google drive download link paper
- site:kaggle.com turmeric disease leaf dataset images download
- turmeric leaf disease detection dataset 1063 images mendeley DOI dry leaf leaf blotch rhizome
- turmeric disease dataset Pabna OR Bangladesh spice smartphone collection paper 2024 2025 mendeley
- pubmed turmeric leaf disease detection dataset image collection smartphone collected 2023 2024 2025
- turmeric rhizome rot leaf disease dataset India OR Kerala OR Karnataka OR Tamil Nadu download open access
- turmeric disease detection YOLOv annotation bounding box mendeley roboflow download 2024 2025

Note on Zenodo, Figshare, IEEE DataPort:
No confirmed, dedicated turmeric leaf disease datasets were found on these platforms.
Search results consistently redirected to Mendeley Data and Kaggle for this specific crop.
This does NOT mean they do not exist - a manual search by the researcher on these platforms
is recommended using the search terms listed above.

---

## DOWNLOAD INSTRUCTIONS

### Dataset 01 - Mendeley (jtttfbx342)
1. Navigate to: https://data.mendeley.com/datasets/jtttfbx342
2. Click "Download All" or select individual files
3. No registration required for CC BY 4.0 datasets on Mendeley
4. Save to: D:\curuma\turmeric_datasets\dataset_01\
5. Do NOT rename, resize, preprocess, or augment before researcher inspection.

### Dataset 02 - Mendeley (g46dvrcvwn)
1. Navigate to: https://data.mendeley.com/datasets/g46dvrcvwn
2. Click "Download All" or select individual files
3. No registration required for CC BY 4.0 datasets on Mendeley
4. Save to: D:\curuma\turmeric_datasets\dataset_02\
5. Do NOT rename, resize, preprocess, or augment before researcher inspection.

### Automated Download (Optional - Python)
See dataset_01/ and dataset_02/ folders for download_instructions.txt files.
Mendeley direct download links require authentication via browser session for large files.
Manual download from the Mendeley web interface is the most reliable method.

---

*This documentation was generated by an automated data collection agent on 2026-09-06.*
*All metadata is sourced from official repository pages, research papers, and verified web sources.*
*No metadata has been fabricated. Where information was not available, "Not reported" is stated.*
*Final dataset selection for research use requires human researcher verification.*
