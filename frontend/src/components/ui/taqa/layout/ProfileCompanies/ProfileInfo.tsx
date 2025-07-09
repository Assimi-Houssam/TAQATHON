"use client";

import { Calendar, Mail, Phone } from "lucide-react";
import { Company } from "@/types/entities/index";
import { useTranslations } from "next-intl";

const ProfileHeader = ({ entity }: { entity: Company }) => {
  const t = useTranslations("companies");
  const { legal_name, city, description } = entity;
  return (
    <div className="flex flex-col items-start justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{legal_name}</h1>
        <div className="mt-1 text-gray-500">Est. 2010 | {city}</div>
      </div>
      <h2 className="mt-6 text-xl font-semibold text-gray-900">
        {t("company_page.about")}
      </h2>
      <p className="mt-2 text-gray-600 line-clamp-3 ">{description}</p>
    </div>
  );
};

const ContactInfo = ({
  phone,
  email,
  startDate,
}: {
  phone: string;
  email: string;
  startDate: string;
}) => {
  const t = useTranslations("profile");
  return (
    <div className="flex flex-col items-start *:w-full">
      <div className="">
        <a
          href={`tel:${phone}`}
          className="flex items-center p-2 gap-x-2 hover:underline rounded-lg hover:bg-blue-50 text-zinc-500 hover:text-zinc-700 cursor-pointer transition-all duration-150"
        >
          <Phone className="size-4" />
          <span className="">{phone}</span>
        </a>
      </div>
      <div className="">
        <a
          href={`mailto:${email}`}
          className="flex items-center p-2 gap-x-2 hover:underline rounded-lg hover:bg-blue-50 text-zinc-500 hover:text-zinc-700 cursor-pointer transition-all duration-150"
        >
          <Mail className="size-4" />
          <span>{email}</span>
        </a>
      </div>
      <div className="">
        <div className="flex items-center p-2 gap-x-2 rounded-lg hover:bg-blue-50 text-zinc-500 hover:text-zinc-700 transition-all duration-150 cursor-default select-none">
          <Calendar className="size-4" />
          <span>
            {t("entered_service")}: {startDate}
          </span>
        </div>
      </div>
    </div>
  );
};

export function ProfileInfo({ entity }: { entity: Company }) {
  return (
    <div className="pt-20 px-6 pb-8 flex 2xl:flex-row flex-col justify-between gap-4">
      <div>
        <ProfileHeader entity={entity} />
      </div>
      <div className="min-w-[20rem] flex gap-4 flex-col py-2">
        <ContactInfo
          phone={entity.company_phone || "N/A"}
          email={entity.email || "N/A"}
          startDate={"N/A"}
        />
      </div>
    </div>
  );
}
