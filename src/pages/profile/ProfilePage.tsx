import { useState } from "react";
import { useParams } from "react-router-dom";

import ProfileHeader from "../../features/profile/components/ProfileHeader";
import ProfileStats from "../../features/profile/components/ProfileStats";
import ProfileTabs from "../../features/profile/components/ProfileTabs";
import ProfilePosts from "../../features/profile/components/ProfilePosts";
import SavedPosts from "../../features/profile/components/SavedPosts";

import type { ProfileTab } from "../../features/profile/types/profile.types";
import { usePageTitle } from "@/hooks/usePageTitle";

const ProfilePage: React.FC = () => {
  usePageTitle("Profile");
  const { profileId } = useParams<{ profileId: string }>();

  // Auth logic
  const auth = localStorage.getItem("auth");
  const parsedAuth = auth ? JSON.parse(auth) : null;
  const myProfileId = parsedAuth?.profileId || "";
  const isMyProfile = myProfileId === profileId;

  const [activeTab, setActiveTab] = useState<ProfileTab>("Posts");

  if (!profileId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-zinc-950">
        <p className="text-xl font-semibold text-gray-500">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-zinc-950">
     
      <div className="w-full px-4 lg:px-10 py-20">
        
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
     
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="lg:sticky lg:top-8 space-y-6">
              <div className="bg-white dark:bg-zinc-900 rounded-4xl  dark:border-zinc-800 p-5">
               
                <ProfileHeader profileId={profileId} isMyProfile={isMyProfile} />
                <div className=" border-t border-gray-50 dark:border-zinc-800">
                  <ProfileStats profileId={profileId} />
                </div>
              </div>
              
             
              <div className="hidden lg:block px-6 text-[10px] text-gray-400 uppercase tracking-widest text-center">
                © 2026 Rahhal Platform • Explorer Mode
              </div>
            </div>
          </aside>

       
         
          <main className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6">
            
           
            <div className="bg-white dark:bg-zinc-900 rounded-2xl  dark:border-zinc-800 overflow-hidden">
              <ProfileTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isMyProfile={isMyProfile}
              />
            </div>

          
            <div className="w-full min-h-[500px]">
              {activeTab === "Posts" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  
                  <ProfilePosts profileId={profileId} />
                </div>
              )}
              
              {activeTab === "Saved" && isMyProfile && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <SavedPosts profileId={profileId} isMyProfile={isMyProfile} baseUrl={""} />
                </div>
              )}

              {activeTab === "My trips" && (
                <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-zinc-900 rounded-[2.5rem] border-2 border-dashed border-gray-100 dark:border-zinc-800">
                  <div className="w-20 h-20 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-500 rounded-full flex items-center justify-center mb-6 text-3xl">
                    ✈️
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-zinc-100">My Trips Coming Soon</h3>
                  <p className="text-gray-400 text-sm mt-2">Get ready to track your global adventures!</p>
                </div>
              )}
            </div>
          </main>
          
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;