import SearchComponent from "../../search/components/SearchComponent";
import { PenSquare, Image as ImageIcon } from "lucide-react";

type Props = {
  onCreatePost: () => void;
};

export default function FeedHeader({ onCreatePost }: Props) {
  return (
    <div className="flex flex-col gap-5 w-full">
      
      {/* Top Header & Desktop Search */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Feed
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Discover latest adventures
          </p>
        </div>
        
        <div className="hidden sm:block w-[280px]">
          <SearchComponent />
        </div>
      </div>

      {/* Mobile Search */}
      <div className="block sm:hidden w-full">
        <SearchComponent />
      </div>

      {/* Modern Interactive "Create Post" Trigger */}
      <div 
        onClick={onCreatePost}
        className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-3 cursor-text transition-all hover:shadow-md group"
      >
        <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-50 transition-colors">
          <PenSquare className="h-5 w-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
        </div>
        
        <div className="flex-1 bg-slate-50 group-hover:bg-slate-100/50 transition-colors rounded-full py-2.5 px-4 text-slate-500 text-sm font-medium">
          Share your adventure with the community...
        </div>
        
        <button 
          className="p-2 rounded-full hover:bg-slate-100 text-indigo-500 transition-colors focus:outline-none"
          aria-label="Add Photo"
        >
          <ImageIcon className="h-5 w-5" />
        </button>
      </div>

    </div>
  );
}