import { motion } from 'motion/react';
import { Download, Chrome, Layout as CanvasIcon, CheckCircle, ArrowRight, ShieldCheck, Globe } from 'lucide-react';

export default function Downloads() {
  const products = [
    {
      id: 'extension',
      name: 'Lutherio Chrome Extension',
      description: 'Auto-write and cite directly inside Google Docs, Canvas, and research journals.',
      icon: Chrome,
      tags: ['Beta', 'Productivity'],
      version: 'v0.8.2'
    },
    {
      id: 'canvas',
      name: 'Canvas Sync Logic',
      description: 'Automatically import assignment data and lecture notes directly into your brain for analysis.',
      icon: CanvasIcon,
      tags: ['Integration'],
      version: 'v1.0.4'
    },
    {
       id: 'desktop',
       name: 'Lutherio Engine',
       description: 'The full power of Lutherio on your desktop for high-performance research and AI logic.',
       icon: Globe,
       tags: ['Early Access'],
       version: 'Coming Soon'
    }
  ];

  return (
    <div id="downloads-page" className="flex flex-col h-full p-8 md:p-16 overflow-y-auto bg-dark-void">
      <div className="max-w-6xl mx-auto w-full space-y-24">
        
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded border border-border-highlight bg-dark-panel text-text-ghost text-[10px] font-black uppercase tracking-[0.3em]"
          >
            LUTHERIO ECOSYSTEM v1.0
          </motion.div>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-display font-black text-chrome tracking-tighter italic leading-none"
          >
            EXPANDING MIND
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-text-dim text-lg max-w-xl mx-auto uppercase tracking-widest font-medium"
          >
            Technical bridges for the modern Lutherio experience.
          </motion.p>
        </div>

        {/* Product Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 + 0.3 }}
              className="bg-dark-panel border border-border-dim p-10 rounded-2xl flex flex-col items-start gap-8 hover:border-border-active hover:bg-dark-surface transition-all group shadow-2xl"
            >
              <div className="w-12 h-12 rounded-xl bg-white text-black flex items-center justify-center shadow-lg">
                <product.icon size={28} />
              </div>
              
              <div className="space-y-4 flex-1">
                <div className="flex items-center justify-between w-full">
                  <div className="flex gap-2">
                    {product.tags.map(tag => (
                      <span key={tag} className="text-[9px] uppercase font-black tracking-widest text-accent-blue">{tag}</span>
                    ))}
                  </div>
                  <span className="text-[9px] font-mono text-text-ghost">{product.version}</span>
                </div>
                <h2 className="text-2xl font-black italic tracking-tighter text-text-bright group-hover:text-chrome transition-colors">{product.name}</h2>
                <p className="text-text-dim leading-relaxed text-xs font-medium">
                  {product.description}
                </p>
              </div>

              <button className="w-full py-4 rounded-xl bg-border-dim border border-border-active text-text-bright font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                {product.version === 'Coming Soon' ? 'Join Waitlist' : 'Initialize Download'}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 py-16 border-t border-border-dim">
          {[
            { title: "One-Click Citation", desc: "Instant semantic grounding for any academic source.", icon: CheckCircle },
            { title: "Canvas Extraction", desc: "Direct LTI protocol synchronization for assignments.", icon: CheckCircle },
            { title: "Zero Trust Privacy", desc: "End-to-end encrypted academic data architecture.", icon: CheckCircle }
          ].map((benefit, i) => (
            <div key={i} className="flex gap-5">
              <div className="w-6 h-6 rounded-full bg-accent-blue/10 flex items-center justify-center ring-1 ring-accent-blue/30">
                 <benefit.icon className="text-accent-blue" size={14} />
              </div>
              <div className="space-y-1">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-text-bright">{benefit.title}</h4>
                <p className="text-[10px] text-text-ghost font-medium leading-relaxed">{benefit.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action Footer */}
        <div className="bg-dark-panel p-16 rounded-3xl border border-border-active text-center space-y-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent-blue/50 to-transparent" />
          <h2 className="text-4xl md:text-5xl font-display font-black text-chrome tracking-tighter italic">START UPGRADE NOW</h2>
          <p className="text-text-dim text-sm max-w-lg mx-auto uppercase tracking-[0.2em] font-bold">
            Join the elite academic network powered by Lutherio OS.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
             <button className="px-12 py-4 bg-white text-black font-black text-xs uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-2xl">
                Activate Professional <ArrowRight size={16} className="inline ml-2" />
             </button>
             <button className="px-12 py-4 border border-border-highlight hover:bg-dark-surface text-text-bright font-black text-xs uppercase tracking-widest rounded-xl transition-all">
                Manual Documentation
             </button>
          </div>
        </div>

      </div>
    </div>
  );
}
