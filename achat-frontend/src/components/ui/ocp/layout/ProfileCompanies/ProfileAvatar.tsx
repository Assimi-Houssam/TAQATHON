import React, { useState, useEffect } from "react";
import Image from "next/image";

interface ProfileAvatarProps {
  imageUrl: string;
  name: string;
}

export function ProfileAvatar({ imageUrl, name }: ProfileAvatarProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsImageLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="absolute -bottom-16 left-4">
      <div className="size-32 rounded-full border bg-white overflow-hidden">
        <Image
          className={`rounded-full transition-opacity duration-300 ease-in-out ${
            isImageLoaded ? "opacity-100" : "opacity-0"
          }`}
          src={imageUrl || "/placeholder.webp"}
          alt={`${name}'s profile`}
          layout="fill"
          objectFit="cover"
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
