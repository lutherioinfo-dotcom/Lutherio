import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Bot, Sparkles, Plus, Image as ImageIcon } from 'lucide-react';
import { streamChat } from '@/services/geminiService';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    let assistantMessage = '';
    setMessages(prev => [...prev, { role: 'model', content: '' }]);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.content }]
    }));

    try {
      const stream = streamChat(userMessage, history);
      for await (const chunk of stream) {
        assistantMessage += chunk.text;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last.role === 'model') {
            return [...prev.slice(0, -1), { role: 'model', content: assistantMessage }];
          }
          return prev;
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="chat-page" className="flex flex-col h-full items-center">
      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 w-full max-w-4xl overflow-y-auto px-4 py-8 space-y-6 scrollbar-hide"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-10 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-16 h-16 rounded-2xl bg-dark-panel border border-border-dim flex items-center justify-center mb-8 shadow-2xl neon-glow"
            >
              <Sparkles className="text-accent-blue w-8 h-8" />
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-display font-black text-chrome tracking-tighter italic mb-4">
              NEURON CONNECT
            </h1>
            <p className="text-text-dim text-sm uppercase tracking-widest max-w-md">
              Lutherio Intelligence Active. Awaiting academic input.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12 w-full max-w-2xl">
              {[
                "Summarize ethics lecture",
                "Draft thesis abstract",
                "Explain neural networks",
                "Format citations"
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => setInput(suggestion)}
                  className="p-4 rounded-xl border border-border-dim bg-dark-panel hover:bg-dark-surface text-left text-sm text-text-dim transition-all hover:border-accent-blue/30 group"
                >
                  <p className="group-hover:text-text-bright transition-colors uppercase tracking-widest text-[10px] font-bold">{suggestion}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <motion.div
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              key={index}
              className={cn(
                "flex gap-4 p-8 rounded-2xl border",
                message.role === 'user' 
                  ? "bg-dark-surface border-border-active ml-auto max-w-[85%] shadow-xl" 
                  : "bg-dark-panel border-border-dim w-full"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded shrink-0 flex items-center justify-center text-[10px] font-black",
                message.role === 'user' ? "bg-border-highlight text-text-dim" : "bg-white text-black"
              )}>
                {message.role === 'user' ? "US" : "AI"}
              </div>
              <div className="flex-1 space-y-4">
                <h3 className="text-[10px] font-black text-accent-blue uppercase tracking-widest">
                  {message.role === 'model' ? 'System Intelligence' : 'Internal Query'}
                </h3>
                <div className={cn(
                  "leading-relaxed font-medium",
                  message.role === 'model' ? "text-lg text-chrome" : "text-sm text-text-dim"
                )}>
                  {message.content || (isLoading && index === messages.length - 1 && "...") || "Awaiting processing..."}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="w-full max-w-4xl p-8 pb-12">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-accent-blue to-text-ghost rounded-2xl blur opacity-10 group-focus-within:opacity-30 transition-opacity"></div>
          <div className="relative bg-dark-elevated border border-border-active rounded-2xl p-1 shadow-2xl flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit();
                }
              }}
              placeholder="Command Neuron..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-5 py-4 placeholder-text-ghost"
            />
            <div className="flex gap-2 p-2">
              <button
                type="button"
                className="p-3 bg-dark-panel rounded-xl border border-border-highlight hover:bg-dark-surface transition-colors text-text-dim"
              >
                <Plus size={18} />
              </button>
              <button
                id="send-button"
                type="submit"
                onClick={(e) => { e.preventDefault(); handleSubmit(); }}
                disabled={!input.trim() || isLoading}
                className={cn(
                  "px-8 rounded-xl font-black text-xs uppercase tracking-tighter transition-all",
                  input.trim() && !isLoading 
                    ? "bg-white text-black active:scale-95" 
                    : "bg-border-dim text-text-muted cursor-not-allowed"
                )}
              >
                {isLoading ? "..." : "Send"}
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 px-2">
           <div className="flex items-center gap-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-text-ghost">System Health</span>
              <div className="flex gap-1">
                 {[...Array(5)].map((_, i) => (
                   <div key={i} className={cn("h-3 w-1", i < 3 ? "bg-accent-blue" : "bg-accent-blue/20")} />
                 ))}
              </div>
           </div>
           <span className="text-[10px] font-mono text-accent-blue">LAT: 12ms</span>
        </div>
      </div>
    </div>
  );
}
