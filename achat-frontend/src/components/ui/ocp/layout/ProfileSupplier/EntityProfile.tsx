"use client";

import { ProfileAvatar } from "./ProfileAvatar";
import { ProfileBanner } from "./ProfileBanner";
import { ProfileInfo } from "./ProfileInfo";
import { User } from "@/types/entities/index";

export function UserProfile({
  entity,
  type,
}: {
  entity: User;
  type: string;
}) {
  return (
    <div className="rounded-lg overflow-hidden border">
      <div className="relative">
        <ProfileBanner imageUrl={entity.avatar?.url || ""} />
        <ProfileAvatar imageUrl={entity.avatar?.url || ""} name={entity.username} />
      </div>
      <ProfileInfo entity={entity} type={type} />
    </div>
  );
}
