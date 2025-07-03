"use client";

import { Company } from "@/types/entities/index";
import { ProfileAvatar } from "./ProfileAvatar";
import { ProfileBanner } from "./ProfileBanner";
import { ProfileInfo } from "./ProfileInfo";

export function UserProfile({ entity }: { entity: Company }) {
  return (
    <div className="rounded-lg overflow-hidden border">
      <div className="relative">
        <ProfileBanner imageUrl={entity.logo || ""} />
        <ProfileAvatar imageUrl={entity.logo || ""} name={entity.legal_name} />
      </div>
      <ProfileInfo entity={entity} />
    </div>
  );
}
