import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, Calendar, Activity, Edit2, X, Loader2, Save, ShieldCheck, CheckCircle } from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../utils/firebase';

interface UserProfileData {
  name: string;
  email: string;
  role: string;
  createdAt: any;
  age?: number | string;
  gender?: string;
}

export default function UserProfile() {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', age: '', gender: 'Male' });
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth.currentUser) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data() as UserProfileData;
          setProfile(data);
          setEditForm({
            name: data.name || '',
            age: data.age?.toString() || '',
            gender: data.gender || 'Male'
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    if (!auth.currentUser) return;
    setSaving(true);
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        name: editForm.name,
        age: editForm.age,
        gender: editForm.gender
      });
      setProfile(prev => prev ? { ...prev, name: editForm.name, age: editForm.age, gender: editForm.gender } : null);
      setIsEditing(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setEditForm({
        name: profile.name || '',
        age: profile.age?.toString() || '',
        gender: profile.gender || 'Male'
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  const joinedDate = profile.createdAt && typeof profile.createdAt.toDate === 'function'
    ? profile.createdAt.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Unknown';

  return (
    <div className="max-w-4xl mx-auto space-y-8 relative">
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
            <span className="font-medium">Profile updated successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-blue-100 p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg border-4 border-white">
            {profile.name?.charAt(0) || profile.email?.charAt(0).toUpperCase()}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-3xl font-bold text-slate-800 mb-1">{profile.name || 'User'}</h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm text-slate-500">
              <span className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full">
                <ShieldCheck className="h-4 w-4 text-indigo-500" />
                Patient ID: {auth.currentUser?.uid.substring(0, 8).toUpperCase()}
              </span>
              <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium capitalize">
                {profile.role}
              </span>
            </div>
          </div>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-xl font-medium transition-all shadow-sm cursor-pointer"
            >
              <Edit2 className="h-4 w-4" />
              Edit Profile
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-medium transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all shadow-sm cursor-pointer disabled:opacity-70"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Personal Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Account Details */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8"
        >
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-500" />
            Account Details
          </h2>
          <div className="space-y-6">
            <motion.div layout>
              <p className="text-sm font-medium text-slate-500 mb-2 flex items-center gap-2">
                <User className="h-4 w-4" /> Full Name
              </p>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border cursor-text transition-all"
                  placeholder="Enter your full name"
                />
              ) : (
                <p className="text-lg font-semibold text-slate-800">{profile.name || 'Not set'}</p>
              )}
            </motion.div>
            <motion.div layout>
              <p className="text-sm font-medium text-slate-500 mb-2 flex items-center gap-2">
                <Mail className="h-4 w-4" /> Email Address
              </p>
              <div className="relative">
                <p className="text-lg font-semibold text-slate-800">{profile.email}</p>
                {isEditing && (
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                    Read-only
                  </span>
                )}
              </div>
            </motion.div>
            <motion.div layout>
              <p className="text-sm font-medium text-slate-500 mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Joined Date
              </p>
              <p className="text-lg font-semibold text-slate-800">{joinedDate}</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Health Baseline */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8"
        >
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-500" />
            Health Baseline
          </h2>
          <div className="space-y-6">
            <motion.div layout>
              <p className="text-sm font-medium text-slate-500 mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Age
              </p>
              {isEditing ? (
                <input
                  type="number"
                  value={editForm.age}
                  onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                  className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border cursor-text transition-all"
                  placeholder="Enter your age"
                />
              ) : (
                <p className="text-lg font-semibold text-slate-800">{profile.age ? `${profile.age} years` : 'Not set'}</p>
              )}
            </motion.div>
            <motion.div layout>
              <p className="text-sm font-medium text-slate-500 mb-2 flex items-center gap-2">
                <User className="h-4 w-4" /> Gender
              </p>
              {isEditing ? (
                <select
                  value={editForm.gender}
                  onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                  className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border cursor-pointer transition-all"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <p className="text-lg font-semibold text-slate-800">{profile.gender || 'Not set'}</p>
              )}
            </motion.div>

            <motion.div layout className="p-4 bg-blue-50 rounded-xl border border-blue-100 mt-4">
              <p className="text-sm text-blue-800">
                This baseline information helps our AI provide more accurate and personalized health insights during your assessments.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
