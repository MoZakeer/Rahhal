import type { ReactNode } from "react";
import { motion } from "framer-motion";

function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="
      min-h-screen flex flex-col md:flex-row items-center justify-center gap-2
      relative overflow-hidden
      bg-slate-50 dark:bg-slate-900
      transition-colors duration-500
    ">

      
      <div className="absolute top-0 left-0 w-72 h-72 bg-primary-200 dark:bg-blue-900 rounded-full mix-blend-multiply opacity-30 animate-blob"></div>

      <div className="absolute top-1/4 right-0 w-64 h-64 bg-gray-200 dark:bg-slate-700 rounded-full mix-blend-multiply opacity-30 animate-blob animation-delay-2000"></div>

      <div className="absolute bottom-0 left-20 w-80 h-80 bg-primary-100 dark:bg-blue-800 rounded-full mix-blend-multiply opacity-30 animate-blob animation-delay-4000"></div>

      {/* LEFT SIDE */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="md:w-1/2 flex flex-col items-center justify-center p-2 relative z-10"
      >
        <h2 className="text-4xl font-bold text-center text-gradient-blue-gray">
          Explore The World With Us
        </h2>

        <p className="text-gray-600 dark:text-slate-400 text-center mt-2 max-w-sm">
          Discover new destinations, share your adventures, and connect with travelers around the world.
        </p>

        <img
          src="/Around the world-bro.svg"
          alt="Travel"
          className="max-w-sm w-full mb-6 animate-float"
        />
      </motion.div>

      {/* RIGHT SIDE (FORM) */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="md:w-1/2 flex flex-col items-center justify-center p-6 relative z-10"
      >
        <motion.div
          layout
          className="
            w-full max-w-xl
            backdrop-blur-md
            bg-white/70 dark:bg-slate-800/70
            border border-gray-200 dark:border-slate-700
            rounded-2xl
            shadow-xl dark:shadow-black/40
            p-10
            transition-colors duration-500
          "
        >
          {children}
        </motion.div>
      </motion.div>

    </div>
  );
}

export default AuthLayout;