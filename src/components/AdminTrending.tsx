import { useState, useEffect, FormEvent } from 'react';
import { Loader2, Plus, Edit, Trash2, TrendingUp } from 'lucide-react';
import { cmsService, TrendingTopic } from '../services/cmsService';
import { motion } from 'motion/react';

export default function AdminTrending() {
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<TrendingTopic | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '', isTrending: false });

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const data = await cmsService.getTrendingTopics();
      setTopics(data);
    } catch (error) {
      console.error('Failed to fetch trending topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (topic?: TrendingTopic) => {
    if (topic) {
      setEditingTopic(topic);
      setFormData({ title: topic.title, content: topic.content, isTrending: topic.isTrending });
    } else {
      setEditingTopic(null);
      setFormData({ title: '', content: '', isTrending: false });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTopic(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingTopic && editingTopic.id) {
        await cmsService.updateTrendingTopic(editingTopic.id, formData);
      } else {
        await cmsService.createTrendingTopic(formData);
      }
      handleCloseForm();
      fetchTopics();
    } catch (error) {
      console.error('Error saving trending topic:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this topic?')) {
      try {
        await cmsService.deleteTrendingTopic(id);
        fetchTopics();
      } catch (error) {
        console.error('Error deleting topic:', error);
      }
    }
  };

  if (isFormOpen) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">{editingTopic ? 'Edit Trending Topic' : 'Create New Trending Topic'}</h3>
          <button onClick={handleCloseForm} className="text-slate-500 hover:text-slate-700 cursor-pointer">Cancel</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6">
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isTrending"
                checked={formData.isTrending}
                onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer"
              />
              <label htmlFor="isTrending" className="text-sm font-medium text-slate-700 cursor-pointer">
                Mark as Trending
              </label>
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
              {editingTopic ? 'Update Topic' : 'Publish Topic'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Trending Topics</h2>
        <button 
          onClick={() => handleOpenForm()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          New Topic
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
          </div>
        ) : topics.length === 0 ? (
          <div className="p-12 text-center">
            <TrendingUp className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No trending topics yet</h3>
            <p className="text-slate-500 mt-1">Get started by creating a new topic.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                  <th className="px-6 py-4 font-medium">Topic</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {topics.map((topic, index) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={topic.id} 
                    className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{topic.title}</div>
                      <div className="text-slate-500 text-xs line-clamp-1">{topic.content}</div>
                    </td>
                    <td className="px-6 py-4">
                      {topic.isTrending ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Trending
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                          Normal
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenForm(topic)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => topic.id && handleDelete(topic.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
