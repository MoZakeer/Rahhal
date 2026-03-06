import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Calendar, Image as ImageIcon } from "lucide-react";

interface PostPreview {
  postId: string;
  description: string;
  authorUsername: string;
  authorProfilePicture?: string | null;
  createdAt: string;
  mediaUrls?: string[];
}

interface Props {
  post: PostPreview;
  baseUrl: string;
}

const SearchPostCard: React.FC<Props> = ({ post, baseUrl }) => {
  
  const mediaImageUrl =
    post.mediaUrls && post.mediaUrls.length > 0
      ? `${baseUrl}${post.mediaUrls[0]}`
      : null;

  const profileImageUrl = post.authorProfilePicture
    ? `${baseUrl}${post.authorProfilePicture}`
    : null;


  const truncatedDescription =
    post.description.length > 120
      ? `${post.description.substring(0, 120)}...`
      : post.description;

  return (
    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-gray-300 w-[20rem]">
      {/* قسم الصورة */}
      <div className="relative aspect-[4/2] bg-gray-100 overflow-hidden">
        {mediaImageUrl ? (
          <img
            src={mediaImageUrl}
            alt={post.description}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <ImageIcon className="w-12 h-12 text-gray-400" />
          </div>
        )}

       
        {post.mediaUrls && post.mediaUrls.length > 1 && (
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
            +{post.mediaUrls.length - 1}
          </div>
        )}
      </div>

      {/* قسم المحتوى */}
      <div className="p-5">
    
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
           
            <div className="flex-shrink-0">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt={post.authorUsername}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                  loading="lazy"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                  {post.authorUsername.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

           
            <div>
              <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer">
                {post.authorUsername}
              </h3>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
              </div>
            </div>
          </div>
        </div>

       
        <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-3">
          {truncatedDescription}
        </p>

       
        <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
          <button className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span>Like</span>
          </button>

          <button className="flex items-center gap-1.5 text-gray-600 hover:text-green-600 transition-colors text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span>Comment</span>
          </button>

          <button className="flex items-center gap-1.5 text-gray-600 hover:text-purple-600 transition-colors text-sm font-medium ml-auto">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
            <span>Save</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchPostCard;