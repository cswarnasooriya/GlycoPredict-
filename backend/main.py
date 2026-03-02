import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# 🛠️ 1. CORS Setup - React (Port 5173) සමඟ සම්බන්ධ වීමට අනිවාර්යයි
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # සියලුම origins වලට ඉඩ ලබා දේ (Development සඳහා)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Model එක නිවැරදිව Load කිරීම ---
try:
    # ඔයාගේ train කරන ලද model එක මෙහිදී load වේ
    loaded_data = joblib.load('diabetes_model.joblib')
    
    # Dictionary එකක් ලෙස save කර ඇත්නම් 'pipeline' කොටස පමණක් ලබා ගනී
    if isinstance(loaded_data, dict) and 'pipeline' in loaded_data:
        model = loaded_data['pipeline']
        print("✅ Success: ML Pipeline extracted from dictionary.")
    else:
        model = loaded_data
        print("ℹ️ Loaded direct model object.")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    model = None

# රෝගියාගේ දත්ත ව්‍යුහය (Features 11)
# Frontend එකෙන් එවන JSON දත්ත මෙහි පවතින නම් වලට සමාන විය යුතුය
class PatientData(BaseModel):
    Gender: int
    AGE: int
    Urea: float
    Cr: float
    HbA1c: float
    Chol: float
    TG: float
    HDL: float
    LDL: float
    VLDL: float
    BMI: float

@app.get("/")
def read_root():
    return {"status": "GlycoPredict API is running"}

@app.post("/predict")
async def get_prediction(data: PatientData):
    if model is None:
        raise HTTPException(status_code=500, detail="ML Model not loaded on server.")
    
    try:
        # 1. දත්ත DataFrame එකකට හැරවීම (Model එකට input දීමට)
        input_data = data.model_dump()
        input_df = pd.DataFrame([input_data])
        
        # 2. Prediction එක ලබා ගැනීම
        prediction = model.predict(input_df)[0]
        
        # 3. ප්‍රතිඵලය හඳුනා ගැනීම (Class labels: 0, 1, 2)
        # පර්යේෂණ දත්ත අනුව: 0-No Diabetes, 1-Pre-Diabetes, 2-Diabetes
        outcomes = {0: "No Diabetes", 1: "Pre-Diabetes", 2: "Diabetes"}
        status = outcomes.get(int(prediction), "Unknown Status")
        
        return {
            "prediction": int(prediction),
            "status": status
        }
    except Exception as e:
        print(f"Prediction Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))