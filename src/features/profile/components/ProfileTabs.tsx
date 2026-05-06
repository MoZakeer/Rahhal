import { motion } from "framer-motion";
import type { ProfileTab } from "../types/profile.types";

interface Props {
  activeTab: ProfileTab;
  setActiveTab: (tab: ProfileTab) => void;
  isMyProfile?: boolean;
}

const ProfileTabs: React.FC<Props> = ({ activeTab, setActiveTab, isMyProfile }) => {
  const tabs: ProfileTab[] = ["Posts"];
  if (isMyProfile) {
    tabs.push("Saved");
    // tabs.push("My trips");
  }

  return (
    <div className="w-full bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 transition-colors duration-300">
      <div className="flex justify-center lg:justify-start px-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                relative px-6 py-4 text-sm font-bold tracking-wide uppercase transition-colors duration-200 cursor-pointer
                ${isActive 
                  ? "text-cyan-600 dark:text-cyan-400" 
                  : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                }
              `}
            >
              <span className="relative z-10">{tab}</span>
              
              {isActive && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-cyan-600 dark:bg-cyan-400"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProfileTabs;