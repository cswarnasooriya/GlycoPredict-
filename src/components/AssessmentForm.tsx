import { useState, ChangeEvent, FormEvent } from 'react';
import { motion } from 'motion/react';
import { 
  Activity, 
  User, 
  Droplet, 
  HeartPulse, 
  Scale, 
  AlertCircle,
  Stethoscope,
  ChevronRight,
  Loader2,
  Download
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { User as FirebaseUser } from 'firebase/auth';
import { savePatientRecord } from '../services/patientService';
import { generatePDF } from '../utils/pdfGenerator';
import PhysicianValidation from './PhysicianValidation';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface AssessmentFormProps {
  user: FirebaseUser | null;
  userRole?: string | null;
}

export default function AssessmentForm({ user, userRole }: AssessmentFormProps) {
  const [formData, setFormData] = useState({
    gender: 'Male',
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
  const [pdfLoading, setPdfLoading] = useState(false);
  const [result, setResult] = useState<{ risk: string; insights: string } | null>(null);
  const [recordId, setRecordId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDownloadReport = async () => {
    if (!result) return;
    setPdfLoading(true);
    try {
      // Small delay to allow UI to update to loading state
      await new Promise(resolve => setTimeout(resolve, 100));
      generatePDF(
        formData, 
        result.risk, 
        result.insights, 
        user?.displayName || 'Patient'
      );
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Failed to generate PDF report. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Simulate ML model prediction based on standard medical thresholds
      const hba1c = parseFloat(formData.hba1c);
      let riskLevel = 'Low Risk';
      if (hba1c >= 6.5) {
        riskLevel = 'High Risk (Diabetes)';
      } else if (hba1c >= 5.7) {
        riskLevel = 'Moderate Risk (Pre-Diabetes)';
      }

      // Generate AI insights using Gemini
      const prompt = `
        You are a specialized AI Healthcare Assistant for Diabetes Management.
        Your primary role is to analyze patient lab data and provide predictive insights and medical advice.
        
        Patient Data:
        - Gender: ${formData.gender}
        - Age: ${formData.age}
        - Urea: ${formData.urea}
        - Cr (Creatinine): ${formData.cr}
        - HbA1c: ${formData.hba1c}
        - Chol (Cholesterol): ${formData.chol}
        - TG (Triglycerides): ${formData.tg}
        - HDL: ${formData.hdl}
        - LDL: ${formData.ldl}
        - VLDL: ${formData.vldl}
        - BMI: ${formData.bmi}

        Simulated Risk Level: ${riskLevel}

        Provide a personalized health plan. 
        If High Risk: Suggest a Low-Glycemic Index (GI) diet, specific exercises, and a consultation reminder.
        If Moderate Risk: Suggest lifestyle modifications to prevent progression.
        If Low Risk: Suggest preventive wellness habits.

        Tone: Empathetic, professional, and clinical.
        Format the response in Markdown with clear headings and bullet points. Do not include the disclaimer in the markdown, it will be added separately.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      const insightsText = response.text || 'No insights generated.';

      setResult({
        risk: riskLevel,
        insights: insightsText
      });

      // Save to Firebase if user is logged in
      if (user) {
        const newRecordId = await savePatientRecord(user.uid, {
          ...formData,
          riskLevel,
          insights: insightsText
        });
        setRecordId(newRecordId);
      }
    } catch (err) {
      console.error('Error generating insights:', err);
      setError('Failed to generate insights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
          <Stethoscope className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
          Diabetes Risk AI Assistant
        </h1>
        <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">
          Enter your lab values below for a simulated risk prediction and personalized AI-generated health plan.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
              
              {/* Gender */}
              <div className="col-span-1">
                <label htmlFor="gender" className="block text-sm font-medium text-slate-700 mb-1">
                  Gender
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-2.5 border bg-white cursor-pointer"
                    required
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              {/* Age */}
              <div className="col-span-1">
                <label htmlFor="age" className="block text-sm font-medium text-slate-700 mb-1">
                  Age
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="number"
                    name="age"
                    id="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-2.5 border cursor-pointer"
                    placeholder="e.g. 45"
                    required
                    min="0"
                  />
                </div>
              </div>

              {/* BMI */}
              <div className="col-span-1">
                <label htmlFor="bmi" className="block text-sm font-medium text-slate-700 mb-1">
                  BMI
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Scale className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    name="bmi"
                    id="bmi"
                    value={formData.bmi}
                    onChange={handleInputChange}
                    className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-2.5 border cursor-pointer"
                    placeholder="e.g. 24.5"
                    required
                    min="0"
                  />
                </div>
              </div>

              {/* HbA1c */}
              <div className="col-span-1">
                <label htmlFor="hba1c" className="block text-sm font-medium text-slate-700 mb-1">
                  HbA1c (%)
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Activity className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    name="hba1c"
                    id="hba1c"
                    value={formData.hba1c}
                    onChange={handleInputChange}
                    className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-2.5 border cursor-pointer"
                    placeholder="e.g. 5.8"
                    required
                    min="0"
                  />
                </div>
              </div>

              {/* Urea */}
              <div className="col-span-1">
                <label htmlFor="urea" className="block text-sm font-medium text-slate-700 mb-1">
                  Urea
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Droplet className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    name="urea"
                    id="urea"
                    value={formData.urea}
                    onChange={handleInputChange}
                    className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-2.5 border cursor-pointer"
                    placeholder="e.g. 30"
                    required
                    min="0"
                  />
                </div>
              </div>

              {/* Cr */}
              <div className="col-span-1">
                <label htmlFor="cr" className="block text-sm font-medium text-slate-700 mb-1">
                  Cr (Creatinine)
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Droplet className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    name="cr"
                    id="cr"
                    value={formData.cr}
                    onChange={handleInputChange}
                    className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-2.5 border cursor-pointer"
                    placeholder="e.g. 0.9"
                    required
                    min="0"
                  />
                </div>
              </div>

              {/* Chol */}
              <div className="col-span-1">
                <label htmlFor="chol" className="block text-sm font-medium text-slate-700 mb-1">
                  Cholesterol
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HeartPulse className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    name="chol"
                    id="chol"
                    value={formData.chol}
                    onChange={handleInputChange}
                    className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-2.5 border cursor-pointer"
                    placeholder="e.g. 180"
                    required
                    min="0"
                  />
                </div>
              </div>

              {/* TG */}
              <div className="col-span-1">
                <label htmlFor="tg" className="block text-sm font-medium text-slate-700 mb-1">
                  TG (Triglycerides)
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HeartPulse className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    name="tg"
                    id="tg"
                    value={formData.tg}
                    onChange={handleInputChange}
                    className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-2.5 border cursor-pointer"
                    placeholder="e.g. 150"
                    required
                    min="0"
                  />
                </div>
              </div>

              {/* HDL */}
              <div className="col-span-1">
                <label htmlFor="hdl" className="block text-sm font-medium text-slate-700 mb-1">
                  HDL
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HeartPulse className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    name="hdl"
                    id="hdl"
                    value={formData.hdl}
                    onChange={handleInputChange}
                    className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-2.5 border cursor-pointer"
                    placeholder="e.g. 50"
                    required
                    min="0"
                  />
                </div>
              </div>

              {/* LDL */}
              <div className="col-span-1">
                <label htmlFor="ldl" className="block text-sm font-medium text-slate-700 mb-1">
                  LDL
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HeartPulse className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    name="ldl"
                    id="ldl"
                    value={formData.ldl}
                    onChange={handleInputChange}
                    className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-2.5 border cursor-pointer"
                    placeholder="e.g. 100"
                    required
                    min="0"
                  />
                </div>
              </div>

              {/* VLDL */}
              <div className="col-span-1">
                <label htmlFor="vldl" className="block text-sm font-medium text-slate-700 mb-1">
                  VLDL
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HeartPulse className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    name="vldl"
                    id="vldl"
                    value={formData.vldl}
                    onChange={handleInputChange}
                    className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-2.5 border cursor-pointer"
                    placeholder="e.g. 20"
                    required
                    min="0"
                  />
                </div>
              </div>

            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                    Analyzing Data...
                  </>
                ) : (
                  <>
                    Analyze Risk & Get AI Insights
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start"
        >
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </motion.div>
      )}

      {result && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <div className={`p-6 sm:p-8 border-b-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
            result.risk.includes('High') ? 'border-red-500' : 
            result.risk.includes('Moderate') ? 'border-amber-500' : 
            'border-blue-500'
          }`}>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Analysis Results</h2>
              <div className="flex items-center">
                <span className="text-slate-600 mr-2">Simulated Risk Level:</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  result.risk.includes('High') ? 'bg-red-100 text-red-800' : 
                  result.risk.includes('Moderate') ? 'bg-amber-100 text-amber-800' : 
                  'bg-blue-100 text-blue-800'
                }`}>
                  {result.risk}
                </span>
              </div>
            </div>
            
            <button
              onClick={handleDownloadReport}
              disabled={pdfLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {pdfLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {pdfLoading ? 'Generating...' : 'Download Report'}
            </button>
          </div>
          
          <div className="p-6 sm:p-8 prose prose-blue max-w-none">
            <div dangerouslySetInnerHTML={{ __html: formatMarkdown(result.insights) }} />
          </div>

          <div className="bg-slate-50 p-4 sm:p-6 border-t border-slate-200">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-slate-400 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-sm text-slate-500 italic">
                Disclaimer: This is an AI-generated prediction for informational purposes. Please consult a certified medical professional for diagnosis.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Physician Validation Section */}
      {result && recordId && (userRole === 'admin' || userRole === 'doctor') && (
        <PhysicianValidation recordId={recordId} />
      )}
    </div>
  );
}

// Simple markdown formatter since we don't have react-markdown installed
function formatMarkdown(text: string) {
  let html = text
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-6 mb-3 text-slate-800">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4 text-slate-900">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-4 text-slate-900">$1</h1>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/^\* (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
    .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
    .replace(/\n/gim, '<br />');
  
  // Clean up multiple breaks
  html = html.replace(/(<br \/>){2,}/gim, '<br /><br />');
  
  return html;
}
