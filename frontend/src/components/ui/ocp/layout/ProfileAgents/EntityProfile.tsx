"use client";

import { User } from "@/types/entities";
import { ProfileAvatar } from "./ProfileAvatar";
import { ProfileBanner } from "./ProfileBanner";
import { ProfileInfo } from "./ProfileInfo";

export function UserProfile({
  profile,
  type,
}: {
  profile: User;
  type: string;
}) {
  return (
    <div className="rounded-lg overflow-hidden border">
      <div className="relative">
        <ProfileBanner imageUrl={profile.avatar?.url || ""} />
        <ProfileAvatar
          imageId={profile.avatar?.id || ""}
          name={profile.username}
        />
      </div>
      <ProfileInfo profile={profile} type={type} />
    </div>
  );
}
