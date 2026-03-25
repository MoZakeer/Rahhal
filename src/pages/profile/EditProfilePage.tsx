import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useProfileStore } from "../../features/profile/store/profile.store";
// import type { UpdateProfileRequest } from "../../features/profile/types/profile.types";
import { TravelPersonality } from "../../features/profile/types/travelPersonality.enum";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

const travelPersonalityMap = {
    Explorer: TravelPersonality.Explorer,
    Relaxer: TravelPersonality.Relaxer,
    "Social Traveler": TravelPersonality.SocialTraveler,
    Backpacker: TravelPersonality.Backpacker,
    "Luxury Traveler": TravelPersonality.LuxuryTraveler,
};

export default function EditProfilePage() {
    const navigate = useNavigate();
    const { profile, updateProfile, fetchProfile } = useProfileStore();
    // const { register, handleSubmit } = useForm<UpdateProfileRequest>();

    const auth = localStorage.getItem("auth");
    const parsedAuth = auth ? JSON.parse(auth) : null;

    const profileId = parsedAuth?.profileId;
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [allCountries, setAllCountries] = useState<{ id: string; name: string }[]>([]);
    const [travelPreferences, setTravelPreferences] = useState<{ id: string; name: string }[]>([]);

    const [selectedPersonality, setSelectedPersonality] = useState<string>("");
    const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
    const [visitedCountries, setVisitedCountries] = useState<{ id: string; name: string }[]>([]);
    const [dreamCountries, setDreamCountries] = useState<{ id: string; name: string }[]>([]);

    const [showVisitedDropdown, setShowVisitedDropdown] = useState(false);
    const [showDreamDropdown, setShowDreamDropdown] = useState(false);

    const [loading, setLoading] = useState(false);
    const [isPictureDeleted, setIsPictureDeleted] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    // const [travelPersonality, setTravelPersonality] = useState("");
    const profileSchema = z.object({
        Fname: z.string().min(1, "First name is required"),
        Lname: z.string().min(1, "Last name is required"),
        UserName: z.string().min(1, "Username is required"),
        Bio: z.string().min(1, "Bio is required"),
        Location: z.string().min(1, "Location is required"),
        birthDate: z.string().min(1, "Birth date is required"),
        Gender: z.string().min(1, "Gender is required"),
        TravelPersonality: z.string().optional(),
    });

    type ProfileFormData = z.infer<typeof profileSchema>;

    const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
    });
    useEffect(() => {
        const token = localStorage.getItem("token");

        const fetchUserdata = async () => {
            try {
                setLoading(true);

                const res = await axios.get(
                    `https://rahhal-api.runasp.net/Profile/GetUserProfile?ProfileId=${profileId}`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = res.data.data;
                const names = data.fullName?.split(" ") || [];

                // Reset basic form fields
                reset({
                    Fname: names[0] || "",
                    Lname: names.slice(1).join(" ") || "",
                    UserName: data.userName || "",
                    Bio: data.bio || "",
                    Location: data.location || "",
                    birthDate: data.birthDate ? data.birthDate.split("T")[0] : "",
                    Gender: data.gender?.toString() || "",
                    TravelPersonality: data.travelPersonality?.toString() || ""
                });

                // Set travel personality
                const personalityEntry = Object.entries(travelPersonalityMap).find(
                    ([, value]) => value.toString() === (data.travelPersonality?.toString() || "")
                );
                setSelectedPersonality(personalityEntry ? personalityEntry[0] : "");

                // Set countries
                setVisitedCountries(data.visitedCountries || []);
                setDreamCountries(data.dreamDestinations || []);


                const preferenceNames = (data.travelPreferences || []).map((p: { name: string }) => p.name);
                setSelectedPreferences(preferenceNames);

                // Profile image
                setPreviewImage(
                    data.profilePicture
                        ? `https://rahhal-api.runasp.net${data.profilePicture}`
                        : null
                );
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        const fetchCountries = async () => {
            try {
                const res = await fetch("https://rahhal-api.runasp.net/Country/GetAll?SortByLastAdded=true", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const json = await res.json();
                if (Array.isArray(json.data)) setAllCountries(json.data);
            } catch (err) {
                console.error("Error fetching countries:", err);
            }
        };

        const fetchTravelPreferences = async () => {
            try {
                const res = await fetch("https://rahhal-api.runasp.net/TravelPreference/GetAll", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const json = await res.json();
                if (Array.isArray(json.data)) setTravelPreferences(json.data);
            } catch (err) {
                console.error("Error fetching travel preferences:", err);
            }
        };

        fetchUserdata();
        fetchCountries();
        fetchTravelPreferences();
    }, []);


    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);
        setIsPictureDeleted(false);

        const reader = new FileReader();
        reader.onloadend = () => setPreviewImage(reader.result as string);
        reader.readAsDataURL(file);
    };

    const togglePreference = (pref: string) => {
        setSelectedPreferences((prev) =>
            prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
        );
    };

    const onSubmit = async (data: ProfileFormData) => {
        if (!selectedPersonality) {
            toast.error("Please select a travel personality!");
            return;
        }

        const birthDateISO = new Date(data.birthDate).toISOString();
        const formDataToSend = new FormData();

        formDataToSend.append("Fname", data.Fname);
        formDataToSend.append("Lname", data.Lname);
        formDataToSend.append("UserName", data.UserName);
        formDataToSend.append("Bio", data.Bio);
        formDataToSend.append("birthDate", birthDateISO);
        formDataToSend.append("Location", data.Location);
        formDataToSend.append("Gender", data.Gender);

        formDataToSend.append(
            "TravelPersonality",
            (
                travelPersonalityMap[
                selectedPersonality as keyof typeof travelPersonalityMap
                ] ?? 0
            ).toString()
        );

        selectedPreferences.forEach((pref, idx) => {
            const tp = travelPreferences.find((t) => t.name === pref);
            if (tp) formDataToSend.append(`TravelPreferenceIds[${idx}]`, tp.id);
        });

        visitedCountries.forEach((c, idx) =>
            formDataToSend.append(`VisitedCountryIds[${idx}]`, c.id)
        );

        dreamCountries.forEach((c, idx) =>
            formDataToSend.append(`DreamCountryIds[${idx}]`, c.id)
        );

        // =============================
        // Profile Picture Logic
        // =============================

        if (selectedFile) {
            formDataToSend.append("ProfilePicture", selectedFile);
            formDataToSend.append("IsPictureDeleted", "false");
        } else if (isPictureDeleted) {
            formDataToSend.append("ProfilePicture", "");
            formDataToSend.append("IsPictureDeleted", "true");
        } else {
            formDataToSend.append("ProfilePicture", "");
            formDataToSend.append("IsPictureDeleted", "false");
        }

        // Debug
        for (const pair of formDataToSend.entries()) {
            console.log(pair[0], pair[1]);
        }

        try {
            await updateProfile(formDataToSend);
            await fetchProfile(profileId);
            toast.success("Profile updated!");
            navigate(`/profile/${profileId}`);
        } catch (error) {
            toast.error("Failed to update profile");
            console.log(error);
        }
    };

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-gray-500 animate-pulse">Loading profile...</div>
            </div>
        );
    }
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden animate-pulse">

                        {/* Header */}
                        <div className="px-6 pt-10 pb-8 flex flex-col items-center gap-4">
                            <div className="w-32 h-32 rounded-full bg-gray-200"></div>
                            <div className="h-6 w-40 bg-gray-200 rounded"></div>
                            <div className="h-4 w-60 bg-gray-200 rounded"></div>
                        </div>

                        <div className="p-6 sm:p-10 space-y-8">

                            {/* name inputs */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="h-12 bg-gray-200 rounded-xl"></div>
                                <div className="h-12 bg-gray-200 rounded-xl"></div>
                            </div>

                            {/* username */}
                            <div className="h-12 bg-gray-200 rounded-xl"></div>

                            {/* bio */}
                            <div className="h-20 bg-gray-200 rounded-xl"></div>

                            {/* location */}
                            <div className="h-12 bg-gray-200 rounded-xl"></div>

                            {/* birthdate */}
                            <div className="h-12 bg-gray-200 rounded-xl"></div>

                            {/* gender */}
                            <div className="h-12 bg-gray-200 rounded-xl"></div>

                            {/* personality buttons */}
                            <div className="flex gap-3 flex-wrap">
                                <div className="h-10 w-28 bg-gray-200 rounded-xl"></div>
                                <div className="h-10 w-28 bg-gray-200 rounded-xl"></div>
                                <div className="h-10 w-28 bg-gray-200 rounded-xl"></div>
                                <div className="h-10 w-28 bg-gray-200 rounded-xl"></div>
                            </div>

                            {/* preferences */}
                            <div className="flex gap-2 flex-wrap">
                                <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
                                <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
                                <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
                                <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
                            </div>

                            {/* countries */}
                            <div className="h-12 bg-gray-200 rounded-xl"></div>

                            {/* button */}
                            <div className="flex justify-end">
                                <div className="h-12 w-40 bg-gray-200 rounded-xl"></div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-xl border border-gray-100/80 overflow-hidden">
                    {/* Header */}
                    <div className="relative px-6 pt-10 pb-8 bg-linear-to-b from-cyan-50/70 to-white flex flex-col items-center gap-4">
                        <button
                            onClick={() => navigate(`/profile/${profileId}`)}
                            className="absolute left-6 top-6 flex items-center gap-2 px-4 py-2    rounded-lg cursor-pointer text-gray-600   transition-all duration-200"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Back
                        </button>
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full ring-4 ring-white shadow-xl overflow-hidden bg-gray-200 flex items-center justify-center">

                                {previewImage ? (
                                    <img
                                        src={previewImage}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-4xl font-bold text-gray-600">
                                        {profile?.fullName?.charAt(0)?.toUpperCase() || "U"}
                                    </span>
                                )}

                            </div>
                            <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <span className="text-white text-sm font-medium">Change</span>
                                <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                            </label>
                        </div>
                        {previewImage && (
                            <button
                                type="button"
                                onClick={() => {
                                    setPreviewImage(null);
                                    setSelectedFile(null);
                                    setIsPictureDeleted(true);
                                }}
                                className="mt-2 text-sm bg-red-600 text-white rounded-2xl py-3 px-2"
                            >
                                Remove Photo
                            </button>
                        )}
                        <h1 className="text-2xl font-bold text-gray-800 mt-2">Edit Profile</h1>
                        <p className="text-sm text-gray-500">Update your travel personality and preferences</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-10 space-y-10">
                        {/* Basic Info */}
                        <section className="space-y-6 bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                            <h2 className="text-xl font-semibold text-cyan-700 border-b pb-2 mb-4">Basic Info</h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <input
                                    {...register("Fname")}
                                    placeholder="First Name"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition placeholder-gray-400"
                                />
                                {errors.Fname && <p className="text-red-500 text-sm mt-1">{errors.Fname.message}</p>}

                                <input
                                    {...register("Lname")}
                                    placeholder="Last Name"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition placeholder-gray-400"
                                />
                                {errors.Lname && <p className="text-red-500 text-sm mt-1">{errors.Lname.message}</p>}

                            </div>

                            <input
                                {...register("UserName")}
                                placeholder="Username"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition placeholder-gray-400"
                            />
                            {errors.UserName && <p className="text-red-500 text-sm mt-1">{errors.UserName.message}</p>}

                            <textarea
                                {...register("Bio")}
                                placeholder="Short Bio about your travel style"
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition placeholder-gray-400 resize-none"
                            />
                            {errors.Bio && <p className="text-red-500 text-sm mt-1">{errors.Bio.message}</p>}
                            <input
                                {...register("Location")}
                                placeholder="Current City / Country"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition placeholder-gray-400"
                            />
                            {errors.Location && <p className="text-red-500 text-sm mt-1">{errors.Location.message}</p>}

                            <input
                                {...register("birthDate")}
                                type="date"
                                placeholder="Birth Date"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition placeholder-gray-400"
                            />
                            {errors.birthDate && <p className="text-red-500 text-sm mt-1">{errors.birthDate.message}</p>}
                            <select
                                {...register("Gender")}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition placeholder-gray-400"
                            >
                                <option value="">Select Gender</option>
                                <option value="1">Male</option>
                                <option value="2">Female</option>
                                <option value="3">Other / Prefer not to say</option>
                            </select>
                        </section>
                        {/* {errors.Gender && <p className="text-red-500 text-sm mt-1">{errors.Gender.message}</p>} */}
                        {/* Travel Personality */}
                        <section className="space-y-4">
                            <h2 className="text-lg font-semibold text-cyan-700">Travel Personality</h2>
                            <div className="flex flex-wrap gap-3">
                                {Object.keys(travelPersonalityMap).map((p) => (
                                    <motion.button key={p} type="button" onClick={() => setSelectedPersonality(p)} className={`flex-1 p-3 border rounded-xl text-sm transition ${selectedPersonality === p ? "bg-cyan-600 text-white border-cyan-600" : "border-gray-200 hover:bg-cyan-50 hover:border-cyan-300"}`}>
                                        {p}
                                    </motion.button>
                                ))}
                            </div>
                        </section>

                        {/* Travel Preferences */}
                        <section className="space-y-4">
                            <h2 className="text-lg font-semibold text-cyan-700">Travel Preferences</h2>
                            <div className="flex flex-wrap gap-2">
                                {travelPreferences.map((pref) => (
                                    <motion.button key={pref.id} type="button" onClick={() => togglePreference(pref.name)} className={`px-4 py-2 text-sm rounded-full border transition ${selectedPreferences.includes(pref.name) ? "bg-cyan-600 text-white border-cyan-600" : "border-cyan-100 bg-cyan-50 hover:bg-cyan-100"}`}>
                                        {pref.name}
                                    </motion.button>
                                ))}
                            </div>
                        </section>

                        {/* Geography */}
                        <section className="space-y-4 relative">
                            <h2 className="text-lg font-semibold text-cyan-700">Visited Countries</h2>
                            <div className="flex flex-wrap gap-2 border p-2 rounded-lg bg-white">
                                {visitedCountries.map((c) => (
                                    <span key={c.id} className="px-3 py-1 rounded-full bg-green-100 text-green-800 flex items-center gap-1">
                                        {c.name}
                                        <button onClick={() => setVisitedCountries(prev => prev.filter(v => v.id !== c.id))}>✖</button>
                                    </span>
                                ))}
                                <input
                                    type="text"
                                    placeholder="Add country..."
                                    className="flex-1 outline-none"
                                    onFocus={() => setShowVisitedDropdown(true)}
                                    onBlur={() => setTimeout(() => setShowVisitedDropdown(false), 200)}
                                />
                            </div>
                            {showVisitedDropdown && (
                                <div className="border rounded-lg max-h-60 overflow-y-auto mt-1 bg-white shadow-md z-50 absolute w-full">
                                    {allCountries
                                        .filter(c => !visitedCountries.find(vc => vc.id === c.id))
                                        .map(c => (
                                            <div
                                                key={c.id}
                                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                onMouseDown={() => setVisitedCountries([...visitedCountries, c])}
                                            >
                                                {c.name}
                                            </div>
                                        ))}
                                </div>
                            )}

                            <h2 className="text-lg font-semibold text-cyan-700 mt-6">Dream Destinations</h2>
                            <div className="flex flex-wrap gap-2 border p-2 rounded-lg bg-white">
                                {dreamCountries.map((c) => (
                                    <span key={c.id} className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 flex items-center gap-1">
                                        {c.name}
                                        <button onClick={() => setDreamCountries(prev => prev.filter(v => v.id !== c.id))}>✖</button>
                                    </span>
                                ))}
                                <input
                                    type="text"
                                    placeholder="Add country..."
                                    className="flex-1 outline-none"
                                    onFocus={() => setShowDreamDropdown(true)}
                                    onBlur={() => setTimeout(() => setShowDreamDropdown(false), 200)}
                                />
                            </div>
                            {showDreamDropdown && (
                                <div className="border rounded-lg max-h-60 overflow-y-auto mt-1 bg-white shadow-md z-50 absolute w-full">
                                    {allCountries
                                        .filter(c => !dreamCountries.find(vc => vc.id === c.id))
                                        .map(c => (
                                            <div
                                                key={c.id}
                                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                onMouseDown={() => setDreamCountries([...dreamCountries, c])}
                                            >
                                                {c.name}
                                            </div>
                                        ))}
                                </div>
                            )}
                        </section>

                        <div className="flex justify-end">
                            <motion.button type="submit" whileHover={{ scale: 1.03 }} className="px-8 py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition shadow-lg cursor--pointer">
                                Save Changes
                            </motion.button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}