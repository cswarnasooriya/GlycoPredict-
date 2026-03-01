import { motion } from 'motion/react';
import { Clock, FileDown, Activity, User, Droplets } from 'lucide-react';
import { PatientRecord } from '../services/patientService';
import { generatePDF } from '../utils/pdfGenerator';
import { auth } from '../firebase';

interface MedicalHistoryTimelineProps {
  records: (PatientRecord & { id: string })[];
}

export default function MedicalHistoryTimeline({ records }: MedicalHistoryTimelineProps) {
  if (!records || records.length === 0) return null;

  const getRiskColor = (risk: string) => {
    if (risk.includes('High')) return 'bg-red-100 text-red-800 border-red-200 shadow-[0_0_15px_rgba(239,68,68,0.3)]';
    if (risk.includes('Moderate') || risk.includes('Pre')) return 'bg-amber-100 text-amber-800 border-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.3)]';
    return 'bg-blue-100 text-blue-800 border-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.3)]';
  };

  const handleDownload = (record: PatientRecord) => {
    generatePDF(
      record,
      record.riskLevel,
      record.insights || 'No AI insights available for this past record.',
      auth.currentUser?.displayName || 'Patient'
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
        <div className="p-2 bg-indigo-50 rounded-lg">
          <Clock className="h-6 w-6 text-indigo-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">Medical History Timeline</h3>
      </div>

      <div className="relative border-l-2 border-indigo-100 ml-4 sm:ml-6 space-y-8 pb-4">
        {records.map((record, index) => {
          const dateObj = record.createdAt && typeof (record.createdAt as any).toDate === 'function' 
            ? (record.createdAt as any).toDate() 
            : new Date();
          
          const dateStr = dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
          const timeStr = dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

          return (
            <motion.div 
              key={record.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="relative pl-6 sm:pl-8"
            >
              {/* Timeline Dot */}
              <div className="absolute -left-[9px] top-6 h-4 w-4 rounded-full bg-white border-4 border-indigo-500 shadow-sm" />

              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-slate-50 border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mb-2">
                      <Clock className="h-4 w-4" />
                      {dateStr} at {timeStr}
                    </div>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getRiskColor(record.riskLevel)}`}>
                      {record.riskLevel}
                    </div>
                  </div>
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDownload(record); }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                  >
                    <FileDown className="h-4 w-4" />
                    <span className="hidden sm:inline">Download PDF</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-3 mt-4">
                  <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-sm">
                    <Activity className="h-4 w-4 text-blue-500" />
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">HbA1c</span>
                      <span className="text-sm font-bold text-slate-700">{record.hba1c}%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-sm">
                    <Droplets className="h-4 w-4 text-indigo-500" />
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Glucose (Urea)</span>
                      <span className="text-sm font-bold text-slate-700">{record.urea} mmol/L</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-sm">
                    <User className="h-4 w-4 text-emerald-500" />
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">BMI</span>
                      <span className="text-sm font-bold text-slate-700">{record.bmi}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
