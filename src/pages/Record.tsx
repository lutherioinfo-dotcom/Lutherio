import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Square, Save, RotateCcw, FileText, Sparkles, Volume2 } from 'lucide-react';
import { generateNotes } from '@/services/geminiService';
import { cn } from '@/lib/utils';

export default function Record() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [timer, setTimer] = useState(0);
  
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    // Check for SpeechRecognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            currentTranscript += event.results[i][0].transcript;
          }
        }
        setTranscript(prev => prev + " " + currentTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech Recognition Error", event.error);
        if (event.error === 'not-allowed') {
          alert("Microphone access was denied. Please ensure you have allowed microphone permissions in your browser and that the application is running over a secure connection.");
        }
        setIsRecording(false);
      };
    }
  }, []);

  const startRecording = () => {
    if (!recognitionRef.current) {
        alert("Speech Recognition not supported in this browser.");
        return;
    }
    setTranscript("");
    setNotes("");
    setIsRecording(true);
    recognitionRef.current.start();
    
    timerRef.current = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    recognitionRef.current.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    setTimer(0);
  };

  const processTranscription = async () => {
    if (!transcript.trim()) return;
    setIsProcessing(true);
    const result = await generateNotes(transcript);
    setNotes(result || "");
    setIsProcessing(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div id="record-page" className="flex flex-col h-full p-8 md:p-12 overflow-y-auto bg-dark-void">
      <div className="max-w-5xl mx-auto w-full space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-display font-black text-chrome tracking-tighter italic">RECORD INTELLIGENCE</h1>
            <p className="text-text-dim text-sm uppercase tracking-widest">Capture. Structure. Lutherio Sync Active.</p>
          </div>
          
          <div className="flex items-center gap-4">
            {isRecording && (
               <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-red-500 font-mono text-[10px] uppercase font-bold tracking-widest">{formatTime(timer)} LIVE</span>
               </div>
            )}
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="flex items-center gap-2 px-8 py-3 bg-white text-black rounded-lg shadow-xl shadow-white/5 transition-all font-black text-xs uppercase tracking-widest"
              >
                <Mic size={16} />
                Open Session
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex items-center gap-2 px-8 py-3 bg-red-600 text-white rounded-lg shadow-lg shadow-red-500/20 transition-all font-black text-xs uppercase tracking-widest"
              >
                <Square size={16} />
                Terminate
              </button>
            )}
          </div>
        </div>

        {/* Recording Visualizer */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 80, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-dark-panel border border-border-dim rounded-2xl flex items-center justify-center overflow-hidden"
            >
               <div className="flex items-center gap-1.5 px-12 w-full justify-center">
                  {[...Array(40)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [4, Math.random() * 40 + 4, 4] }}
                      transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.02 }}
                      className="w-1 bg-accent-blue/40 rounded-full"
                    />
                  ))}
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Transcript Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-text-ghost flex items-center gap-2">
                 <Volume2 size={12} /> Live Data Stream
               </h3>
               {transcript && (
                 <button 
                  onClick={() => setTranscript("")}
                  className="text-[10px] text-text-ghost hover:text-text-bright flex items-center gap-1 uppercase font-bold"
                 >
                   <RotateCcw size={10} /> Reset
                 </button>
               )}
            </div>
            <div className="bg-dark-surface border border-border-dim p-8 rounded-2xl min-h-[400px] max-h-[600px] overflow-y-auto shadow-2xl">
              {transcript ? (
                <p className="text-text-dim text-sm leading-relaxed italic">
                  "{transcript}"
                  {isRecording && <span className="inline-block w-1.5 h-4 bg-accent-blue animate-pulse ml-1 align-middle" />}
                </p>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                  <Mic size={32} className="mb-4 text-text-ghost" />
                  <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-text-ghost">Awaiting Sonic Input</p>
                </div>
              )}
            </div>
            {transcript && !isRecording && (
              <button
                onClick={processTranscription}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-3 p-4 bg-accent-blue hover:bg-blue-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Synthesizing...
                  </div>
                ) : (
                  <>
                    <Sparkles size={16} /> Generate Intelligence Notes
                  </>
                )}
              </button>
            )}
          </div>

          {/* AI Notes Section */}
          <div className="space-y-4">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-text-ghost flex items-center gap-2">
               <FileText size={12} /> Lutherio Processed Output
             </h3>
             <div className="bg-dark-panel border border-border-dim p-8 rounded-2xl min-h-[400px] shadow-2xl">
               {notes ? (
                 <div className="max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-text-bright leading-relaxed">{notes}</pre>
                 </div>
               ) : (
                 <div className="h-full flex flex-col items-center justify-center text-center opacity-10 space-y-4">
                    <Sparkles size={40} />
                    <p className="text-[10px] uppercase font-bold tracking-[0.2em]">Ready for Generation</p>
                 </div>
               )}
             </div>
             {notes && (
               <div className="flex gap-4">
                 <button className="flex-1 p-4 bg-dark-surface hover:bg-dark-elevated border border-border-dim rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors">
                    <Save size={14} /> Export PDF
                 </button>
                 <button className="flex-1 p-4 bg-dark-surface hover:bg-dark-elevated border border-border-dim rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors">
                    <FileText size={14} /> Sync Canvas
                 </button>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
