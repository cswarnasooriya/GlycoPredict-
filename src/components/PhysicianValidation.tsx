import { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Loader2, Save, CheckCircle } from 'lucide-react';
import { updatePatientRecord } from '../services/patientService';
import { Timestamp } from 'firebase/firestore';

interface PhysicianValidationProps {
  recordId: string;
}

export default function PhysicianValidation({ recordId }: PhysicianValidationProps) {
  const [status, setStatus] = useState('Agree with AI Prediction');
  const [notes, setNotes] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!doctorName || !registrationNumber) {
      setError('Doctor Name and Registration Number are required.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await updatePatientRecord(recordId, {
        validation: {
          status,
          notes,
          doctorName,
          registrationNumber,
          validatedAt: Timestamp.now()
        }
      });
      setSaved(true);
    } catch (err) {
      console.error('Error saving validation:', err);
      setError('Failed to save validation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (saved) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex items-center gap-4"
      >
        <div className="p-3 bg-emerald-100 rounded-full">
          <CheckCircle className="h-6 w-6 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-emerald-900">Validation Saved Successfully</h3>
          <p className="text-emerald-700">The clinical notes and validation have been attached to this record.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
    >
      <div className="bg-blue-50 p-4 sm:p-6 border-b border-blue-100 flex items-center gap-3">
        <ShieldCheck className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-bold text-slate-900">Clinically Validated Section</h2>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Validation Toggle */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            AI Prediction Validation
          </label>
          <div className="flex flex-col sm:flex-row gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="validationStatus" 
                value="Agree with AI Prediction"
                checked={status === 'Agree with AI Prediction'}
                onChange={(e) => setStatus(e.target.value)}
                className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-slate-700">Agree with AI Prediction</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="validationStatus" 
                value="Modify Prediction"
                checked={status === 'Modify Prediction'}
                onChange={(e) => setStatus(e.target.value)}
                className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-slate-700">Modify Prediction</span>
            </label>
          </div>
        </div>

        {/* Clinical Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">
            Clinical Notes / Observations
          </label>
          <textarea
            id="notes"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border cursor-text"
            placeholder="Add specific medical observations or manual diagnosis notes here..."
          />
        </div>

        {/* Digital Signature */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="doctorName" className="block text-sm font-medium text-slate-700 mb-1">
              Doctor's Name *
            </label>
            <input
              type="text"
              id="doctorName"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border cursor-text"
              placeholder="Dr. Jane Doe"
              required
            />
          </div>
          <div>
            <label htmlFor="registrationNumber" className="block text-sm font-medium text-slate-700 mb-1">
              Registration Number *
            </label>
            <input
              type="text"
              id="registrationNumber"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border cursor-text"
              placeholder="e.g. MED-123456"
              required
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            {loading ? 'Saving...' : 'Save Validation'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
