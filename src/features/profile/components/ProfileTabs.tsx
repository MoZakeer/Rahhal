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
    <div className="w-full bg-white dark:bg-violet-600  dark:border-violet-800">
      <div className="flex justify-center lg:justify-start px-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                relative px-6 py-4 text-sm font-bold tracking-wide uppercase transition-colors duration-200
                ${isActive 
                  ? "text-violet-900 dark:text-white" 
                  : "text-violet-400 hover:text-violet-600 dark:text-violet-500 dark:hover:text-violet-300"
                }
              `}
            >
              <span className="relative z-10">{tab}</span>
              
              {isActive && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-violet-900 dark:bg-white"
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