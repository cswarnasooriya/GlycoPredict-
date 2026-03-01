import { motion } from 'motion/react';
import { ShieldCheck, Activity, Brain, ArrowRight } from 'lucide-react';

interface HeroProps {
  onStartAssessment: () => void;
}

export default function Hero({ onStartAssessment }: HeroProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-white to-blue-50 min-h-screen flex items-center">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full bg-blue-100/50 blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full bg-emerald-100/50 blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <div className="flex items-center space-x-2 mb-6">
              <Activity className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-slate-900 tracking-tight">GlycoPredict</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight mb-6">
              Predicting a Healthier Future with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">AI-Driven</span> Diabetes Insights.
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-600 mb-8 leading-relaxed">
              Harnessing Machine Learning and Generative AI to provide personalized risk stratification and wellness plans based on your clinical data.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={onStartAssessment}
                className="inline-flex justify-center items-center px-8 py-4 text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all duration-200"
              >
                Start Free Assessment
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button 
                className="inline-flex justify-center items-center px-8 py-4 text-base font-medium rounded-xl text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all duration-200"
              >
                Learn About Our Research
              </button>
            </div>

            <div className="mt-10 flex items-center gap-6 text-sm text-slate-500 font-medium">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-500" />
                <span>Advanced ML Models</span>
              </div>
            </div>
          </motion.div>

          {/* Image/Illustration */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative lg:ml-auto"
          >
            <div className="relative rounded-2xl bg-white shadow-2xl shadow-blue-900/10 border border-slate-100 p-2 overflow-hidden">
              <img 
                src="https://picsum.photos/seed/medical-dashboard/800/600?blur=2" 
                alt="AI Medical Dashboard" 
                className="rounded-xl w-full h-auto object-cover"
                referrerPolicy="no-referrer"
              />
              {/* Overlay UI elements to make it look like a dashboard */}
              <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Activity className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Risk Level</p>
                    <p className="text-sm font-bold text-slate-900">Low Risk</p>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-8 right-8 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Brain className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">AI Confidence</p>
                    <p className="text-sm font-bold text-slate-900">98.4%</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
