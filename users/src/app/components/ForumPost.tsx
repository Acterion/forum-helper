"use client";

import { Post } from "@/types";
import Image from "next/image";

export default function ForumPost({ post, isMainPost = false }: { post: Post; isMainPost?: boolean }) {
  return (
    <div className={`flex gap-3 ${isMainPost ? "mb-0" : "mb-0"}`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div
          className={`${
            isMainPost ? "w-12 h-12" : "w-10 h-10"
          } bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-medium shadow-sm`}>
          {post.avatar ? (
            <Image
              src={post.avatar}
              alt={post.author}
              width={isMainPost ? 48 : 40}
              height={isMainPost ? 48 : 40}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className={`${isMainPost ? "text-base" : "text-sm"} font-medium`}>
              {post.author.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <h3 className={`font-medium text-gray-900 ${isMainPost ? "text-base" : "text-sm"}`}>{post.author}</h3>
          <span className="text-xs text-gray-500 flex-shrink-0">{post.timestamp}</span>
        </div>

        {/* Post Content */}
        <div className={`text-gray-800 leading-relaxed ${isMainPost ? "text-base" : "text-sm"}`}>{post.content}</div>
      </div>
    </div>
  );
}
