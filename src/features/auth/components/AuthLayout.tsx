import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="
      min-h-screen flex flex-col md:flex-row items-center justify-center gap-2
      relative overflow-hidden
      bg-slate-50 dark:bg-slate-900
      transition-colors duration-500
    "
    >
      <Link
        to="/"
        className="absolute top-6 left-6 z-50 flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md hover:text-blue-600 dark:hover:text-blue-400 hover:scale-105 active:scale-95 shadow-sm transition-all duration-300"
        aria-label="Back to home"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5L8.25 12l7.5-7.5"
          />
        </svg>
      </Link>

      {/* Background Blobs Dynamic */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-primary-200 dark:bg-blue-900 rounded-full mix-blend-multiply opacity-30 animate-blob"></div>
      <div className="absolute top-1/4 right-0 w-64 h-64 bg-gray-200 dark:bg-slate-700 rounded-full mix-blend-multiply opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-20 w-80 h-80 bg-primary-100 dark:bg-blue-800 rounded-full mix-blend-multiply opacity-30 animate-blob animation-delay-4000"></div>

      {/* LEFT SIDE */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="md:w-1/2 flex flex-col items-center justify-center p-2 relative z-10 mt-16 md:mt-0"
      >
        <h2 className="text-4xl font-bold text-center text-gradient-blue-gray">
          Explore The World With Us
        </h2>

        <p className="text-gray-600 dark:text-slate-400 text-center mt-2 max-w-sm">
          Discover new destinations, share your adventures, and connect with
          travelers around the world.
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
