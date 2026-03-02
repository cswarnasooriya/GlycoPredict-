import { useState, ChangeEvent, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, Stethoscope, Loader2, Download, AlertCircle, HeartPulse 
} from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { User as FirebaseUser } from 'firebase/auth';
import { db } from '../utils/firebase.ts';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { generatePDF } from '../utils/pdfGenerator';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

interface AssessmentFormProps {
  user: FirebaseUser | null;
}

export default function AssessmentForm({ user }: AssessmentFormProps) {
  const [formData, setFormData] = useState({
    gender: '1', // 1: Male, 0: Female
    age: '', 
    urea: '', 
    cr: '', 
    hba1c: '',
    chol: '', 
    tg: '', 
    hdl: '', 
    ldl: '', 
    vldl: '', 
    bmi: ''
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ risk: string; insights: string } | null>(null);
  const [error, setError] = useState('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // 1. Python Backend එකට අවශ්‍ය දත්ත (11 Features) සකස් කිරීම
      const mlPayload = {
        Gender: parseInt(formData.gender),
        AGE: parseInt(formData.age),
        Urea: parseFloat(formData.urea),
        Cr: parseFloat(formData.cr),
        HbA1c: parseFloat(formData.hba1c),
        Chol: parseFloat(formData.chol),
        TG: parseFloat(formData.tg),
        HDL: parseFloat(formData.hdl),
        LDL: parseFloat(formData.ldl),
        VLDL: parseFloat(formData.vldl),
        BMI: parseFloat(formData.bmi)
      };

      // 2. FastAPI Backend Call එක
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mlPayload),
      });

      if (!response.ok) throw new Error('ML Backend connection failed.');
      const mlResult = await response.json();
      const riskLevel = mlResult.status;

      // 3. Gemini AI Insights ලබා ගැනීම
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Analyze: Patient ${formData.gender === '1' ? 'Male' : 'Female'}, Age ${formData.age}. HbA1c: ${formData.hba1c}%, BMI: ${formData.bmi}. ML Prediction: ${riskLevel}. Provide Sri Lankan health advice.`;
      
      const aiResponse = await model.generateContent(prompt);
      const insightsText = aiResponse.response.text();

      // 4. Firestore එකට දත්ත Save කිරීම
      if (user) {
        await addDoc(collection(db, "records"), {
          userId: user.uid,
          clinicalData: mlPayload,
          prediction: riskLevel,
          aiInsights: insightsText,
          timestamp: serverTimestamp(),
        });
      }

      setResult({ risk: riskLevel, insights: insightsText });

    } catch (err: any) {
      setError('Connection failed. Make sure FastAPI is running on Port 8000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-10 px-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2rem] shadow-2xl border border-slate-100 space-y-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-600">
            <HeartPulse size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900">Clinical Data Entry</h2>
            <p className="text-slate-500">Enter all 11 lab values for the ML model.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Gender */}
          <div className="flex flex-col">
            <label className="text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Gender</label>
            <select name="gender" onChange={handleInputChange} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold">
              <option value="1">Male</option>
              <option value="0">Female</option>
            </select>
          </div>

          {/* Dynamic Inputs for all other fields */}
          {[
            { id: 'age', label: 'Age (Years)' },
            { id: 'hba1c', label: 'HbA1c (%)' },
            { id: 'bmi', label: 'BMI' },
            { id: 'urea', label: 'Urea' },
            { id: 'cr', label: 'Creatinine (Cr)' },
            { id: 'chol', label: 'Cholesterol' },
            { id: 'tg', label: 'Triglycerides (TG)' },
            { id: 'hdl', label: 'HDL' },
            { id: 'ldl', label: 'LDL' },
            { id: 'vldl', label: 'VLDL' }
          ].map((item) => (
            <div key={item.id} className="flex flex-col">
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 ml-1">{item.label}</label>
              <input 
                type="number" step="any" name={item.id} required
                placeholder={`Enter ${item.id}`}
                onChange={handleInputChange}
                className="p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          ))}
        </div>

        <button type="submit" disabled={loading} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xl hover:bg-indigo-700 shadow-xl transition-all disabled:opacity-50">
          {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Run AI Diagnostic'}
        </button>
      </form>

      {error && (
        <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-2 font-bold">
          <AlertCircle /> {error}
        </div>
      )}

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-10 p-8 bg-white rounded-[2.5rem] shadow-2xl border border-indigo-50">
          <h3 className="text-indigo-600 font-black uppercase text-sm mb-2">ML Diagnostic Status</h3>
          <div className="text-5xl font-black text-slate-900 mb-6">{result.risk}</div>
          <div className="prose max-w-none text-slate-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: result.insights.replace(/\n/g, '<br/>') }} />
        </motion.div>
      )}
    </div>
  );
}