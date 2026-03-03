import { motion } from "framer-motion";
import type { ProfileTab } from "../types/profile.types";

const tabs: ProfileTab[] = ["Posts", "My trips", "Saved"];

interface Props {
  activeTab: ProfileTab;
  setActiveTab: (tab: ProfileTab) => void;
}

const ProfileTabs: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="mt-6 border-b border-gray-200">
      <div className="flex gap-6 relative">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative pb-3 text-sm font-medium transition ${
              activeTab === tab
                ? "text-black"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {tab}

            {activeTab === tab && (
              <motion.div
                layoutId="tabUnderline"
                className="absolute left-0 right-0 -bottom-1px h-0.5 bg-black rounded"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProfileTabs;