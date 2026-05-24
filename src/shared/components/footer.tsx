import { Link, useLocation } from "react-router-dom";
import { Twitter, Instagram, Github, Linkedin } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

export default function Footer() {
  const location = useLocation();
  const { t, language } = useLanguage();
  const isRtl = language === "ar";

  const companyLinks = [
    { name: t("footer.aboutUs"), path: "/about" },
    { name: t("footer.careers"), path: "/careers" },
    { name: t("footer.blog"), path: "/blog" },
    { name: t("footer.contact"), path: "/contact" },
  ];

  const supportLinks = [
    { name: t("footer.helpCenter"), path: "/help-center" },
    { name: t("footer.safety"), path: "/safety" },
    { name: t("footer.termsOfService"), path: "/terms" },
    { name: t("footer.privacyPolicy"), path: "/privacy" },
  ];

  return (
    <footer className="w-full bg-slate-50 dark:bg-slate-950 pt-16 pb-8 border-t border-slate-200 dark:border-slate-800/50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-10 lg:px-20">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Section */}
          <div className="flex flex-col gap-6 lg:col-span-2">
             {/* Logo Section */}
                    <Link
                      to="/feed"
                      className="flex items-center gap-2 group cursor-pointer"
                      onClick={(e) => {
                        if (location.pathname === "/feed") e.preventDefault();
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      <div className="relative flex h-12 w-12 items-center justify-center transition-transform group-hover:scale-110">
                        <img
                          src="/light-logo.png"
                          alt="Rahhal Light Logo"
                          className="relative h-12 w-12 object-contain block dark:hidden"
                        />
                        <img
                          src="/dark-logo.png"
                          alt="Rahhal Dark Logo"
                          className="relative h-12 w-12 object-contain hidden dark:block"
                        />
                      </div>
            
                      <span className="text-2xl tracking-tighter ms-0 hidden sm:flex items-baseline">
                        {language === "en" ? (
                          <>
                            <span className="font-black text-slate-800 dark:text-slate-100">
                              Rah
                            </span>
                            <span className="font-light text-slate-600 dark:text-slate-300">
                              hal
                            </span>
                          </>
                        ) : (
                          <span className="font-black text-slate-800 dark:text-slate-100">
                            رَحَّال
                          </span>
                        )}
                        <span className="text-blue-400 text-3xl font-black ms-0.5">.</span>
                      </span>
                    </Link>

            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-sm leading-relaxed">
              {t("footer.description")}
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 mt-2">
              {[Twitter, Instagram, Github, Linkedin].map((Icon, idx) => (
                <a 
                  key={idx} 
                  href="#" 
                  className="p-2.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/40 dark:hover:text-blue-400 transition-all duration-300 hover:-translate-y-1"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Company Links */}
          <div className="flex flex-col gap-5">
            <h4 className="text-slate-900 dark:text-white font-bold text-lg">{t("footer.company")}</h4>
            <div className="flex flex-col gap-3">
              {companyLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    "text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 text-sm w-fit",
                    isRtl ? "hover:-translate-x-1" : "hover:translate-x-1"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Support Links */}
          <div className="flex flex-col gap-5">
            <h4 className="text-slate-900 dark:text-white font-bold text-lg">{t("footer.support")}</h4>
            <div className="flex flex-col gap-3">
              {supportLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    "text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 text-sm w-fit",
                    isRtl ? "hover:-translate-x-1" : "hover:translate-x-1"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-200 dark:border-slate-800/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            © {new Date().getFullYear()} {t("footer.rights")}
          </p>
          
          {/* Region / Language Selectors */}
          <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400 font-medium">
            <button className="hover:text-slate-900 dark:hover:text-white transition-colors">{t("footer.country")}</button>
            <button className="hover:text-slate-900 dark:hover:text-white transition-colors">{t("footer.language")}</button>
          </div>
        </div>
      </div>
    </footer>
  );
}