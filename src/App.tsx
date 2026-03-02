import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ChevronRight,
  Loader2,
  LogOut
} from 'lucide-react';
import { onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './utils/firebase';
import Hero from './components/Hero';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import HomeContent from './components/HomeContent';
import BlogReader from './components/BlogReader';
import AssessmentForm from './components/AssessmentForm';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import { BlogPost } from './services/blogService';

export default function App() {
  const [view, setView] = useState<'hero' | 'auth' | 'assessment' | 'dashboard' | 'admin-dashboard' | 'blog-reader'>('hero');
  const [adminTab, setAdminTab] = useState<'patients' | 'blogs' | 'trending' | 'events' | 'notes' | 'assessment'>('patients');
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
          } else {
            setUserRole('patient');
          }
        } catch (e) {
          console.error('Error fetching user role:', e);
          setUserRole('patient');
        }
      } else {
        setUserRole(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleStartAssessment = () => {
    if (user) {
      if (userRole === 'admin') {
        setView('admin-dashboard');
      } else {
        setView('dashboard');
      }
    } else {
      setView('auth');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setView('hero');
  };

  const handleReadMore = (blog: BlogPost) => {
    setSelectedBlog(blog);
    setView('blog-reader');
  };

  const handleNavigateToAdmin = (tab: string) => {
    setAdminTab(tab as any);
    setView('admin-dashboard');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (view === 'hero') {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar user={user} userRole={userRole} onNavigate={setView} onLogout={handleLogout} />
        <main className="flex-1">
          <Hero onStartAssessment={handleStartAssessment} />
          <HomeContent
            userRole={userRole}
            onReadMoreBlog={handleReadMore}
            onNavigateToAdmin={handleNavigateToAdmin}
          />
        </main>
        <Footer />
      </div>
    );
  }

  if (view === 'blog-reader' && selectedBlog) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar user={user} userRole={userRole} onNavigate={setView} onLogout={handleLogout} />
        <main className="flex-1">
          <BlogReader blog={selectedBlog} onBack={() => setView('hero')} />
        </main>
        <Footer />
      </div>
    );
  }

  if (view === 'auth') {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar user={user} userRole={userRole} onNavigate={setView} onLogout={handleLogout} />
        <main className="flex-1">
          <Auth
            onLoginSuccess={(role) => setView(role === 'admin' ? 'admin-dashboard' : 'dashboard')}
            onBackToHome={() => setView('hero')}
          />
        </main>
        <Footer />
      </div>
    );
  }

  if (view === 'admin-dashboard') {
    return <AdminDashboard onLogout={() => setView('hero')} onBackToHome={() => setView('hero')} initialTab={adminTab} />;
  }

  if (view === 'dashboard') {
    return (
      <Dashboard
        onNewAssessment={() => setView('assessment')}
        onLogout={() => setView('hero')}
        onBackToHome={() => setView('hero')}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      <Navbar user={user} userRole={userRole} onNavigate={setView} onLogout={handleLogout} />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => setView(userRole === 'admin' ? 'admin-dashboard' : 'dashboard')}
              className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <ChevronRight className="h-4 w-4 mr-1 rotate-180" />
              Back to {userRole === 'admin' ? 'Admin Dashboard' : 'Dashboard'}
            </button>
            <button
              onClick={() => setView('hero')}
              className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Back to Home
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>

          <AssessmentForm user={user} userRole={userRole} />
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
