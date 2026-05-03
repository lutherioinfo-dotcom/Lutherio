import { ReactNode, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { MessageSquare, Mic, Download, Menu, X, Sparkles, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems = [
    { to: '/', icon: BookOpen, label: 'Overview' },
    { to: '/chat', icon: MessageSquare, label: 'Chat Engine' },
    { to: '/professor', icon: Sparkles, label: 'Professor Luther' },
    { to: '/record', icon: Mic, label: 'Note Stream' },
    { to: '/download', icon: Download, label: 'Get Lutherio' },
  ];

  return (
    <div id="aura-app" className="flex h-screen w-full bg-dark-void overflow-hidden">
      {/* Sidebar for Desktop */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className={cn(
          "relative hidden md:flex flex-col border-r border-border-dim bg-dark-panel transition-all duration-300",
          !isSidebarOpen && "items-center"
        )}
      >
        <div className="p-8 flex flex-col gap-1">
          <div className="flex items-center gap-3 pl-0 ml-0">
             <motion.div 
               animate={{ rotateY: 360 }}
               transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
               className="w-[66px] h-auto shrink-0"
             >
                <img 
                  src="/input_file_1.png" 
                  alt="L" 
                  className="w-full h-full object-contain rounded-lg"
                  referrerPolicy="no-referrer"
                />
             </motion.div>
             {isSidebarOpen && (
               <motion.h1
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="text-2xl font-black tracking-tighter italic text-chrome w-[133.922px] -ml-[13px] -mt-[11px] -mb-[5px] pr-[8px] pl-0"
               >
                 LUTHERIO
               </motion.h1>
             )}
          </div>
          {isSidebarOpen && <span className="text-[10px] uppercase tracking-[0.3em] text-text-ghost font-bold">V . 1 . 0 . 1</span>}
        </div>

        <nav className="flex-1 px-5 py-8 space-y-6">
          <div className="text-[11px] uppercase tracking-widest text-text-ghost font-black px-3">
            {isSidebarOpen ? "Operations" : "OP"}
          </div>
          <div className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group text-sm font-medium",
                  isActive 
                    ? "bg-border-dim border border-border-highlight text-text-bright shadow-inner" 
                    : "text-text-dim hover:bg-dark-surface hover:text-text-bright"
                )}
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={cn("w-4 h-4", isActive ? "text-accent-blue" : "")} />
                    {isSidebarOpen && <span>{item.label}</span>}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="p-5 space-y-4">
          {isSidebarOpen && (
            <div className="p-4 rounded-xl border border-border-active bg-dark-surface">
              <p className="text-[10px] text-accent-blue font-bold mb-1">EXTENSION</p>
              <h4 className="text-xs font-bold">Canvas Integrated</h4>
              <p className="text-[10px] text-text-muted mt-1">Ready for sync.</p>
              <button className="mt-3 w-full bg-white text-black text-[10px] font-black py-2 rounded uppercase tracking-tighter hover:bg-text-dim transition-colors">
                Install v1.4
              </button>
            </div>
          )}
          <div className={cn("flex items-center gap-2 px-2", isSidebarOpen ? "opacity-100" : "opacity-0 invisible")}>
            <div className="w-8 h-8 rounded bg-border-dim border border-border-active flex items-center justify-center text-[10px] font-bold">US</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted">User Admin</div>
          </div>
        </div>

        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-20 bg-border-highlight border border-border-active rounded-full p-1 text-text-muted hover:text-text-bright z-50"
        >
          {isSidebarOpen ? <X size={12} /> : <Menu size={12} />}
        </button>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-dark-void">
        {/* Header from design */}
        <header className="h-16 border-b border-border-dim flex items-center justify-between px-8 bg-dark-surface">
           <div className="flex items-center gap-4">
              <span className="text-[10px] font-black tracking-widest uppercase text-text-ghost">System Status:</span>
              <span className="text-[10px] bg-border-dim px-3 py-1 rounded text-text-bright border border-border-active font-mono">ENCRYPTED SESSION</span>
           </div>
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Rec Live</span>
              </div>
           </div>
        </header>
        
        <div className="flex-1 overflow-hidden relative">
          {children}
        </div>
      </main>
    </div>
  );
}
