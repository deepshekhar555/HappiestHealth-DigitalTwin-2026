# 🩺 BioTwin Metrics Service

Specialized **Biomechanical & Cardiopulmonary Health Metrics Engine** for the BioTwin Digital Twin Platform.

## 🎯 Purpose
While the real-time telemetry streamer (`iot-telemetry-streamer`) models continuous multi-organ ICU/ward vitals, the **Metrics Service** manages **discrete rehabilitation and walking sessions** where clinical teams evaluate physical therapy progress, gait recovery, and cardiopulmonary response under exertion.

## 📊 Combined Metrics Captured

| Category | Metric | Unit | Normal Clinical Range |
|---|---|---|---|
| **Biomechanical** | Gait Symmetry Score | % | 80% – 100% |
| **Biomechanical** | Fall Risk Index | % | < 45% (Lower is safer) |
| **Biomechanical** | Cadence | steps/min | 95 – 115 spm |
| **Biomechanical** | Stride Length | meters | 1.20 – 1.40 m |
| **Biomechanical** | Walking Speed | m/s | 0.85 – 1.20 m/s |
| **Cardiovascular** | Heart Rate | bpm | 70 – 95 bpm (during moderate gait) |
| **Cardiovascular** | Blood Pressure | mmHg | 115/75 – 125/80 mmHg |
| **Pulmonary** | Oxygen Saturation ($SpO_2$) | % | 96% – 99% |
| **Pulmonary** | Respiratory Rate | breaths/min | 14 – 20 /min |
| **Metabolic** | Active Calories Burned | kcal | Session cumulative |
| **Effort** | Exertion Index | % | Strain assessment |

## 🧠 Explainable AI (XAI)
Every recorded session automatically generates:
1. **Factor Breakdown**: Detailed weighting and directional tags (↑ / ↓ Risk).
2. **Multi-Domain Synthesis**: Correlates mechanical asymmetry with cardiovascular strain.
3. **Risk Tier & Confidence**: Dynamic classification (`Low`, `Moderate`, `High`) with actionable clinical recommendations.

## 🚀 Usage in BioTwin
Imported directly into `backend/routes/metrics.routes.js` and visualized in `frontend/src/components/GaitSessionPanel.jsx`.
