# BioTwin Omni: Dynamic Patient Digital Twin Platform
### Submission for Happiest Health Digital Twin Challenge 2026 (Unstop)

[![Status](https://img.shields.io/badge/Competition-Happiest%20Health%202026-blue.svg)](https://unstop.com/hackathons/crp-digital-twin-challenge-2026-happiest-health-1757873)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Architecture](https://img.shields.io/badge/Architecture-6--Layer%20Multi--Agent-purple.svg)](#system-architecture)
[![IoT Streaming](https://img.shields.io/badge/IoT%20Telemetry-1%20Hz%20WebSocket%20%2B%20CEP-cyan.svg)](#iot-wearable-telemetry)

---

## 🏆 Project Overview

**BioTwin Omni** directly answers the core challenge of the **Happiest Health Digital Twin Challenge 2026**:
> *"Build a Proof-of-Concept (PoC) Digital Twin model that acts as a dynamic, virtual replica of a patient, integrating real-time data from wearables with Electronic Health Records (EHR) to predict adverse health events and personalize treatment protocols."*

By synthesizing **high-frequency IoT/wearable vital streaming**, **physics-informed cardiovascular hemodynamics**, **multi-agent clinical AI consensus**, and **human-in-the-loop steering**, BioTwin Omni creates a living, predictive virtual replica of a patient that forecasts clinical crises **hours before they occur** and projects personalized "what-if" treatment trajectories.

---

## 🔬 System Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 CLINICIAN COMMAND CENTER                               │
│        (Live Vitals Waveform • 4-Organ Holographic Twin • What-If Simulator • HITL)    │
└─────────────────────────────────────────▲──────────────────────────────────────────────┘
                                          │ WebSockets / REST
┌─────────────────────────────────────────┴──────────────────────────────────────────────┐
│                    LAYER 1: DYNAMIC DIGITAL TWIN & REAL-TIME STATE ENGINE              │
│   • Fuses Static EHR (Genomics, Chronic History, Rx) with Continuous Biosensor Streams │
│   • Physics-Informed Hemodynamics: Mean Arterial Pressure (MAP), Pulse Pressure,       │
│     Shock Index (HR/SBP), Rate Pressure Product, Cardiac Workload & Stress             │
└─────────────────────────────────────────▲──────────────────────────────────────────────┘
                                          │
            ┌─────────────────────────────┴─────────────────────────────┐
            ▼                                                           ▼
┌───────────────────────────────────────────┐ ┌───────────────────────────────────────────┐
│     LAYER 2: ADVERSE EVENT PREDICTOR      │ │   LAYER 3: MULTI-AGENT CLINICAL BOARD     │
│ • Impending Cardiac Arrest (10-25m ETA)   │ │ • Cardiologist Agent                      │
│ • Septic Shock Deterioration & SIRS       │ │ • Endocrinologist Agent                   │
│ • Hypertensive Emergency & Stroke Risk    │ │ • Pharmacologist Agent (PharmGKB / CPIC)  │
│ • Acute Hypoxemic Desaturation            │ │ • Health Economist Agent                  │
│ • Complex Event Processing (CEP) Alarms   │ │ • Emergency Sub-Agent Swarming (HITL)     │
└───────────────────────────────────────────┘ └───────────────────────────────────────────┘
            ▲                                                           ▲
            │                                                           │
┌───────────┴───────────────────────────────┐ ┌─────────────────────────┴─────────────────┐
│       LAYER 4: IOT TELEMETRY STREAMER     │ │   LAYER 5: WORLD MODELS RESEARCH BASE     │
│ • High-frequency biosensor generator      │ │ • Cellular-to-organ physiological models  │
│ • 4 Clinical Crisis Demonstration Tracks  │ │ • Grounded in peer-reviewed clinical      │
│ • Telemetry History & Anomaly Buffer      │ │   literature & World Models benchmarks    │
└───────────────────────────────────────────┘ └───────────────────────────────────────────┘
```

---

## 🚀 Key Innovations & Competition Deliverables

### 1. Hybrid Fusion Digital Twin
Most healthcare AI models analyze either static historical charts or raw numbers in isolation. BioTwin Omni fuses **multi-omic static baseline records** (demographics, pharmacogenomics CYP2C19/CYP2D6, allergies, chronic conditions) with **1 Hz real-time biosensor streams** (Heart Rate, Arterial BP, SpO2, Core Temp, Respiratory Rate, Glucose).

### 2. Physics-Informed Cardiovascular Modeling
Rather than treating vitals as arbitrary values, BioTwin Omni embeds critical care hemodynamics:
- **Mean Arterial Pressure ($MAP$):** $\frac{SBP + 2 \times DBP}{3}$ (Tissue perfusion threshold)
- **Shock Index ($SI$):** $\frac{HR}{SBP}$ (Early occult hypoperfusion marker; $\ge 0.9$ flags impending shock)
- **Rate Pressure Product ($RPP$):** $\frac{HR \times SBP}{100}$ (Myocardial oxygen consumption)
- **Heart Workload & Cardiac Stress:** $SBP \times HR \times (1 + Oldpeak)$

### 3. Predictive Early Warning Engine (Adverse Events)
Predicts catastrophic events before physical collapse:
- **Cardiac Arrest / Acute Coronary Syndrome:** Predicts collapse within 10-25 minutes based on ST-depression, elevated shock index, and myocardial workload.
- **Septic Shock Refractory Hypotension:** Identifies SIRS criteria + falling MAP < 65 mmHg before irreversible septic shock.
- **Hypertensive Emergency & Stroke:** Detects acute pulse pressure strain (> 180/120 mmHg).
- **Severe Hypoxemia & Respiratory Failure:** Real-time desaturation trajectory alerts.

### 4. Multi-Agent Clinical Consensus with HITL Steering
A virtual multidisciplinary board deliberates on treatments in real time:
- **Human-In-The-Loop (HITL) Interception:** Physicians can inject bedside clinical observations mid-deliberation (e.g. *"Patient has severe renal impairment, avoid ACE inhibitors"*), prompting dynamic agent re-deliberation.
- **Dynamic Agent Swarming:** Automatically summons sub-specialists (e.g., Critical Care Intensivist) during crisis states.
- **Live Tool Verification:** Inspects PubMed, PharmGKB, CPIC, and GoodRx pricing live.

### 5. "What-If" Counterfactual Treatment Simulator
Clinicians can test interventions (e.g. IV fluids + Norepinephrine vs. Beta-blockers) and visually inspect the patient's projected physiological recovery curve over 1h, 6h, and 24h.

---

## ⚡ Quick Start & Live Demonstration

### 1. Run All Verification Tests
```bash
node test_system.js
```
*Validates hemodynamics formulas, early warning predictions, twin state fusion, and scenario streaming.*

### 2. Start Backend API & Telemetry Streamer
```bash
cd backend
npm install
npm start
```
*Backend listens on port `5000` with WebSocket telemetry on `/ws/telemetry` and REST endpoints under `/api/telemetry`.*

### 3. Start Clinician Command Center Frontend
```bash
cd frontend
npm install
npm run dev
```
*Open [http://localhost:3000](http://localhost:3000) or [http://localhost:5173](http://localhost:5173) in your browser.*

---

## 🎯 4 Clinical Crisis Demonstration Scenarios

1. **Scenario 1: Stable Baseline Patient**
   - Normal sinus rhythm, balanced hemodynamics, low composite risk (< 20%).
2. **Scenario 2: Acute Coronary Deterioration & Impending Cardiac Arrest**
   - Rapid ST depression, surging shock index (> 0.95), alarms trigger with 10-25 min countdown.
3. **Scenario 3: Septic Shock Progression**
   - Hyperthermia (39.8°C), severe vasodilation, precipitous drop in MAP below 60 mmHg.
4. **Scenario 4: Hypertensive Crisis & Stroke Threat**
   - Arterial surge to 228/135 mmHg with severe pulse pressure strain.

---

## 📁 Repository Directory Structure

- `core-digital-twin/`: The mathematical heart of the platform (physics models, adverse event classifier, state synchronizer).
- `iot-telemetry-streamer/`: Real-time wearable vital streaming engine, CEP rules, and clinical test trajectories.
- `backend/`: Multi-Agent consensus server, WebSocket telemetry broker, pharmacology & drug-interaction services.
- `frontend/`: Next-gen dark-mode clinician dashboard with holographic organ indicators and deliberation theater.
- `research-and-world-models/`: Grounding in physiological world models literature, benchmarks, and citations.
- `data-vault/`: Master collection of schemas, sample vitals, and machine learning models from all merged repositories.
- `legacy-integrations/`: Complete, intact original codebases (MedStream Analytics, VLSI Cardiac Twin, IoT Virtual Patient).

---

## 👥 Authors & Acknowledgments
Built for the **Happiest Health Digital Twin Challenge 2026** hosted on **Unstop**.
