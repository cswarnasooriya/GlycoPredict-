import { motion } from 'motion/react';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';
import { BlogPost } from '../services/blogService';

interface BlogReaderProps {
  blog: BlogPost;
  onBack: () => void;
}

export default function BlogReader({ blog, onBack }: BlogReaderProps) {
  const date = blog.createdAt && typeof (blog.createdAt as any).toDate === 'function' 
    ? (blog.createdAt as any).toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Recently Published';

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-900">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        <button 
          onClick={onBack}
          className="mb-8 inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </button>

        <article className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="relative h-64 sm:h-96 w-full">
            <img 
              src={blog.imageUrl || `https://picsum.photos/seed/${blog.title.replace(/\s+/g, '')}/1200/800`}
              alt={blog.title} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6 sm:p-10 w-full">
              <div className="flex items-center gap-4 mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-500 text-white shadow-sm">
                  <Tag className="w-4 h-4 mr-1.5" />
                  {blog.category}
                </span>
                <span className="inline-flex items-center text-sm font-medium text-slate-200">
                  <Calendar className="w-4 h-4 mr-1.5" />
                  {date}
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold text-white leading-tight">
                {blog.title}
              </h1>
            </div>
          </div>
          
          <div className="p-6 sm:p-10 lg:p-12 prose prose-lg prose-blue max-w-none">
            <div dangerouslySetInnerHTML={{ __html: formatMarkdown(blog.content) }} />
          </div>
        </article>
      </motion.div>
    </div>
  );
}

// Simple markdown formatter
function formatMarkdown(text: string) {
  let html = text
    .replace(/^### (.*$)/gim, '<h3 class="text-2xl font-bold mt-8 mb-4 text-slate-800">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-3xl font-bold mt-10 mb-5 text-slate-900">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-4xl font-bold mt-12 mb-6 text-slate-900">$1</h1>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/^\* (.*$)/gim, '<li class="ml-6 list-disc mb-2">$1</li>')
    .replace(/^- (.*$)/gim, '<li class="ml-6 list-disc mb-2">$1</li>')
    .replace(/\n/gim, '<br />');
  
  html = html.replace(/(<br \/>){2,}/gim, '<br /><br />');
  return html;
}
