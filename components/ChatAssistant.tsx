import React, { useState, useRef, useEffect } from 'react';
import { chatWithWeldingExpert } from '../services/gemini';
import { ChatMessage } from '../types';
import { Send, User, Bot, Trash2 } from 'lucide-react';

const ChatAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Привет! Я твой наставник по сварке. Спрашивай про настройки тока, выбор электродов, технику шва или как не нахвататься зайчиков. Чем помочь?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input.trim()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare history for Gemini
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      // Add current message to history context for the call
      // Note: In a real chat loop with history managed by the Chat object in service, 
      // we usually just send the new message. But here our service function 
      // recreates the chat session with history each time for statelessness simplicity in this demo structure.
      // Optimally, we'd keep the chat object instance alive in a useRef or Context.
      // For this implementation, let's pass the accumulated history.
      
      const responseText = await chatWithWeldingExpert(userMsg.text, history);

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: 'Извини, что-то искра проскочила не там. Попробуй еще раз (ошибка сети или API).'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([messages[0]]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
           <Bot className="text-orange-500" /> ИИ Наставник
        </h2>
        <button 
          onClick={clearChat}
          className="text-slate-500 hover:text-red-400 transition-colors p-2"
          title="Очистить чат"
        >
          <Trash2 size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-800/50 rounded-2xl p-4 border border-slate-700 mb-4 space-y-4">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center shrink-0
              ${msg.role === 'user' ? 'bg-orange-600' : 'bg-slate-600'}
            `}>
              {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
            </div>
            <div className={`
              max-w-[80%] rounded-2xl p-4 text-sm md:text-base leading-relaxed
              ${msg.role === 'user' 
                ? 'bg-orange-600/20 border border-orange-500/30 text-slate-100 rounded-tr-none' 
                : 'bg-slate-700 border border-slate-600 text-slate-200 rounded-tl-none'}
            `}>
              {/* Simple Markdown Rendering Support for basic formatting */}
              {msg.text.split('\n').map((line, i) => (
                <p key={i} className="min-h-[1rem]">{line}</p>
              ))}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
             <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center shrink-0">
               <Bot size={20} />
             </div>
             <div className="bg-slate-700 border border-slate-600 rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce delay-75"></span>
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce delay-150"></span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Спроси про ток, электроды или технику..."
          className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl pl-4 pr-12 py-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
        />
        <button 
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="absolute right-2 top-2 bottom-2 bg-orange-600 hover:bg-orange-500 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:bg-slate-700"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatAssistant;