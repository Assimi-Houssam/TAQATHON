"use client";

import { useEffect, useState } from "react";
import { User } from "@/types/entities/index";
import { EntityComponent } from "@/components/ui/taqa/layout/ProfileAgents/EntityComponent";
import { HistoryComponent } from "@/components/ui/taqa/HistoryComponent";
import { useGetProfile } from "@/endpoints/user/get-profile";
import LoadingSpinner from "@/components/ui/loading-spinner";

interface PageProps {
  params: Promise<{ id: number }>;
}

function ProfilePage({ profile }: { profile: User }) {
  return (
    <div className="flex flex-col xl:flex-row w-full h-full gap-4 2xl:gap-4">
      <EntityComponent profile={profile} type={"agent"} />
      <HistoryComponent profile={profile} type="agent" />
    </div>
  );
}

export default function Page({ params }: PageProps) {
  const [currentProfileId, setCurrentProfileId] = useState<string>("");

  useEffect(() => {
    async function fetchId() {
      const fetchedParams = await params;
      setCurrentProfileId(fetchedParams.id.toString());
    }
    fetchId();
  }, [params]);

  const { data: profile, isLoading } = useGetProfile(currentProfileId);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="p-4">
      {profile ? <ProfilePage profile={profile} /> : null}
    </div>
  );
}
