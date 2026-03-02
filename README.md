# 🩺 GlycoPredict | AI-Driven Diabetes Risk Stratification

**GlycoPredict** is a professional **Clinical Decision Support System (CDSS)** developed as a final-year research project at the **Sabaragamuwa University of Sri Lanka**. The system aims to predict and stratify diabetes risk among patients using a combination of **Machine Learning (ML)** and **Generative AI (Gemini)**.

---

## 🚀 Key Features

- **Clinical Assessment Engine:** Analyzes 11 key medical features (HbA1c, Urea, Cr, BMI, etc.) to predict diabetes risk levels (No Diabetes, Pre-Diabetes, High Risk).
- **Dual-Layer Analysis:** - **Predictive Layer:** Custom ML Model (`.joblib`) for clinical accuracy.
  - **Insights Layer:** Google Gemini API for personalized health recommendations.
- **Dynamic Dashboards:** - **Patient Dashboard:** View medical history, track health trends, and manage profile bio-details.
  - **Admin Dashboard:** A centralized "Command Center" to manage users, assessment records, and platform content.
- **Physician Validation:** A secure section for medical professionals to validate AI-generated insights, ensuring clinical accountability.
- **Automated Reports:** Instant generation of professional PDF medical reports using `jsPDF`.

---

## 🛠️ Tech Stack

**Frontend:**
- **React.js** (Vite) & **Tailwind CSS** (Modern UI/UX)
- **Framer Motion** (Smooth Animations)
- **Lucide React** (Professional Medical Icons)

**Backend:**
- **FastAPI** (Python) - Serving the ML Model
- **Firebase** (Firestore & Authentication) - Real-time Database

**AI/ML:**
- **Scikit-learn** (Model Training & Inference)
- **Google Gemini API** (Gen-AI Insights)

---

## 📁 Project Structure

- `src/components`: Reusable UI elements (Navbar, Footer, Sidebar).
- `src/pages`: Main application pages (Home, Dashboard, Assessment).
- `backend/`: FastAPI server and trained `.joblib` model.
- `utils/`: Firebase config and PDF generation logic.

---

## 🛡️ Setup & Security

1. **Clone the repo:** `git clone https://github.com/your-username/GlycoPredict.git`
2. **Setup .env:** Create a `.env` file for your Firebase and Gemini API Keys (Included in `.gitignore` for security).
3. **Install Packages:** `npm install` (Frontend) & `pip install -r requirements.txt` (Backend).

---

## 🎓 Research Credits
Developed by **Chanuka Sandaruwan Warnasooriya** **Faculty of Computing, Sabaragamuwa University of Sri Lanka.**

---
© 2026 GlycoPredict - Empowering Diabetes Management with AI.
