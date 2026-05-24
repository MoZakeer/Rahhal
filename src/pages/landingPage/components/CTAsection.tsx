import { usePageTitle } from "@/hooks/usePageTitle";
import useAuthNavigation from "../hooks/useAuthNavigation";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

const CTA = () => {
  const { t, language } = useLanguage();
  const isRtl = language === "ar";

  usePageTitle(t("landingPage.cta.pageTitle"));
  const handleNavigation = useAuthNavigation();

  return (
    <section className="relative py-24 px-6 overflow-hidden transition-colors duration-500">
      {/* Background Container */}
      <div className="absolute inset-0 z-0 transition-colors duration-500 bg-slate-50 dark:bg-slate-950">
        {/* Gradient Overlay - Adaptive */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-100 via-slate-50 to-slate-50 dark:from-blue-900/20 dark:via-slate-950 dark:to-slate-950"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-4xl mx-auto text-center"
      >
        <h2 className="text-5xl md:text-6xl font-black text-slate-800 dark:text-white tracking-tight leading-[1.1]">
          {t("landingPage.cta.title1")}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-sky-400 dark:from-blue-400 dark:to-sky-300">
            {t("landingPage.cta.title2")}
          </span>
        </h2>

        <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {t("landingPage.cta.subtitle")}
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-10 group relative inline-flex items-center justify-center gap-3 px-10 py-4 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-lg shadow-lg hover:shadow-xl transition-all overflow-hidden"
          onClick={() => handleNavigation("/feed")}
        >
          {/* Shimmer Effect */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 dark:via-black/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>

          <span className="relative z-10">{t("landingPage.cta.button")}</span>
          <ArrowRight className={cn("relative z-10 w-5 h-5 transition-transform", isRtl ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1")} />
        </motion.button>
      </motion.div>
    </section>
  );
};

export default CTA;