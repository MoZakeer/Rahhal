import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {Globe2, Activity } from "lucide-react";

export default function LiveRadar() {
  const [activeUsers, setActiveUsers] = useState(128);
  const [blips, setBlips] = useState<{ id: number; x: number; y: number; opacity: number }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {

      setActiveUsers(prev => prev + (Math.random() > 0.4 ? 1 : -1));

      const newBlip = {
        id: Date.now(),
        x: Math.random() * 80 + 10, 
        y: Math.random() * 80 + 10,
        opacity: Math.random() * 0.5 + 0.5
      };

      setBlips(prev => [...prev.slice(-4), newBlip]); 
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full">
      {/* الترويسة العلويّة */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">System Live</span>
        </div>
        <div className="flex items-center gap-1 text-slate-300">
           <Activity className="h-3 w-3" />
           <span className="text-[9px] font-mono font-bold uppercase tracking-tighter">Syncing...</span>
        </div>
      </div>

      {/* الرادار (The Core) */}
      <div className="relative h-64 w-full bg-slate-950 rounded-[3rem] overflow-hidden shadow-2xl shadow-indigo-200/50 border border-slate-900 group">
        
        {/* شعاع المسح (Scanning Sweep) */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 z-0 origin-center"
          style={{
            background: "conic-gradient(from 0deg, transparent 80%, rgba(99, 102, 241, 0.2) 100%)",
          }}
        />

        {/* خطوط الشبكة الهندسية (Radar Grid) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-full h-full border border-slate-700 rounded-full scale-[0.8]" />
          <div className="absolute w-full h-full border border-slate-700 rounded-full scale-[0.5]" />
          <div className="absolute w-[1px] h-full bg-slate-700 left-1/2 -translate-x-1/2" />
          <div className="absolute w-full h-[1px] bg-slate-700 top-1/2 -translate-y-1/2" />
        </div>

        {/* النقط الحية (The Blips) */}
        <AnimatePresence>
          {blips.map((blip) => (
            <motion.div
              key={blip.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, blip.opacity, 0], scale: [0.5, 1.5, 0.8] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 3.5 }}
              className="absolute h-2.5 w-2.5 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.9)] z-10"
              style={{ left: `${blip.x}%`, top: `${blip.y}%` }}
            />
          ))}
        </AnimatePresence>

        {/* شاشة البيانات (HUD Interface) */}
        <div className="absolute inset-0 p-6 flex flex-col justify-between z-20 pointer-events-none">
          <div className="flex justify-between items-start">
            <Globe2 className="h-5 w-5 text-indigo-400/30" />
            <div className="text-right">
              <p className="text-[8px] font-mono text-emerald-400/60 font-bold uppercase tracking-widest">Signal: Stable</p>
              <p className="text-[8px] font-mono text-indigo-400/40 font-bold uppercase tracking-widest">Lat: 27.17° N</p>
            </div>
          </div>
          
          <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-3xl border border-white/5 inline-block self-start shadow-xl">
            <motion.div 
              key={activeUsers}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-baseline gap-1"
            >
              <span className="text-white font-black text-3xl tracking-tighter italic">{activeUsers}</span>
              <span className="text-indigo-400 text-xs font-bold animate-pulse">●</span>
            </motion.div>
            <p className="text-indigo-300/40 text-[9px] font-black uppercase tracking-widest mt-1">Explorers Nearby</p>
          </div>
        </div>
      </div>
    </div>
  );
}