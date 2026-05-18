import React from 'react';
import { motion } from 'framer-motion';

const NotFoundPage: React.FC = () => {

  return (
    
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-6 text-slate-900 dark:text-white relative overflow-hidden font-sans transition-colors duration-500">

      
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-900/10 dark:bg-blue-950/20 rounded-full blur-[120px] pointer-events-none transition-colors duration-500" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-900/10 dark:bg-indigo-950/20 rounded-full blur-[120px] pointer-events-none transition-colors duration-500" />

      {/* MAIN CONTAINER */}
      <div className="text-center z-10 max-w-2xl flex flex-col items-center">

        {/* THE TRAVELER ILLUSTRATION */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1.5, opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
          className="w-full max-w-[460px] aspect-[4/3] relative flex items-center justify-center mb-4"
        >
          
          <motion.img
            animate={{ y: [-6, 6, -6] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            src="../../../public/404 (1).png"
            alt="Lost Traveler Looking Through Telescope"
            className="w-full h-full object-contain pointer-events-none select-none"
          />
        </motion.div>

        {/* TRAVEL-THEMED CONTENT */}

        

        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-slate-900 dark:text-white mb-4"
        >
          Oops! Page Not Found
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-slate-500 dark:text-slate-400 text-sm md:text-base max-w-sm mx-auto leading-relaxed font-sans font-light mb-10"
        >
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </motion.p>

        
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 w-full justify-center px-6 sm:px-0"
        >
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-medium text-sm border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all duration-300 active:scale-95"
          >
            Go Back
          </button>

          <a
            href="/"
            className="w-full sm:w-auto px-10 py-3.5 rounded-xl font-medium text-sm bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 shadow-xl shadow-blue-500/10 dark:shadow-blue-900/30 text-center active:scale-95"
          >
            Explore Feed
          </a>
        </motion.div>

      </div>

      {/* Subtle tech detail at the edge */}
      <div className="absolute bottom-4 text-[9px] font-mono tracking-widest text-slate-400/30 dark:text-slate-600/30 hidden md:block">
        SYS.NODE_404 // LAT.UNRESOLVED
      </div>
    </div>
  );
};

export default NotFoundPage;