"use client";

import { Post } from "@/types";
import Image from "next/image";

export default function ForumPost({ post, isMainPost = false }: { post: Post; isMainPost?: boolean }) {
  return (
    <div className={`flex space-x-4 ${isMainPost ? "mb-6" : "mb-4"}`}>
      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
        {post.avatar ? (
          <Image src={post.avatar} alt={post.author} width={40} height={40} className="w-full h-full rounded-full" />
        ) : (
          <span className="text-sm font-bold">{post.author.slice(0, 2).toUpperCase()}</span>
        )}
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <h3 className={`font-semibold ${isMainPost ? "text-lg" : "text-base"}`}>{post.author}</h3>
          <span className="text-sm text-gray-500">{post.timestamp}</span>
        </div>
        <p className={isMainPost ? "text-base" : "text-sm"}>{post.content}</p>
      </div>
    </div>
  );
}
