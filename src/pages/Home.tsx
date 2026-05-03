import { motion, AnimatePresence } from 'motion/react';
import { NavLink } from 'react-router-dom';
import { Sparkles, Mic, Chrome, ArrowRight, Zap, Target, BookOpen, Loader2, Save, User as UserIcon, GraduationCap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { auth, db, signInWithGoogle } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '@/lib/utils';

enum OperationType {
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
  }
}

const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
};

export default function Home() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState({
    displayName: '',
    academicLevel: '',
    bio: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        fetchProfile(u.uid);
      } else {
        setProfile({ displayName: '', academicLevel: '', bio: '' });
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchProfile = async (uid: string) => {
    const userPath = `users/${uid}`;
    try {
      const docSnap = await getDoc(doc(db, userPath));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile({
          displayName: data.displayName || '',
          academicLevel: data.academicLevel || '',
          bio: data.bio || ''
        });
      } else if (auth.currentUser) {
        // Init profile with auth info if new
        setProfile(prev => ({ ...prev, displayName: auth.currentUser?.displayName || '' }));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, userPath);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    const userPath = `users/${user.uid}`;
    try {
      await setDoc(doc(db, userPath), {
        ...profile,
        updatedAt: serverTimestamp()
      }, { merge: true });
      setIsEditing(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, userPath);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const targetDate = new Date('August 15, 2026 00:00:00').getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div id="home-page" className="flex flex-col h-full overflow-y-auto bg-dark-void scrollbar-hide">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center p-8 pt-24 text-center overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent-blue/10 blur-[120px] rounded-full -z-10 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/5 blur-[100px] rounded-full -z-10" />
        
        {/* Floating Logo with 3D Spin */}
        <motion.div
           initial={{ opacity: 0, scale: 0.8 }}
           animate={{ 
             opacity: 1, 
             scale: 1,
             rotateY: 360 
           }}
           transition={{ 
             opacity: { duration: 1 },
             scale: { duration: 1 },
             rotateY: { duration: 10, repeat: Infinity, ease: "linear" } 
           }}
           className="w-[301px] h-[298px] mb-12 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]"
        >
          <img 
            src="/input_file_0.png" 
            alt="Lutherio Logo" 
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        <motion.div
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           className="inline-flex items-center gap-2 px-4 py-1 rounded border border-border-highlight bg-dark-panel text-text-ghost text-[10px] font-black uppercase tracking-[0.4em] mb-8"
        >
          COGNITIVE OPERATING SYSTEM v.2.04
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="font-sans font-black text-chrome tracking-tighter italic text-[123px] leading-[127px] mb-6 w-[618.719px]"
        >
          LUTHERIO
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-text-dim text-lg md:text-xl max-w-2xl mx-auto uppercase tracking-widest font-medium mb-12"
        >
          The High-Performance Intelligence Layer <br className="hidden md:block" /> for the Modern Academic.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-6"
        >
          <NavLink
            to="/chat"
            className="px-12 py-4 bg-white text-black font-black text-xs uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-2xl flex items-center gap-2"
          >
            Connect Neuron <ArrowRight size={16} />
          </NavLink>
          <NavLink
            to="/download"
            className="px-12 py-4 border border-border-highlight hover:bg-dark-surface text-text-bright font-black text-xs uppercase tracking-widest rounded-xl transition-all"
          >
            Download Extension
          </NavLink>
        </motion.div>

        {/* Countdown Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-24 flex flex-col items-center"
        >
          <div className="mb-6 flex flex-col items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-accent-blue animate-pulse">RELEASE DATE</span>
            <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-accent-blue/50 to-transparent" />
          </div>
          
          <div className="flex gap-4 md:gap-12">
            {[
              { label: 'DAYS', value: timeLeft.days, class: 'pr-[18px]' },
              { label: 'HRS', value: timeLeft.hours, class: 'pr-[14px]' },
              { label: 'MIN', value: timeLeft.minutes, class: 'pr-[12px]' },
              { label: 'SEC', value: timeLeft.seconds, class: 'pr-[12px] pl-0 ml-0' }
            ].map((unit, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className={`text-4xl md:text-6xl font-sans font-black text-chrome tracking-tighter italic tabular-nums leading-none mb-2 ${unit.class}`}>
                  {String(unit.value).padStart(2, '0')}
                </span>
                <span className="text-[8px] font-black uppercase tracking-widest text-text-ghost">{unit.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Philosophy / Features Grid */}
      <section className="px-8 py-24 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Sparkles,
              title: "LUTHERIO CHAT",
              desc: "Deep-layer LLM synchronization for academic research and writing. Lutherio understands context, citations, and logic.",
              link: "/chat"
            },
            {
              icon: Mic,
              title: "NOTE STREAM",
              desc: "Zero-latency audio transcription. Capture every word and let Lutherio structure your knowledge instantly.",
              link: "/record"
            },
            {
              icon: Chrome,
              title: "ECOSYSTEM",
              desc: "Bridge the gap between your browser and Canvas. Auto-writing protocols that live where you study.",
              link: "/download"
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-dark-panel border border-border-dim p-10 rounded-2xl group hover:border-accent-blue/30 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-dark-surface border border-border-active flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <feature.icon className="text-accent-blue" size={24} />
              </div>
              <h3 className="text-xl font-black italic tracking-tighter text-text-bright mb-4">{feature.title}</h3>
              <p className="text-sm text-text-dim leading-relaxed mb-8">{feature.desc}</p>
              <NavLink to={feature.link} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-ghost hover:text-accent-blue transition-colors">
                Initialize <ArrowRight size={12} />
              </NavLink>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Technical Specs / Bento */}
      <section className="px-8 py-24 bg-dark-surface border-y border-border-dim">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 bg-dark-panel border border-border-active p-12 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8">
              <Zap className="text-accent-blue/20 group-hover:text-accent-blue/40 transition-colors" size={120} />
            </div>
            <h2 className="text-4xl font-black tracking-tighter italic text-chrome mb-6">INTEGRATED CANVAS PROTOCOLS</h2>
            <p className="text-text-dim max-w-md leading-relaxed mb-8">
              Lutherio bypasses local data bottlenecks. Direct synchronization with Canvas and LTI portals allows for automated requirement extraction and citation validation in real-time.
            </p>
            <div className="flex gap-4">
              <div className="px-4 py-2 bg-dark-surface rounded-lg border border-border-active text-[10px] font-bold text-accent-blue">LTI v1.3</div>
              <div className="px-4 py-2 bg-dark-surface rounded-lg border border-border-active text-[10px] font-bold text-accent-blue">REST API READY</div>
            </div>
          </div>
          <div className="md:col-span-4 bg-accent-blue p-12 rounded-3xl text-black">
            <h2 className="text-3xl font-black tracking-tighter italic mb-4 leading-none text-white">V1.4 EXTENSION</h2>
            <p className="text-sm font-bold mb-8 text-white/80">Available for Google Chrome. Sync your active document with the Neuron Engine with one click.</p>
            <NavLink to="/download" className="w-full py-4 bg-black text-white text-xs font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-900 transition-colors">
              Install v1.4 <Target size={16} />
            </NavLink>
          </div>
        </div>
      </section>

      {/* Research Profile Section */}
      <section className="px-8 py-24 max-w-7xl mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-dark-panel border-2 border-border-highlight/30 rounded-[2.5rem] overflow-hidden shadow-2xl relative"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-blue via-purple-500 to-accent-blue" />
          
          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
              <div>
                <h2 className="text-3xl font-black tracking-tighter italic text-chrome mb-2">SCHOLARLY IDENTITY</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-text-ghost">Neural ID: {user?.uid.slice(0, 8) || "OFFLINE"}</p>
              </div>
              {!user ? (
                <button 
                  onClick={signInWithGoogle}
                  className="px-8 py-3 bg-white text-black font-black text-xs uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl"
                >
                  Sync Identity
                </button>
              ) : (
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-8 py-3 border border-border-highlight hover:bg-dark-surface text-text-bright font-black text-xs uppercase tracking-widest rounded-xl transition-all"
                >
                  {isEditing ? "Discard Changes" : "Modify Protocol"}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Profile View/Edit */}
              <div className="space-y-8">
                <div className="flex items-center gap-4 p-6 bg-dark-surface rounded-2xl border border-border-dim border-dashed">
                  <div className="w-16 h-16 rounded-full bg-border-dim flex items-center justify-center p-0.5">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="Avatar" className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <UserIcon size={32} className="text-text-ghost" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-text-bright">
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={profile.displayName}
                          onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                          className="bg-dark-void border border-border-active rounded px-3 py-1 text-sm focus:ring-1 ring-accent-blue outline-none"
                          placeholder="Display Name"
                        />
                      ) : (
                        profile.displayName || "Research Candidate"
                      )}
                    </h3>
                    <p className="text-xs text-accent-blue font-mono mt-1 opacity-70">Authenticated Member</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#444] block mb-2">Academic Standing</label>
                    {isEditing ? (
                      <select 
                        value={profile.academicLevel}
                        onChange={(e) => setProfile({ ...profile, academicLevel: e.target.value })}
                        className="w-full bg-dark-surface border border-border-dim rounded-xl p-3 text-sm text-text-bright outline-none focus:border-accent-blue transition-colors"
                      >
                        <option value="">Select Standing</option>
                        <option value="Undergraduate">Undergraduate</option>
                        <option value="Graduate">Graduate</option>
                        <option value="PhD Candidate">PhD Candidate</option>
                        <option value="Post-Doc">Post-Doc</option>
                        <option value="Independent Researcher">Independent Researcher</option>
                      </select>
                    ) : (
                      <div className="flex items-center gap-3 text-text-dim">
                        <GraduationCap size={16} className="text-accent-blue" />
                        <span className="text-sm">{profile.academicLevel || "Pending Allocation"}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#444] block mb-2">Abstract / Bio</label>
                    {isEditing ? (
                      <textarea 
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        rows={4}
                        className="w-full bg-dark-surface border border-border-dim rounded-xl p-3 text-sm text-text-bright outline-none focus:border-accent-blue transition-colors resize-none"
                        placeholder="Define your research focus..."
                      />
                    ) : (
                      <p className="text-sm text-text-dim leading-relaxed italic font-serif">
                        {profile.bio || "No summary synchronization detected. Please update your neural abstract."}
                      </p>
                    )}
                  </div>

                  {isEditing && (
                    <button 
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="w-full py-4 bg-accent-blue text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-3 hover:brightness-110 active:scale-95 transition-all shadow-lg"
                    >
                      {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                      Synchronize Profile
                    </button>
                  )}
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-dark-surface/50 p-8 rounded-[2rem] border border-border-dim flex flex-col justify-between">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-accent-blue mb-6">Activity Metrics</h4>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center bg-dark-void p-4 rounded-xl border border-border-dim">
                      <span className="text-[10px] font-bold text-text-ghost">NEURAL SESSIONS</span>
                      <span className="font-mono text-white">0032</span>
                    </div>
                    <div className="flex justify-between items-center bg-dark-void p-4 rounded-xl border border-border-dim">
                      <span className="text-[10px] font-bold text-text-ghost">DATA THROUGHPUT</span>
                      <span className="font-mono text-white">14.2 GB</span>
                    </div>
                    <div className="flex justify-between items-center bg-dark-void p-4 rounded-xl border border-border-dim">
                      <span className="text-[10px] font-bold text-text-ghost">CITATIONS GENERATED</span>
                      <span className="font-mono text-white">0891</span>
                    </div>
                  </div>
                </div>
                <div className="mt-8 p-4 bg-accent-blue/10 rounded-xl border border-accent-blue/20">
                  <p className="text-[8px] font-black italic text-accent-blue uppercase tracking-widest">System Status: Integrity Validated</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer / Stats */}
      <footer className="p-24 text-center border-t border-border-dim">
        <div className="flex flex-wrap justify-center gap-12 md:gap-24">
          <div>
            <p className="text-4xl font-black text-chrome mb-1 italic">50K+</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-text-ghost">Active Neural Nodes</p>
          </div>
          <div>
            <p className="text-4xl font-black text-chrome mb-1 italic">14ms</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-text-ghost">Latency Floor</p>
          </div>
          <div>
            <p className="text-4xl font-black text-chrome mb-1 italic">99.9%</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-text-ghost">Uptime Metric</p>
          </div>
        </div>
        <div className="mt-24 flex items-center justify-center gap-4 text-text-ghost text-[10px] font-black uppercase tracking-widest">
           <span>Privacy.Policy</span>
           <div className="w-1 h-1 rounded-full bg-border-active" />
           <span>Terms.Of.Sync</span>
           <div className="w-1 h-1 rounded-full bg-border-active" />
           <span>Academic.Integrity</span>
        </div>
      </footer>
    </div>
  );
}
