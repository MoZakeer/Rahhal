import { PenSquare, Image as ImageIcon } from "lucide-react";

type Props = {
  onCreatePost: () => void;
};

export default function FeedHeader({ onCreatePost }: Props) {
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header Text */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Feed
        </h1>
        <p className="text-slate-500 font-medium mt-1">
          Explore world through travelers' eyes
        </p>
      </div>

      {/* Create Post Trigger */}
      <div 
        onClick={onCreatePost}
        className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center gap-4 cursor-text transition-all hover:shadow-lg hover:border-indigo-100 group"
      >
        <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-600 transition-all duration-300">
          <PenSquare className="h-6 w-6 text-indigo-600 group-hover:text-white transition-colors" />
        </div>
        
        <div className="flex-1 bg-slate-50 group-hover:bg-white transition-colors rounded-2xl py-3 px-5 text-slate-400 text-sm font-medium border border-transparent group-hover:border-slate-100">
          Share your next adventure, {localStorage.getItem('username') || 'Traveler'}...
        </div>
        
        <button className="p-3 rounded-2xl hover:bg-indigo-50 text-indigo-500 transition-all">
          <ImageIcon className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}