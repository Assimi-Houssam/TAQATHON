"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

interface ReplyAvatarProps {
  imageUrl: string;
  name: string;
}

export function ReplyAvatar({ imageUrl, name }: ReplyAvatarProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsImageLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-8 h-8">
      <div className="w-full h-full rounded-full border bg-white overflow-hidden">
        <Image
          className={`rounded-full transition-opacity duration-300 ease-in-out ${
            isImageLoaded ? "opacity-100" : "opacity-0"
          }`}
          src={imageUrl ? process.env.NEXT_PUBLIC_API_URL + "/documents/avatar/" + imageUrl : "/placeholder.webp"}
          alt={`${name}'s profile`}
          width={32}
          height={32}
          onError={(e) => {
            if (!e.currentTarget.src.endsWith('/placeholder.webp')) {
              e.currentTarget.src = "/placeholder.webp";
            }
          }}
        />
      </div>
    </div>
  );
}
