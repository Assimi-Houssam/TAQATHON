"use client";

import {
  Calendar,
  Mail,
  Phone,
  MessageCircle,
  Ellipsis,
  Settings,
} from "lucide-react";
import { User } from "@/types/entities/index";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { StartChat } from "@/endpoints/chat/start-chat";
import { useUser } from "@/context/user-context";
import { toast } from "sonner";

const ProfileHeader = ({ profile, type }: { profile: User; type: string }) => {
  const {
    username: name,
    entity_type: role,
    title: title,
    // bio: description,
  } = profile;
  const t = useTranslations();
  return (
    <div className="w-full flex flex-col items-start justify-start gap-4">
      <div className="w-full">
        <h1 className="text-3xl font-bold text-gray-900">{name}</h1>
        {type === "agent" ? (
          <div className="mt-1 text-gray-500">
            Age: {17} | Role: {role}
          </div>
        ) : (
          <div className="mt-1 text-gray-500">Est. 2010 | {title}</div>
        )}
      </div>
      <h2 className="mt-6 text-xl font-semibold text-gray-900">
        {type === "company" || type === "supplier"
          ? t("companies.company_page.about")
          : title}
      </h2>
    </div>
  );
};

const CompanyInfo = ({ company }: { company: string }) => (
  <div className="flex gap-2 items-center rounded-lg cursor-pointer w-full transition-all duration-200 select-none">
    <div className="h-10 w-10 rounded-full bg-black flex items-center justify-center">
      <span className="text-white text-xs">
        {company.slice(0, 2).toUpperCase()}
      </span>
    </div>
    <span className="text-gray-900 font-medium line-clamp-1">{company}</span>
  </div>
);

const ContactInfo = ({ profile }: { profile: User }) => {
  const { email, phone_number: phone } = profile;
  const t = useTranslations("profile");

  return (
    <div className="flex flex-col items-start">
      <Link
        href={`tel:${phone}`}
        className="flex items-center p-2 gap-x-2 w-full hover:underline rounded-lg text-zinc-500 hover:text-zinc-700 transition-all duration-150"
      >
        <Phone className="size-4" />
        <span className="line-clamp-1">{phone}</span>
      </Link>

      <Link
        href={`mailto:${email}`}
        className="flex items-center p-2 gap-x-2 w-full hover:underline rounded-lg text-zinc-500 hover:text-zinc-700 transition-all duration-150"
      >
        <Mail className="size-4" />
        <span className="line-clamp-1">{email}</span>
      </Link>

      <Link
        href={`#`}
        onClick={(e) => e.preventDefault()}
        className="flex items-center p-2 gap-x-2 w-full rounded-lg text-zinc-500 hover:text-zinc-700 transition-all duration-150 cursor-default select-none"
      >
        <Calendar className="size-4" />
        <span className="line-clamp-1">
          {t("entered_service")}: {"N/A"}
        </span>
      </Link>
    </div>
  );
};

export function ProfileInfo({
  profile,
  type,
}: {
  profile: User;
  type: string;
}) {
  const { mutateAsync: CreateChat } = StartChat();
  const { user } = useUser();

  const handleSendMessage = async (id: number) => {
    if (!user) return;

    try {
      const data = await CreateChat({
        chat_name: `${profile.username} Chat`,
        chat_description: `Chat with ${profile.username}`,
        chat_members: [id],
        chat_type: "DIRECT",
      });

      if (data) {
        toast.success("Chat started successfully");
        window.open(`/dashboard/chat/${data.id}`, "_blank");
      }
    } catch (error) {
      console.log(error); // useless, just for eslint, should be removed later
    }
  };
  
  return (
    <div className="flex flex-col gap-2">
      <div className="w-full p-2 flex gap-2 justify-end items-center h-16">
        <div className="p-1 px-2 select-none cursor-pointer rounded-md h-8 gap-1 md:flex justify-center items-center min-w-24 bg-white hover:bg-zinc-50 border border-zinc-300 hidden transition-all">
          <Settings className="size-4" />
          <div>Settings</div>
        </div>
        <div
          onClick={() => handleSendMessage(profile.id)}
          className="p-1 px-2 select-none cursor-pointer rounded-md h-8 gap-1 flex justify-center items-center min-w-24 border border-custom-green-600 bg-custom-green-400 active:bg-custom-green-600 text-white transition-all"
        >
          <MessageCircle className="size-4" />
          <div>Message</div>
        </div>
        <div className="p-1 px-2 select-none cursor-pointer rounded-md h-8 flex justify-center items-center bg-white hover:bg-zinc-50 border border-zinc-300 transition-all">
          <Ellipsis className="size-4" />
        </div>
      </div>
      {/* <hr /> */}
      <div className="flex md:flex-row flex-col p-4 justify-between gap-2 xl:gap-4">
        <ProfileHeader profile={profile} type={type} />
        <div className="flex justify-end gap-2 flex-col w-1/2 bg-zinc-0 rounded-lg">
          {type === "agent" && (
            <CompanyInfo company={"Company Name Here. Inc"} />
          )}
          <ContactInfo profile={profile} />
        </div>
      </div>
    </div>
  );
}
