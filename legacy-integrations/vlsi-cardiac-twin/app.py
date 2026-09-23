from flask import Flask, render_template, request
import pandas as pd
import joblib

app = Flask(__name__)

# Load model and preprocessor
model = joblib.load("model.pkl")
preprocessor = joblib.load("preprocessor.pkl")


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():

    try:

        age = float(request.form["Age"])
        sex = request.form["Sex"]
        chest_pain = request.form["ChestPainType"]
        resting_bp = float(request.form["RestingBP"])
        cholesterol = float(request.form["Cholesterol"])
        fasting_bs = float(request.form["FastingBS"])
        resting_ecg = request.form["RestingECG"]
        max_hr = float(request.form["MaxHR"])
        exercise_angina = request.form["ExerciseAngina"]
        oldpeak = float(request.form["Oldpeak"])
        st_slope = request.form["ST_Slope"]

        # Digital Twin Calculations
        pulse_pressure = resting_bp - 80
        map_value = (resting_bp + 160) / 3
        cardiac_load = resting_bp * max_hr
        cardiac_stress = oldpeak * max_hr
        age_stress = age * oldpeak
        chol_bp = cholesterol * resting_bp
        heart_workload = resting_bp * max_hr * (1 + oldpeak)

        risk_score = (
            0.25 * age +
            0.25 * resting_bp +
            0.25 * cholesterol +
            0.25 * max_hr
        )

        data = pd.DataFrame([{
            "Age": age,
            "Sex": sex,
            "ChestPainType": chest_pain,
            "RestingBP": resting_bp,
            "Cholesterol": cholesterol,
            "FastingBS": fasting_bs,
            "RestingECG": resting_ecg,
            "MaxHR": max_hr,
            "ExerciseAngina": exercise_angina,
            "Oldpeak": oldpeak,
            "ST_Slope": st_slope,
            "PulsePressure": pulse_pressure,
            "MAP": map_value,
            "CardiacLoad": cardiac_load,
            "CardiacStress": cardiac_stress,
            "AgeStress": age_stress,
            "CholBP": chol_bp,
            "HeartWorkload": heart_workload,
            "RiskScore": risk_score
        }])

        processed = preprocessor.transform(data)

        prediction = model.predict(processed)[0]

        proba = model.predict_proba(processed)

        probability = round(float(proba[0][1] * 100), 2)

        if probability < 1:
            probability = 1.25

        if probability < 35:
            risk = "Low Risk"
            color = "green"
        elif probability < 70:
            risk = "Medium Risk"
            color = "orange"
        else:
            risk = "High Risk"
            color = "red"

        return render_template(
            "index.html",
            prediction=risk,
            probability=round(probability, 2),
            color=color,
            map_value=round(map_value, 2),
            pulse_pressure=round(pulse_pressure, 2),
            cardiac_load=round(cardiac_load, 2),
            cardiac_stress=round(cardiac_stress, 2),
            heart_workload=round(heart_workload, 2)
        )

    except Exception as e:
        return f"Error: {str(e)}"


if __name__ == "__main__":
    app.run(debug=True)