import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, History, User as UserIcon, LogOut, Plus, Activity,
  ChevronRight, Loader2, Edit2, Save, X, Droplets, Scale, ArrowLeft, CheckCircle
} from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, limit } from 'firebase/firestore';
import { auth, db } from '../utils/firebase';
import { PatientRecord } from '../services/patientService';
import ChatBot from './ChatBot';
import MedicalHistoryTimeline from './MedicalHistoryTimeline';

interface DashboardProps {
  onNewAssessment: () => void;
  onLogout: () => void;
  onBackToHome: () => void;
}

export default function Dashboard({ onNewAssessment, onLogout, onBackToHome }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history'>('dashboard');
  const [records, setRecords] = useState<(PatientRecord & { id: string })[]>([]);
  const [latestRecord, setLatestRecord] = useState<(PatientRecord & { id: string }) | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', age: '', gender: 'Male' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;

    const userRef = doc(db, 'users', auth.currentUser.uid);
    const unsubscribeUser = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile(data);
        // Only update form if not currently editing to avoid overwriting user input
        setEditForm(prev => ({
          name: data.name || prev.name,
          age: data.age?.toString() || prev.age,
          gender: data.gender || prev.gender
        }));
      }
    });

    const recordsRef = collection(db, 'records');

    // Fetch all records for history
    const qAll = query(recordsRef, where('userId', '==', auth.currentUser.uid), orderBy('createdAt', 'desc'));
    const unsubscribeRecords = onSnapshot(qAll, (snapshot) => {
      const recs: any[] = [];
      snapshot.forEach((doc) => {
        recs.push({ id: doc.id, ...doc.data() });
      });
      setRecords(recs);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching records:", err);
      setLoading(false);
    });

    // Fetch only the latest record for the summary card
    const qLatest = query(recordsRef, where('userId', '==', auth.currentUser.uid), orderBy('createdAt', 'desc'), limit(1));
    const unsubscribeLatest = onSnapshot(qLatest, (snapshot) => {
      if (!snapshot.empty) {
        setLatestRecord({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as any);
      } else {
        setLatestRecord(null);
      }
    });

    return () => {
      unsubscribeUser();
      unsubscribeRecords();
      unsubscribeLatest();
    };
  }, []);

  const handleUpdateProfile = async () => {
    if (!auth.currentUser) return;
    setSavingProfile(true);
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        name: editForm.name,
        age: editForm.age,
        gender: editForm.gender
      });
      setIsEditingProfile(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSavingProfile(false);
    }
  };

  const cancelEdit = () => {
    if (profile) {
      setEditForm({
        name: profile.name || '',
        age: profile.age?.toString() || '',
        gender: profile.gender || 'Male'
      });
    }
    setIsEditingProfile(false);
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  const getMetricStatus = (type: 'hba1c' | 'glucose' | 'bmi', value: number | string) => {
    const val = parseFloat(value as string);
    if (isNaN(val)) return { label: 'Unknown', color: 'bg-slate-100 text-slate-800' };

    if (type === 'hba1c') {
      if (val < 5.7) return { label: 'Normal', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      if (val <= 6.4) return { label: 'Borderline', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      return { label: 'High', color: 'bg-red-100 text-red-800 border-red-200' };
    }
    if (type === 'bmi') {
      if (val < 18.5) return { label: 'Underweight', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      if (val <= 24.9) return { label: 'Normal', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      if (val <= 29.9) return { label: 'Borderline', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      return { label: 'High', color: 'bg-red-100 text-red-800 border-red-200' };
    }
    if (type === 'glucose') {
      if (val < 2.5) return { label: 'Low', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      if (val <= 7.1) return { label: 'Normal', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      return { label: 'High', color: 'bg-red-100 text-red-800 border-red-200' };
    }
    return { label: 'Normal', color: 'bg-blue-100 text-blue-800 border-blue-200' };
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans relative">
      {/* Success Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-8 right-8 z-50 bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3"
          >
            <CheckCircle className="h-6 w-6" />
            <span className="font-medium">Profile Updated Successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xl tracking-tight cursor-pointer" onClick={onBackToHome}>
            <Activity className="h-6 w-6" />
            GlycoPredict
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl font-medium transition-colors cursor-pointer ${activeTab === 'dashboard'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl font-medium transition-colors cursor-pointer ${activeTab === 'history'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
          >
            <History className="h-5 w-5" />
            History
          </button>
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-3 px-4 py-3 w-full text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Home
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl font-medium transition-colors cursor-pointer"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Topbar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-slate-800 capitalize">{activeTab}</h1>
          </div>
          <button
            onClick={onNewAssessment}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow-sm shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Assessment</span>
          </button>
        </header>

        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
          ) : activeTab === 'dashboard' ? (
            <>
              {/* Welcome Banner */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="relative z-10">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-2">
                    {greeting}, {profile?.name?.split(' ')[0] || 'User'}!
                  </h2>
                  <p className="text-blue-100 text-lg max-w-2xl">
                    Here is your personalized health overview. Stay proactive about your well-being.
                  </p>
                </div>
              </motion.div>

              {/* Bento Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Latest Assessment Summary (Col Span 2) */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 hover:shadow-2xl transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-50 rounded-xl">
                        <Activity className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800">Quick View: Latest Assessment</h3>
                    </div>
                    {latestRecord && (
                      <span className="text-sm font-medium text-slate-500">
                        {latestRecord.createdAt && typeof (latestRecord.createdAt as any).toDate === 'function'
                          ? (latestRecord.createdAt as any).toDate().toLocaleDateString()
                          : 'Recent'}
                      </span>
                    )}
                  </div>

                  {!latestRecord ? (
                    <div className="text-center py-10">
                      <Activity className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500 mb-4">No assessment records found.</p>
                      <button
                        onClick={onNewAssessment}
                        className="text-blue-600 font-medium hover:text-blue-700 cursor-pointer"
                      >
                        Start your first assessment &rarr;
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {/* HbA1c */}
                      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 cursor-pointer hover:border-blue-200 transition-all duration-300">
                        <div className="flex items-center gap-2 mb-3 text-slate-500">
                          <Activity className="h-4 w-4" />
                          <span className="text-sm font-bold uppercase tracking-wider">HbA1c</span>
                        </div>
                        <div className="flex items-end justify-between">
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-slate-800">{latestRecord.hba1c}</span>
                            <span className="text-sm text-slate-500">%</span>
                          </div>
                        </div>
                        <div className="mt-3">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${getMetricStatus('hba1c', latestRecord.hba1c).color}`}>
                            {getMetricStatus('hba1c', latestRecord.hba1c).label}
                          </span>
                        </div>
                      </div>

                      {/* Glucose (Urea) */}
                      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 cursor-pointer hover:border-blue-200 transition-all duration-300">
                        <div className="flex items-center gap-2 mb-3 text-slate-500">
                          <Droplets className="h-4 w-4" />
                          <span className="text-sm font-bold uppercase tracking-wider">Glucose</span>
                        </div>
                        <div className="flex items-end justify-between">
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-slate-800">{latestRecord.urea}</span>
                            <span className="text-sm text-slate-500">mmol/L</span>
                          </div>
                        </div>
                        <div className="mt-3">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${getMetricStatus('glucose', latestRecord.urea).color}`}>
                            {getMetricStatus('glucose', latestRecord.urea).label}
                          </span>
                        </div>
                      </div>

                      {/* BMI */}
                      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 cursor-pointer hover:border-blue-200 transition-all duration-300">
                        <div className="flex items-center gap-2 mb-3 text-slate-500">
                          <Scale className="h-4 w-4" />
                          <span className="text-sm font-bold uppercase tracking-wider">BMI</span>
                        </div>
                        <div className="flex items-end justify-between">
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-slate-800">{latestRecord.bmi}</span>
                          </div>
                        </div>
                        <div className="mt-3">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${getMetricStatus('bmi', latestRecord.bmi).color}`}>
                            {getMetricStatus('bmi', latestRecord.bmi).label}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Integrated Profile Section (Col Span 1) */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 hover:shadow-2xl transition-all duration-300 flex flex-col"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-indigo-50 rounded-xl">
                        <UserIcon className="h-6 w-6 text-indigo-600" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800">Bio-Details</h3>
                    </div>
                    {!isEditingProfile ? (
                      <button
                        onClick={() => setIsEditingProfile(true)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Bio"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                    ) : (
                      <button
                        onClick={cancelEdit}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Cancel"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>

                  <div className="flex-1 space-y-5">
                    <AnimatePresence mode="wait">
                      {!isEditingProfile ? (
                        <motion.div
                          key="view"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="space-y-5"
                        >
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</p>
                            <p className="text-lg font-semibold text-slate-800">{profile?.name || 'Not set'}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Age</p>
                              <p className="text-lg font-semibold text-slate-800">{profile?.age ? `${profile.age} yrs` : '--'}</p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Gender</p>
                              <p className="text-lg font-semibold text-slate-800">{profile?.gender || '--'}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email</p>
                            <p className="text-md font-medium text-slate-600 truncate">{profile?.email}</p>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="edit"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="space-y-4"
                        >
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              className="w-full rounded-xl border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 border cursor-text text-sm"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Age</label>
                              <input
                                type="number"
                                value={editForm.age}
                                onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                                className="w-full rounded-xl border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 border cursor-text text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Gender</label>
                              <select
                                value={editForm.gender}
                                onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                                className="w-full rounded-xl border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 border cursor-pointer text-sm"
                              >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                          </div>
                          <div className="pt-2">
                            <button
                              onClick={handleUpdateProfile}
                              disabled={savingProfile}
                              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-sm cursor-pointer disabled:opacity-70"
                            >
                              {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                              {savingProfile ? 'Saving...' : 'Save Changes'}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Medical Assessment History</h2>
              </div>
              {records.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
                  <div className="inline-flex items-center justify-center p-4 bg-blue-50 rounded-full mb-4">
                    <History className="h-10 w-10 text-blue-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">No records found</h2>
                  <p className="text-slate-500 mb-6 max-w-md mx-auto">
                    Start your first assessment to see your health history!
                  </p>
                  <button
                    onClick={onNewAssessment}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm transition-all cursor-pointer"
                  >
                    Start Assessment
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <MedicalHistoryTimeline records={records} />
              )}
            </div>
          )}
        </div>
      </main>

      {/* Floating AI Health Assistant */}
      {records.length > 0 && <ChatBot latestRecord={records[0]} />}
    </div>
  );
}
