import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";

interface FollowButtonProps {
    profileId: string;
    isMyProfile?: boolean;
}

const FollowButton: React.FC<FollowButtonProps> = ({ profileId, isMyProfile }) => {
    const [isFollowing, setIsFollowing] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(false);

  
    useEffect(() => {
        const fetchFollowStatus = async () => {
            if (isMyProfile) return;
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(
                    `https://rahhal-api.runasp.net/Followers/ProfileFollowStatus`,
                    {
                        params: { ViewedProfileId: profileId },
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                if (res.data?.isSuccess) setIsFollowing(res.data.data.isFollowing);
            } catch (error) {
                console.error("Error fetching follow status", error);
            }
        };
        fetchFollowStatus();
    }, [profileId, isMyProfile]);

    
    const handleFollowToggle = async () => {
        if (loading || !profileId) return;
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const res = await axios.post(
                "https://rahhal-api.runasp.net/Followers/Follow",
                { followingProfileId: profileId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data?.isSuccess) setIsFollowing(res.data.data.isFollowing);
        } catch (error) {
            console.error("Error toggling follow", error);
        } finally {
            setLoading(false);
        }
    };

    if (isMyProfile || isFollowing === null) return null;

    
    const Spinner = () => (
        <motion.div
            className={`w-5 h-5 border-2 border-t-2 rounded-full ${
                isFollowing ? "border-gray-700 border-t-gray-300" : "border-white border-t-cyan-300"
            }`}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
    );

    return (
        <button
            onClick={handleFollowToggle}
            disabled={loading}
            className={`px-5 py-2 rounded-full font-semibold cursor-pointer flex items-center justify-center gap-2 transition-all duration-200 shadow-sm ${
                isFollowing
                    ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:shadow-md"
                    : "bg-cyan-600 text-white hover:bg-cyan-700 hover:shadow-lg"
            }`}
        >
            {loading ? <Spinner /> : isFollowing ? "Following" : "Follow"}
        </button>
    );
};

export default FollowButton;