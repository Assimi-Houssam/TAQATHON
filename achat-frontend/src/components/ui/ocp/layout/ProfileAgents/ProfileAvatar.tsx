import React, { useState, useEffect } from "react";
import Image from "next/image";

interface ProfileAvatarProps {
  imageId: string;
  name: string;
}

export function ProfileAvatar({ imageId, name }: ProfileAvatarProps) {
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
          src={imageId ? process.env.NEXT_PUBLIC_API_URL + "/documents/avatar/" + imageId : "/placeholder.webp"}
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
