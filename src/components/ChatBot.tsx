import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, Send, X, Loader2, Brain } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { PatientRecord } from '../services/patientService';
import { GoogleGenerativeAI } from '@google/generative-ai';

const ai = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatBotProps {
  latestRecord: PatientRecord | null;
}

// Simple markdown formatter
function formatMarkdown(text: string) {
  let html = text
    .replace(/^### (.*$)/gim, '<h4 class="text-md font-bold mt-2 mb-1 text-slate-800">$1</h4>')
    .replace(/^## (.*$)/gim, '<h3 class="text-lg font-bold mt-3 mb-2 text-slate-900">$1</h3>')
    .replace(/^# (.*$)/gim, '<h2 class="text-xl font-bold mt-3 mb-2 text-slate-900">$1</h2>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/^\* (.*$)/gim, '<li class="ml-4 list-disc mb-1">$1</li>')
    .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc mb-1">$1</li>')
    .replace(/\n/gim, '<br />');
  
  html = html.replace(/(<br \/>){2,}/gim, '<br /><br />');
  return html;
}

export default function ChatBot({ latestRecord }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Initial greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: 'Hello! I am your Gemini Health Assistant. How can I help you understand your health data today?'
        }
      ]);
    }
  }, [isOpen, messages.length]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      let context = 'You are a helpful AI Health Assistant for GlycoPredict. ';
      
      if (latestRecord) {
        context += `
          The user's latest medical profile is:
          - Age: ${latestRecord.age}
          - Gender: ${latestRecord.gender}
          - BMI: ${latestRecord.bmi}
          - HbA1c: ${latestRecord.hba1c}%
          - Glucose (Urea proxy): ${latestRecord.urea}
          - Cholesterol: ${latestRecord.chol}
          - Risk Level: ${latestRecord.riskLevel}
          
          Use this context to provide personalized, specific answers. Do not ask for this data again. 
          If they ask "Why is my risk high?", explain based on these values.
          Keep answers concise, professional, and empathetic. Format with markdown if needed.
        `;
      } else {
        context += 'The user has not taken a health assessment yet. Encourage them to take one.';
      }

      // Prepare chat history for Gemini
      const chatHistory = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      // Add the new user message
      chatHistory.push({
        role: 'user',
        parts: [{ text: input.trim() }]
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: chatHistory,
        config: {
          systemInstruction: context,
        }
      });

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text || 'I am sorry, I could not process that request.'
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error connecting to the AI service. Please try again later.'
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-indigo-100 overflow-hidden flex flex-col h-[500px] max-h-[80vh] ring-1 ring-indigo-500/20"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex justify-between items-center">
              <div className="flex items-center gap-2 text-white">
                <Brain className="h-5 w-5" />
                <span className="font-semibold">Gemini Health Assistant</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-sm' 
                        : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm prose prose-sm prose-indigo'
                    }`}
                    dangerouslySetInnerHTML={{ __html: msg.role === 'user' ? msg.content : formatMarkdown(msg.content) }}
                  />
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 text-slate-500 p-3 rounded-2xl rounded-tl-sm shadow-sm text-sm flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                    Gemini is analyzing...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1 pr-2 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask about your health data..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-3 py-2 outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 flex items-center justify-center cursor-pointer relative group"
      >
        <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </motion.button>
    </div>
  );
}
