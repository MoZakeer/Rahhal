import { Send, Map, Users, MessageCircle, Globe2, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";

export default function HeroSection() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRtl = language === "ar";

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-950 pt-20">

      {/* Background Layers */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-[0.03] dark:opacity-[0.15]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/50 to-slate-50 dark:via-slate-950/50 dark:to-slate-950"></div>
      </div>

      {/* Glow Effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/20 dark:bg-blue-600/20 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none animate-[pulse_6s_infinite]"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-sky-400/20 dark:bg-sky-500/20 blur-[150px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none animate-[pulse_8s_infinite]"></div>

      <div className="container relative z-10 mx-auto px-6 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

        {/* Text Content */}
        <div className={cn("flex-1 flex flex-col gap-6 relative z-20", isRtl ? "text-right" : "text-left")}>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-md text-blue-700 dark:text-blue-300 w-fit border border-blue-200/50 dark:border-blue-800/50 shadow-sm">
            <Globe2 className="w-4 h-4 animate-[spin_4s_linear_infinite]" />
            <span className="text-sm font-bold tracking-wide">
              {t("landingPage.exploreWorld")}
            </span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white leading-[1.15] tracking-tight">
            {t("landingPage.heroTitle1")}
            <br className="hidden lg:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400 dark:from-blue-400 dark:to-sky-300 relative inline-block">
              {t("landingPage.heroTitle2")}
              <div className="absolute -bottom-2 left-0 w-full h-3 bg-blue-400/20 dark:bg-blue-500/30 -z-10 transform -skew-x-12"></div>
            </span>
          </h1>

          <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed font-medium">
            {t("landingPage.heroSubtitle")}
          </p>

          <div className={cn("flex flex-col sm:flex-row items-center justify-start gap-3 mt-6", isRtl ? "flex-row-reverse" : "flex-row")}>
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-700 dark:bg-blue-600 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full font-bold text-sm sm:text-base shadow-lg shadow-blue-500/30 dark:shadow-blue-900/40 hover:bg-blue-800 dark:hover:bg-blue-500 hover:-translate-y-1 transition-all duration-300 active:scale-95 group border border-blue-600 dark:border-blue-500"
              onClick={() => navigate('/ai-planner')}>
              <Map className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform" />
              <span>
                <span className="sm:hidden">{t("landingPage.plan")}</span>
                <span className="hidden sm:inline">{t("landingPage.planTrip")}</span>
              </span>
            </button>

            <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-6 py-3 sm:px-8 sm:py-4 rounded-full font-bold text-sm sm:text-base shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 hover:-translate-y-1 transition-all duration-300 active:scale-95 group"
              onClick={() => navigate('/explore')}>
              <Users className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
              <span>
                <span className="sm:hidden">{t("landingPage.explore")}</span>
                <span className="hidden sm:inline">{t("landingPage.exploreGroups")}</span>
              </span>
            </button>
          </div>
        </div>

        {/* Mockups & Visuals */}
        <div className="flex-1 relative w-full h-[550px] flex items-center justify-center mt-10 lg:mt-0">

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/20 blur-3xl rounded-full"></div>

          <div className="relative z-20 w-full max-w-sm bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/50 dark:border-slate-700/50 p-5 transform rotate-[-2deg] hover:rotate-0 hover:-translate-y-2 transition-all duration-500 group">

            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0 overflow-hidden ring-2 ring-white dark:ring-slate-800 shadow-sm">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" alt="User" className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{t("landingPage.mock.userName")}</h4>
                <p className="text-[11px] text-slate-500 font-medium">{t("landingPage.mock.timeLocation")}</p>
              </div>
            </div>

            <div className="w-full h-48 rounded-2xl bg-slate-100 dark:bg-slate-900 mb-4 overflow-hidden relative shadow-inner">
              <img src="Hurghada-Red-Sea-landing.jpg" alt="Post" className="w-full h-full object-cover" />

              <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> {t("landingPage.mock.featured")}
              </div>
            </div>

            <p className="text-sm text-slate-700 dark:text-slate-300 mb-5 line-clamp-2 leading-relaxed">
              {t("landingPage.mock.postText")}
            </p>

            <div className="flex items-center justify-between text-slate-500 border-t border-slate-100 dark:border-slate-700/50 pt-4">
              <button className="flex items-center gap-1.5 text-xs font-bold hover:text-blue-600 dark:hover:text-sky-400 transition-colors bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-full"><MessageCircle className="w-4 h-4" /> {t("landingPage.mock.comments")}</button>
              <button className="flex items-center gap-1.5 text-xs font-bold hover:text-blue-600 dark:hover:text-sky-400 transition-colors bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-full"><Send className="w-4 h-4" /> {t("landingPage.mock.share")}</button>
            </div>
          </div>

          <div className={cn("absolute top-12 z-30 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 dark:border-slate-700/50 animate-[bounce_4s_infinite]", isRtl ? "-left-6 md:-left-12 rounded-tl-sm" : "-right-6 md:-right-12 rounded-tr-sm")}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-bold text-slate-400">{t("landingPage.mock.tripGroup")}</span>
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {t("landingPage.mock.groupMessage")}
            </p>
          </div>

          <div className={cn("absolute bottom-16 z-30 bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-4 rounded-2xl shadow-[0_10px_30px_rgba(37,99,235,0.4)] border border-blue-400/30 animate-[bounce_5s_infinite_reverse]", isRtl ? "-right-6 md:-right-12 rounded-br-sm" : "-left-6 md:-left-12 rounded-bl-sm")}>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-blue-200 font-medium uppercase tracking-wider">{t("landingPage.mock.perfectMatch")}</span>
                <span className="font-black text-sm">{t("landingPage.mock.compatibility")}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}