"use client";

import React from "react";

interface ProfileBannerProps {
  imageUrl: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ProfileBanner({ imageUrl }: ProfileBannerProps) {
  return (
    <div className="relative h-28 border-b w-full bg-gradient-to-tr from-green-700 to-custom-green-200 overflow-hidden"></div>
  );
}
