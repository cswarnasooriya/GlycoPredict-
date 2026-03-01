import { useState, useEffect, FormEvent } from 'react';
import { LogOut, Users, Activity, FileText, Plus, Edit, Trash2, ArrowLeft, Loader2, TrendingUp, Calendar, BellRing, Stethoscope } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { getBlogs, createBlog, updateBlog, deleteBlog, BlogPost } from '../services/blogService';
import AdminPatients from './AdminPatients';
import AdminTrending from './AdminTrending';
import AdminEvents from './AdminEvents';
import AdminNotes from './AdminNotes';
import AssessmentForm from './AssessmentForm';

interface AdminDashboardProps {
  onLogout: () => void;
  onBackToHome: () => void;
  initialTab?: 'patients' | 'blogs' | 'trending' | 'events' | 'notes' | 'assessment';
}

export default function AdminDashboard({ onLogout, onBackToHome, initialTab = 'patients' }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'patients' | 'blogs' | 'trending' | 'events' | 'notes' | 'assessment'>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', imageUrl: '', category: '', content: '' });

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const data = await getBlogs();
      setBlogs(data);
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onLogout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleOpenForm = (blog?: BlogPost) => {
    if (blog) {
      setEditingBlog(blog);
      setFormData({ title: blog.title, imageUrl: blog.imageUrl, category: blog.category, content: blog.content });
    } else {
      setEditingBlog(null);
      setFormData({ title: '', imageUrl: '', category: '', content: '' });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingBlog(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingBlog && editingBlog.id) {
        await updateBlog(editingBlog.id, formData);
      } else {
        await createBlog(formData as BlogPost);
      }
      handleCloseForm();
      fetchBlogs();
    } catch (error) {
      console.error('Error saving blog:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await deleteBlog(id);
        fetchBlogs();
      } catch (error) {
        console.error('Error deleting blog:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Activity className="h-6 w-6 text-indigo-600" />
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">GlycoPredict</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('patients')}
            className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl font-medium transition-colors cursor-pointer ${activeTab === 'patients' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <Users className="h-5 w-5" />
            Patient Records
          </button>
          <button 
            onClick={() => setActiveTab('assessment')}
            className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl font-medium transition-colors cursor-pointer ${activeTab === 'assessment' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <Stethoscope className="h-5 w-5" />
            Health Assessment
          </button>
          <button 
            onClick={() => setActiveTab('blogs')}
            className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl font-medium transition-colors cursor-pointer ${activeTab === 'blogs' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <FileText className="h-5 w-5" />
            Blog Manager
          </button>
          <button 
            onClick={() => setActiveTab('trending')}
            className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl font-medium transition-colors cursor-pointer ${activeTab === 'trending' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <TrendingUp className="h-5 w-5" />
            Trending Topics
          </button>
          <button 
            onClick={() => setActiveTab('events')}
            className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl font-medium transition-colors cursor-pointer ${activeTab === 'events' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <Calendar className="h-5 w-5" />
            Upcoming Events
          </button>
          <button 
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl font-medium transition-colors cursor-pointer ${activeTab === 'notes' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <BellRing className="h-5 w-5" />
            Special Notes
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
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl font-medium transition-colors cursor-pointer"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-5 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
            <p className="text-sm text-slate-500">Manage patient records and system insights.</p>
          </div>
          {activeTab === 'blogs' && !isFormOpen && (
            <button 
              onClick={() => handleOpenForm()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              New Article
            </button>
          )}
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {activeTab === 'patients' && <AdminPatients />}
          {activeTab === 'trending' && <AdminTrending />}
          {activeTab === 'events' && <AdminEvents />}
          {activeTab === 'notes' && <AdminNotes />}
          {activeTab === 'assessment' && (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <AssessmentForm user={auth.currentUser} />
            </div>
          )}

          {activeTab === 'blogs' && (
            <>
              {isFormOpen ? (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800">{editingBlog ? 'Edit Article' : 'Create New Article'}</h3>
                        <button 
                          onClick={handleCloseForm}
                          className="text-slate-500 hover:text-slate-700 cursor-pointer"
                        >
                          Cancel
                        </button>
                  </div>
                  <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                        <input
                          type="text"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                          placeholder="e.g., Nutrition, Research, Wellness"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
                        <input
                          type="url"
                          value={formData.imageUrl}
                          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Content (Markdown Supported)</label>
                        <textarea
                          value={formData.content}
                          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                          rows={12}
                          className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm cursor-pointer"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={handleCloseForm}
                        className="px-6 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium cursor-pointer"
                      >
                        {editingBlog ? 'Update Article' : 'Publish Article'}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  {loading ? (
                    <div className="p-12 flex justify-center">
                      <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                    </div>
                  ) : blogs.length === 0 ? (
                    <div className="p-12 text-center">
                      <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-900">No articles yet</h3>
                      <p className="text-slate-500 mt-1">Get started by creating a new health resource article.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                            <th className="px-6 py-4 font-medium">Article</th>
                            <th className="px-6 py-4 font-medium">Category</th>
                            <th className="px-6 py-4 font-medium">Date</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm">
                          {blogs.map((blog) => {
                            const date = blog.createdAt && typeof (blog.createdAt as any).toDate === 'function' 
                              ? (blog.createdAt as any).toDate().toLocaleDateString() 
                              : 'Unknown';
                              
                            return (
                              <tr key={blog.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors cursor-pointer">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                                      {blog.imageUrl ? (
                                        <img src={blog.imageUrl} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                                      ) : (
                                        <FileText className="h-5 w-5 text-slate-400 m-2.5" />
                                      )}
                                    </div>
                                    <span className="font-medium text-slate-900 line-clamp-1">{blog.title}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                                    {blog.category}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-slate-600">{date}</td>
                                <td className="px-6 py-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button 
                                      onClick={() => handleOpenForm(blog)}
                                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                      title="Edit"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </button>
                                    <button 
                                      onClick={() => blog.id && handleDelete(blog.id)}
                                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                      title="Delete"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
