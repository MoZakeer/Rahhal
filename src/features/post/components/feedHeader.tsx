import { useNavigate } from "react-router-dom";
import SearchComponent from "../../search/components/SearchComponent";

export default function FeedHeader() {
  const navigate = useNavigate();

  return (
    <div className="w-full mb-6 px-4 sm:px-8">
      {/* Responsive Container */}
      <div className="flex flex-col md:grid md:grid-cols-3 md:items-center gap-4 md:gap-6">
        
        {/* Left: Title */}
        <div className="flex flex-col justify-center md:justify-start text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Rahhal Feed
          </h1>
          <p className="text-sm md:text-base text-gray-500">
            Share your adventures with the community
          </p>
        </div>

        {/* Center: Search Component */}
        <div className="flex justify-center md:justify-center w-full">
          <div className="w-full max-w-md">
            <SearchComponent />
          </div>
        </div>

        {/* Right: Create Post */}
        <div className="flex justify-center md:justify-end">
          <button
            onClick={() => navigate("/create-post")}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm md:text-base text-white bg-cyan-500 hover:bg-cyan-600 transition-colors shadow"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 md:h-5 md:w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create post
          </button>
        </div>

      </div>
    </div>
  );
}