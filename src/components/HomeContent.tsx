import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { motion } from 'motion/react';
import { ArrowRight, Calendar, BellRing, TrendingUp, Edit, BookOpen } from 'lucide-react';
import { BlogPost } from '../services/blogService';
import { TrendingTopic, UpcomingEvent, SpecialNote } from '../services/cmsService';

interface HomeContentProps {
  userRole: string | null;
  onReadMoreBlog: (blog: BlogPost) => void;
  onNavigateToAdmin: (tab: string) => void;
}

export default function HomeContent({ userRole, onReadMoreBlog, onNavigateToAdmin }: HomeContentProps) {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [notes, setNotes] = useState<SpecialNote[]>([]);

  useEffect(() => {
    const unsubBlogs = onSnapshot(query(collection(db, 'blogs'), orderBy('createdAt', 'desc'), limit(6)), (snapshot) => {
      setBlogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost)));
    });
    const unsubTopics = onSnapshot(query(collection(db, 'trendingTopics'), orderBy('createdAt', 'desc'), limit(4)), (snapshot) => {
      setTopics(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TrendingTopic)));
    });
    const unsubEvents = onSnapshot(query(collection(db, 'upcomingEvents'), orderBy('createdAt', 'desc'), limit(3)), (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UpcomingEvent)));
    });
    const unsubNotes = onSnapshot(query(collection(db, 'specialNotes'), orderBy('createdAt', 'desc'), limit(3)), (snapshot) => {
      setNotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SpecialNote)));
    });

    return () => {
      unsubBlogs();
      unsubTopics();
      unsubEvents();
      unsubNotes();
    };
  }, []);

  return (
    <div className="bg-slate-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-24">

        {/* Special Notes & Trending Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Special Notes */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <BellRing className="h-6 w-6 text-amber-500" />
                Notice Board
              </h2>
              {userRole === 'admin' && (
                <button onClick={() => onNavigateToAdmin('notes')} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer">
                  <Edit className="h-4 w-4" /> Edit
                </button>
              )}
            </div>
            <div className="flex flex-col gap-4">
              {notes.map((note) => (
                <motion.div
                  key={note.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-amber-50 border border-amber-100 p-5 rounded-2xl shadow-sm cursor-pointer"
                >
                  <h3 className="font-bold text-amber-900 mb-1">{note.title}</h3>
                  <p className="text-sm text-amber-700">{note.content}</p>
                </motion.div>
              ))}
              {notes.length === 0 && <p className="text-slate-500 text-sm">No new notices.</p>}
            </div>
          </div>

          {/* Trending Topics */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-indigo-500" />
                Trending Topics
              </h2>
              {userRole === 'admin' && (
                <button onClick={() => onNavigateToAdmin('trending')} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer">
                  <Edit className="h-4 w-4" /> Edit
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {topics.map((topic) => (
                <motion.div
                  key={topic.id}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm cursor-pointer relative overflow-hidden group"
                >
                  {topic.isTrending && (
                    <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                      Hot
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{topic.title}</h3>
                  <p className="text-sm text-slate-600 line-clamp-3">{topic.content}</p>
                </motion.div>
              ))}
              {topics.length === 0 && <p className="text-slate-500 text-sm">No trending topics.</p>}
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="h-6 w-6 text-emerald-500" />
              Upcoming Events
            </h2>
            {userRole === 'admin' && (
              <button onClick={() => onNavigateToAdmin('events')} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer">
                <Edit className="h-4 w-4" /> Edit
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map((event) => (
              <motion.div
                key={event.id}
                whileHover={{ scale: 1.05 }}
                className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl shadow-sm cursor-pointer"
              >
                <div className="text-emerald-600 font-bold text-sm mb-2">{event.date}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{event.title}</h3>
                <p className="text-sm text-slate-600">{event.description}</p>
              </motion.div>
            ))}
            {events.length === 0 && <p className="text-slate-500 text-sm">No upcoming events.</p>}
          </div>
        </div>

        {/* Health Blogs */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-500" />
              Health Resources
            </h2>
            {userRole === 'admin' && (
              <button onClick={() => onNavigateToAdmin('blogs')} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer">
                <Edit className="h-4 w-4" /> Edit
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <motion.article
                key={blog.id}
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-start justify-between bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm cursor-pointer group"
                onClick={() => onReadMoreBlog(blog)}
              >
                <div className="relative w-full">
                  <img
                    src={blog.imageUrl || `https://picsum.photos/seed/${blog.title.replace(/\s+/g, '')}/600/400`}
                    alt={blog.title}
                    className="aspect-[3/2] w-full object-cover bg-slate-100 group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 rounded-t-3xl ring-1 ring-inset ring-slate-900/10" />
                </div>
                <div className="p-6 flex flex-col flex-1 w-full">
                  <div className="flex items-center gap-x-4 text-xs mb-4">
                    <span className="relative z-10 rounded-full bg-indigo-50 px-3 py-1.5 font-medium text-indigo-700">
                      {blog.category}
                    </span>
                  </div>
                  <div className="group relative flex-1">
                    <h3 className="mt-3 text-xl font-bold leading-6 text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {blog.title}
                    </h3>
                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
                      {blog.content.substring(0, 150)}...
                    </p>
                  </div>
                  <div className="mt-6 flex items-center gap-x-2 text-sm font-medium text-blue-600">
                    Read More <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </motion.article>
            ))}
            {blogs.length === 0 && <p className="text-slate-500 text-sm">No articles available.</p>}
          </div>
        </div>

      </div>
    </div>
  );
}
