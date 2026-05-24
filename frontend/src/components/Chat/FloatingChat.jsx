import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2 } from 'lucide-react';

export default function FloatingChat() {
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
      
      const response = await fetch('https://steppeguard.onrender.com/api/chat', {
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
        className={`fixed bottom-6 right-6 p-4 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all z-50 ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        <MessageSquare size={24} />
      </button>

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50">
          <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
            <h3 className="font-bold text-slate-100 flex items-center gap-2">
              <MessageSquare size={18} className="text-blue-400" />
              SteppeGuard AI
            </h3>
            <div className="flex items-center gap-2">
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-slate-700 text-xs text-white rounded px-2 py-1 outline-none border border-slate-600 focus:border-blue-500"
              >
                <option value="English">English</option>
                <option value="Kazakh">Қазақша</option>
                <option value="Russian">Русский</option>
              </select>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-xl p-3 text-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 text-slate-400 border border-slate-700 rounded-xl rounded-bl-none p-3">
                  <Loader2 size={16} className="animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-slate-800 border-t border-slate-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about risk predictions..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
