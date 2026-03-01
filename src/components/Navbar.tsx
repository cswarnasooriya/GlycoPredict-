import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Activity, User, LogOut, Menu, X } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

interface NavbarProps {
  user: FirebaseUser | null;
  userRole: string | null;
  onNavigate: (view: 'hero' | 'auth' | 'assessment' | 'dashboard' | 'admin-dashboard') => void;
  onLogout: () => void;
}

export default function Navbar({ user, userRole, onNavigate, onLogout }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (view: 'hero' | 'auth' | 'assessment' | 'dashboard' | 'admin-dashboard') => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top Announcement Ribbon */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-2 px-4 text-center text-sm font-medium flex items-center justify-center gap-2 overflow-hidden">
        <Sparkles className="h-4 w-4 flex-shrink-0" />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="truncate"
        >
          Health is wealth: Monitor your glucose, empower your life.
        </motion.div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div 
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => handleNavClick('hero')}
            >
              <div className="p-1.5 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-xl font-bold text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">
                GlycoPredict
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => handleNavClick('hero')}
                className="text-slate-600 hover:text-blue-600 font-medium transition-colors cursor-pointer"
              >
                Home
              </button>
              
              {user && (
                <button 
                  onClick={() => handleNavClick(userRole === 'admin' ? 'admin-dashboard' : 'dashboard')}
                  className="text-slate-600 hover:text-blue-600 font-medium transition-colors cursor-pointer"
                >
                  Dashboard
                </button>
              )}

              <button 
                onClick={() => handleNavClick('assessment')}
                className="text-slate-600 hover:text-blue-600 font-medium transition-colors cursor-pointer"
              >
                Assessment
              </button>

              <button 
                onClick={() => {
                  handleNavClick('hero');
                  setTimeout(() => {
                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                  }, 100);
                }}
                className="text-slate-600 hover:text-blue-600 font-medium transition-colors cursor-pointer"
              >
                Resources
              </button>
            </div>

            {/* Auth Actions */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700">
                      {user.displayName || user.email?.split('@')[0]}
                    </span>
                    {userRole === 'admin' && (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                        Admin Mode
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={onLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => handleNavClick('auth')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <User className="h-4 w-4" />
                  Login
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 cursor-pointer"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-slate-200 overflow-hidden"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <button
                  onClick={() => handleNavClick('hero')}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 cursor-pointer"
                >
                  Home
                </button>
                {user && (
                  <button
                    onClick={() => handleNavClick(userRole === 'admin' ? 'admin-dashboard' : 'dashboard')}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Dashboard
                  </button>
                )}
                <button
                  onClick={() => handleNavClick('assessment')}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 cursor-pointer"
                >
                  Assessment
                </button>
                <button
                  onClick={() => {
                    handleNavClick('hero');
                    setTimeout(() => {
                      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                    }, 100);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 cursor-pointer"
                >
                  Resources
                </button>
              </div>
              
              <div className="pt-4 pb-3 border-t border-slate-200">
                {user ? (
                  <div className="px-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {user.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-base font-medium text-slate-800">{user.displayName || 'User'}</div>
                        <div className="text-sm font-medium text-slate-500">{user.email}</div>
                      </div>
                      {userRole === 'admin' && (
                        <span className="ml-auto px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                          Admin
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        onLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="mt-3 flex items-center gap-2 w-full px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <LogOut className="h-5 w-5" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="px-4">
                    <button
                      onClick={() => handleNavClick('auth')}
                      className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-base font-medium rounded-xl shadow-sm transition-all cursor-pointer"
                    >
                      <User className="h-5 w-5" />
                      Login
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
