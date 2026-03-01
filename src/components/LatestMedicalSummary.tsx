import { motion } from 'motion/react';
import { 
  ClipboardList, Thermometer, Droplets, Activity, User, Scale, HeartPulse, 
  ArrowUpRight, ArrowDownRight, Minus, ChevronRight 
} from 'lucide-react';
import { PatientRecord } from '../services/patientService';

interface LatestMedicalSummaryProps {
  latestRecord: PatientRecord | null;
  onNewAssessment: () => void;
}

export default function LatestMedicalSummary({ latestRecord, onNewAssessment }: LatestMedicalSummaryProps) {
  if (!latestRecord) {
    return (
      <motion.div 
        whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
        className="bg-white rounded-3xl border border-blue-100 shadow-xl p-8 text-center transition-shadow duration-300"
      >
        <div className="inline-flex items-center justify-center p-4 bg-blue-50 rounded-full mb-4">
          <ClipboardList className="h-10 w-10 text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">No records found</h2>
        <p className="text-slate-500 mb-6 max-w-md mx-auto">
          Start your first assessment to see your health summary!
        </p>
        <button 
          onClick={onNewAssessment}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm transition-all cursor-pointer"
        >
          Start Now
          <ChevronRight className="h-4 w-4" />
        </button>
      </motion.div>
    );
  }

  const getRiskColor = (risk: string) => {
    if (risk.includes('High')) return 'bg-red-100 text-red-800 border-red-200';
    if (risk.includes('Moderate') || risk.includes('Pre')) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const metrics = [
    { label: 'Age', value: latestRecord.age, unit: 'yrs', icon: User, normal: { min: 0, max: 120 } },
    { label: 'BMI', value: latestRecord.bmi, unit: 'kg/m²', icon: Scale, normal: { min: 18.5, max: 24.9 } },
    { label: 'HbA1c', value: latestRecord.hba1c, unit: '%', icon: Activity, normal: { min: 4, max: 5.6 } },
    { label: 'Urea', value: latestRecord.urea, unit: 'mmol/L', icon: Droplets, normal: { min: 2.5, max: 7.1 } },
    { label: 'Creatinine', value: latestRecord.cr, unit: 'µmol/L', icon: Thermometer, normal: { min: 53, max: 106 } },
    { label: 'Cholesterol', value: latestRecord.chol, unit: 'mmol/L', icon: HeartPulse, normal: { min: 0, max: 5.2 } },
    { label: 'Triglycerides', value: latestRecord.tg, unit: 'mmol/L', icon: Droplets, normal: { min: 0, max: 1.7 } },
    { label: 'HDL', value: latestRecord.hdl, unit: 'mmol/L', icon: HeartPulse, normal: { min: 1.0, max: 2.0 } },
    { label: 'LDL', value: latestRecord.ldl, unit: 'mmol/L', icon: HeartPulse, normal: { min: 0, max: 3.4 } },
    { label: 'VLDL', value: latestRecord.vldl, unit: 'mmol/L', icon: HeartPulse, normal: { min: 0.1, max: 1.7 } },
  ];

  const getStatus = (value: number | string, normal: { min: number, max: number }) => {
    const num = parseFloat(value as string);
    if (isNaN(num)) return { color: 'text-slate-600', Icon: Minus };
    if (num > normal.max) return { color: 'text-red-500', Icon: ArrowUpRight };
    if (num < normal.min) return { color: 'text-amber-500', Icon: ArrowDownRight };
    return { color: 'text-blue-500', Icon: Minus }; // Normal
  };

  return (
    <motion.div 
      whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
      className="bg-white rounded-3xl border border-blue-100 shadow-xl p-6 sm:p-8 transition-shadow duration-300"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 rounded-xl">
            <ClipboardList className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Latest Medical Summary</h2>
            <p className="text-sm text-slate-500">
              {latestRecord.createdAt && typeof (latestRecord.createdAt as any).toDate === 'function' 
                ? (latestRecord.createdAt as any).toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
                : 'Recent Assessment'}
            </p>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-full border font-bold text-sm sm:text-base shadow-sm ${getRiskColor(latestRecord.riskLevel)}`}>
          {latestRecord.riskLevel}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {metrics.map((metric, idx) => {
          const { color, Icon } = getStatus(metric.value, metric.normal);
          return (
            <div key={idx} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 hover:border-blue-200 transition-colors cursor-pointer group">
              <div className="flex items-center gap-2 mb-2 text-slate-500 group-hover:text-blue-600 transition-colors">
                <metric.icon className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider">{metric.label}</span>
              </div>
              <div className="flex items-end justify-between">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-slate-800">{metric.value}</span>
                  <span className="text-xs text-slate-500">{metric.unit}</span>
                </div>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
