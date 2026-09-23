import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.metrics import accuracy_score
from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier

from imblearn.over_sampling import SMOTE

print("Loading Dataset...")

# =====================================

# LOAD DATASET

# =====================================

df = pd.read_csv("heart (1).csv")

print("Shape:", df.shape)

# =====================================

# PHYSICS INFORMED FEATURES

# =====================================

df["PulsePressure"] = df["RestingBP"] - 80

df["MAP"] = (df["RestingBP"] + 160) / 3

df["CardiacLoad"] = (
df["RestingBP"] *
df["MaxHR"]
)

df["CardiacStress"] = (
df["Oldpeak"] *
df["MaxHR"]
)

df["AgeStress"] = (
df["Age"] *
df["Oldpeak"]
)

df["CholBP"] = (
df["Cholesterol"] *
df["RestingBP"]
)

df["HeartWorkload"] = (
df["RestingBP"] *
df["MaxHR"] *
(1 + df["Oldpeak"])
)

df["RiskScore"] = (
0.25 * df["Age"] +
0.25 * df["RestingBP"] +
0.25 * df["Cholesterol"] +
0.25 * df["MaxHR"]
)

# =====================================

# TARGET

# =====================================

X = df.drop("HeartDisease", axis=1)
y = df["HeartDisease"]

# =====================================

# CATEGORICAL COLUMNS

# =====================================

cat_cols = [
"Sex",
"ChestPainType",
"RestingECG",
"ExerciseAngina",
"ST_Slope"
]

num_cols = [
c for c in X.columns
if c not in cat_cols
]

# =====================================

# PREPROCESSING

# =====================================

preprocessor = ColumnTransformer(
transformers=[
(
"num",
StandardScaler(),
num_cols
),
(
"cat",
OneHotEncoder(
handle_unknown="ignore"
),
cat_cols
)
]
)

X_processed = preprocessor.fit_transform(X)

# =====================================

# SMOTE BALANCING

# =====================================

smote = SMOTE(random_state=42)

X_balanced, y_balanced = smote.fit_resample(
X_processed,
y
)

# =====================================

# TRAIN TEST SPLIT

# =====================================

X_train, X_test, y_train, y_test = train_test_split(
X_balanced,
y_balanced,
test_size=0.20,
random_state=42,
stratify=y_balanced
)

# =====================================

# RANDOM FOREST

# =====================================

from sklearn.ensemble import ExtraTreesClassifier

model = ExtraTreesClassifier(
    n_estimators=1000,
    max_depth=None,
    min_samples_split=2,
    min_samples_leaf=1,
    random_state=42
)
print("Training Model...")

model.fit(
X_train,
y_train
)

pred = model.predict(X_test)

acc = accuracy_score(
y_test,
pred
)

print("\n====================")
print("ACCURACY :", round(acc * 100, 2), "%")
print("====================")

print("\nMODEL FEATURES:")
print(X.columns.tolist())

joblib.dump(
    model,
    "model.pkl"
)


joblib.dump(
preprocessor,
"preprocessor.pkl"
)

print("\nModel Saved Successfully")
