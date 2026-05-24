import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2 } from 'lucide-react';

export default function FloatingChat() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://steppeguard.onrender.com';
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Сәлеметсіз бе! Здравствуйте! Hello! I am the SteppeGuard AI. Ask me anything about the current risk data or predictions in Kazakh, Russian, or English.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('English');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Remove default greeting from history to save context and start with user message
      const apiMessages = newMessages.filter(m => m.role !== 'assistant' || m.content !== 'Сәлеметсіз бе! Здравствуйте! Hello! I am the SteppeGuard AI. Ask me anything about the current risk data or predictions in Kazakh, Russian, or English.');
      
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages: apiMessages, language: language })
      });
      
      const data = await response.json();
      
      setMessages([...newMessages, { role: 'assistant', content: data.response }]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.6)] hover:bg-blue-500 hover:scale-110 transition-all duration-300 z-50 border-2 border-blue-400/50 ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        <MessageSquare size={24} />
      </button>

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] glass-panel rounded-2xl flex flex-col overflow-hidden z-50 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.8)]">
          <div className="p-4 bg-zinc-900/80 border-b border-white/10 flex justify-between items-center backdrop-blur-xl">
            <h3 className="font-bold text-white flex items-center gap-2 uppercase tracking-widest text-xs">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              Secure Comms
            </h3>
            <div className="flex items-center gap-2">
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-zinc-800 text-[10px] text-zinc-300 rounded uppercase tracking-widest px-2 py-1 outline-none border border-white/5 focus:border-blue-500 transition-colors"
              >
                <option value="English">EN</option>
                <option value="Kazakh">KZ</option>
                <option value="Russian">RU</option>
              </select>
              <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-950/60 custom-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-lg p-3 text-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-sm border border-blue-500/50 shadow-[0_0_15px_rgba(37,99,235,0.3)]' 
                    : 'bg-zinc-800/80 text-zinc-200 border border-white/10 rounded-tl-sm backdrop-blur-md'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-zinc-800/80 text-blue-400 border border-white/10 rounded-lg rounded-tl-sm p-3 backdrop-blur-md flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  <span className="text-[10px] uppercase tracking-widest">Decrypting...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-zinc-900/90 border-t border-white/10 backdrop-blur-xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Enter command..."
                className="flex-1 bg-zinc-950 border border-white/10 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 transition-colors font-mono"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-blue-500/50 shadow-[0_0_10px_rgba(37,99,235,0.4)]"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
