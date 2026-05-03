import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Bot, Sparkles, Plus, BookOpen, GraduationCap, Brain, Shield, ArrowRight, LogIn } from 'lucide-react';
import { streamChat } from '@/services/geminiService';
import { cn } from '@/lib/utils';
import { auth, db, signInWithGoogle } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  doc, 
  setDoc,
  getDoc,
  getDocs,
  limit,
  updateDoc
} from 'firebase/firestore';

interface Message {
  role: 'user' | 'model';
  content: string;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
};

export default function Professor() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setMessages([]);
        setChatId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Load or Create Chat Session
  useEffect(() => {
    if (!user) return;

    const findOrCreateChat = async () => {
      const chatsPath = 'chats';
      try {
        const q = query(
          collection(db, chatsPath), 
          where('userId', '==', user.uid),
          orderBy('updatedAt', 'desc'),
          limit(1)
        );
        const querySnapshot = await getDocs(q);
        
        let activeChatId: string;
        if (querySnapshot.empty) {
          const newChatRef = doc(collection(db, chatsPath));
          activeChatId = newChatRef.id;
          await setDoc(newChatRef, {
            userId: user.uid,
            updatedAt: serverTimestamp(),
            lastMessage: 'Session started'
          });
        } else {
          activeChatId = querySnapshot.docs[0].id;
        }
        setChatId(activeChatId);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, chatsPath);
      }
    };

    findOrCreateChat();
  }, [user]);

  // Subscribe to Messages
  useEffect(() => {
    if (!chatId || !user) return;

    const messagesPath = `chats/${chatId}/messages`;
    const q = query(collection(db, messagesPath), orderBy('createdAt', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages = snapshot.docs.map(doc => ({
        role: doc.data().role as 'user' | 'model',
        content: doc.data().content as string
      }));
      setMessages(loadedMessages);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, messagesPath);
    });

    return () => unsubscribe();
  }, [chatId, user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, streamingContent]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading || !user || !chatId) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    setStreamingContent('');

    const messagesPath = `chats/${chatId}/messages`;
    const chatPath = `chats/${chatId}`;

    try {
      // 1. Save user message to Firestore
      await addDoc(collection(db, messagesPath), {
        role: 'user',
        content: userMessage,
        createdAt: serverTimestamp()
      });

      // 2. Prepare history for Gemini
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      // 3. Get AI response (streaming)
      let assistantMessage = '';
      const prompt = `Act as Professor Luther. User: ${userMessage}`;
      const stream = streamChat(prompt, history);

      for await (const chunk of stream) {
        assistantMessage += chunk.text;
        setStreamingContent(assistantMessage);
      }

      // 4. Save final AI message to Firestore
      await addDoc(collection(db, messagesPath), {
        role: 'model',
        content: assistantMessage,
        createdAt: serverTimestamp()
      });

      // 5. Update session metadata
      await updateDoc(doc(db, chatPath), {
        updatedAt: serverTimestamp(),
        lastMessage: assistantMessage.slice(0, 100)
      });

      setStreamingContent('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, messagesPath);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="professor-page" className="flex flex-col h-full bg-[#0a0a0a] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,#1e84ff10,transparent_50%)]" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-4xl flex flex-col items-center space-y-4">
          
          {/* Group Image and Nameplate */}
          <div className="flex flex-col items-center scale-90 sm:scale-100">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] relative bg-[#111] p-3 sm:p-4 rounded-[2.5rem] border-2 border-[#222] shadow-[0_40px_100px_rgba(0,0,0,0.5)] flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-accent-blue/5 blur-[80px] rounded-full animate-pulse pointer-events-none" />
              <div className="relative h-full w-full rounded-[1.5rem] border-2 border-[#333] overflow-hidden">
                <img 
                  src="/input_file_1.png" 
                  alt="Professor Luther" 
                  className="h-full object-cover"
                  style={{ width: '100%', paddingLeft: '-9px' }}
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>

            {/* Nameplate Style */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="w-[300px] sm:w-[400px] mt-3 py-2 bg-black border-2 border-[#333] rounded-2xl shadow-2xl text-center relative z-20"
            >
               <h2 className="text-chrome font-display font-black tracking-tighter italic text-lg sm:text-xl uppercase">Professor Luther</h2>
               <p className="text-[#666] text-[7px] sm:text-[8px] font-black tracking-[0.4em] uppercase mt-1">PhD, Paws-ophy • Research Lead</p>
            </motion.div>
          </div>

          {/* Messages Container - Stylized as a "Text Box" */}
          <div className="w-full max-w-2xl h-[160px] sm:h-[180px] bg-[#0c0c0c] border-2 border-[#222] rounded-3xl p-4 sm:p-5 overflow-y-auto scrollbar-hide relative shadow-inner">
            {!user ? (
               <div className="h-full flex flex-col items-center justify-center text-center space-y-2">
                  <p className="text-[#333] text-[9px] font-black uppercase tracking-[0.4em]">Authorization Required</p>
                  <button 
                    onClick={signInWithGoogle}
                    className="flex items-center gap-2 bg-white text-black px-5 py-2 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-xl text-xs sm:text-sm"
                  >
                    <LogIn size={16} />
                    Neural Link Login
                  </button>
               </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {messages.length === 0 && !streamingContent ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center space-y-2"
                  >
                    <p className="text-[#333] text-[9px] font-black uppercase tracking-[0.4em]">Status: Active</p>
                    <p className="text-[#555] text-[11px] sm:text-xs italic font-serif max-w-sm">
                      "Greetings. I am Professor Luther. Please submit your theoretical inquiries for validation."
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((message, i) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={i} 
                        className={cn(
                          "p-3 rounded-xl border",
                          message.role === 'user' 
                            ? "bg-[#111] border-[#222] ml-auto max-w-[85%]" 
                            : "bg-[#050505] border-accent-blue/10 w-full"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className={cn(
                            "text-[6px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full",
                            message.role === 'user' ? "bg-[#333] text-[#999]" : "bg-white text-black"
                          )}>
                            {message.role === 'user' ? "Inquiry" : "Prof. Luther"}
                          </div>
                        </div>
                        <p className={cn(
                          "leading-relaxed text-xs whitespace-pre-wrap",
                          message.role === 'model' ? "text-black italic bg-[#e4d7d7] border-dashed border-2 border-black/20 p-2 rounded-lg" : "text-[#777]"
                        )}>
                          {message.content}
                        </p>
                      </motion.div>
                    ))}
                    {streamingContent && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-xl border bg-[#050505] border-accent-blue/10 w-full"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className="text-[6px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-white text-black">
                            Prof. Luther
                          </div>
                        </div>
                        <p className="leading-relaxed text-xs whitespace-pre-wrap text-black italic bg-[#e4d7d7] border-dashed border-2 border-black/20 p-2 rounded-lg">
                          {streamingContent}
                        </p>
                      </motion.div>
                    )}
                  </div>
                )}
              </AnimatePresence>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Controls */}
          {user && messages.length > 0 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={async () => {
                const chatsPath = 'chats';
                const newChatRef = doc(collection(db, chatsPath));
                setChatId(newChatRef.id);
                await setDoc(newChatRef, {
                  userId: user.uid,
                  updatedAt: serverTimestamp(),
                  lastMessage: 'New session'
                });
              }}
              className="text-[8px] font-black uppercase tracking-widest text-[#444] hover:text-white transition-colors flex items-center gap-2"
            >
              <Plus size={10} />
              Reset Neural Link
            </motion.button>
          )}

          {/* Simple Question Box */}
          <div className="w-full max-w-2xl">
            <form onSubmit={handleSubmit} className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-accent-blue/30 via-accent-blue/10 to-accent-blue/30 rounded-2xl blur opacity-30 group-focus-within:opacity-100 transition duration-1000" />
              <div className="relative bg-black rounded-2xl border-2 border-[#222] flex items-center p-1">
                <input 
                  type="text" 
                  value={input}
                  disabled={!user || isLoading}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={user ? "Inquire with the Professor..." : "Login to begin research..."}
                  className="flex-1 bg-transparent border-none text-chrome focus:ring-0 px-6 py-3 text-sm placeholder-[#333] disabled:opacity-30"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isLoading || !user}
                  className="bg-white text-black p-3 rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isLoading ? (
                    <div className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
                  ) : (
                    <ArrowRight size={18} />
                  )}
                </button>
              </div>
            </form>
            <div className="text-center mt-4">
              <p className="text-[8px] font-black uppercase tracking-[0.6em] text-[#222]">{user ? "NEURAL LINK ACTIVE" : "CONNECTION OFFLINE"}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

