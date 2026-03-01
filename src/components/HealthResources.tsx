import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Loader2, BookOpen } from 'lucide-react';
import { getBlogs, BlogPost } from '../services/blogService';

interface HealthResourcesProps {
  onReadMore: (blog: BlogPost) => void;
}

export default function HealthResources({ onReadMore }: HealthResourcesProps) {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const data = await getBlogs();
        setBlogs(data);
      } catch (error) {
        console.error('Failed to fetch blogs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center bg-white">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (blogs.length === 0) {
    return null;
  }

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-full mb-4">
            <BookOpen className="h-6 w-6 text-indigo-600" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Health Resources</h2>
          <p className="mt-2 text-lg leading-8 text-slate-600">
            Learn how to manage your health with our expert-curated articles and insights.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-12 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {blogs.slice(0, 6).map((blog, index) => (
            <motion.article 
              key={blog.id} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col items-start justify-between bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="relative w-full">
                <img
                  src={blog.imageUrl || `https://picsum.photos/seed/${blog.title.replace(/\s+/g, '')}/600/400`}
                  alt={blog.title}
                  className="aspect-[16/9] w-full object-cover bg-slate-100 sm:aspect-[2/1] lg:aspect-[3/2] group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 rounded-t-3xl ring-1 ring-inset ring-slate-900/10" />
              </div>
              <div className="p-6 sm:p-8 flex flex-col flex-1 w-full">
                <div className="flex items-center gap-x-4 text-xs mb-4">
                  <span className="relative z-10 rounded-full bg-indigo-100 px-3 py-1.5 font-medium text-indigo-700">
                    {blog.category}
                  </span>
                </div>
                <div className="group relative flex-1">
                  <h3 className="mt-3 text-xl font-bold leading-6 text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    <button onClick={() => onReadMore(blog)}>
                      <span className="absolute inset-0" />
                      {blog.title}
                    </button>
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
        </div>
      </div>
    </div>
  );
}
