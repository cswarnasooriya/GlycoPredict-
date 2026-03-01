import { Activity, Twitter, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-6 w-6 text-blue-400" />
            <span className="text-xl font-bold text-white tracking-tight">GlycoPredict</span>
          </div>
          <p className="text-sm text-slate-400 mb-6 max-w-sm">
            GlycoPredict - Empowering Diabetes Management with AI. We harness machine learning to provide personalized risk stratification and wellness plans.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-slate-400 hover:text-white transition-colors cursor-pointer">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors cursor-pointer">
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>
        
        <div>
          <h3 className="text-white font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-blue-400 transition-colors cursor-pointer">Home</a></li>
            <li><a href="#" className="hover:text-blue-400 transition-colors cursor-pointer">Assessment</a></li>
            <li><a href="#" className="hover:text-blue-400 transition-colors cursor-pointer">Dashboard</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-4">Contact</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-400" />
              <span>contact@glycopredict.com</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-blue-400" />
              <span>+1 (555) 123-4567</span>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-400" />
              <span>123 Health Ave, Medical District</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-800 text-sm text-center text-slate-500">
        <p>© 2026 GlycoPredict. All rights reserved.</p>
      </div>
    </footer>
  );
}
