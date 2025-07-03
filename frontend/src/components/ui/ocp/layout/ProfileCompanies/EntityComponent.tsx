"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserProfile } from "@/components/ui/ocp/layout/ProfileCompanies/EntityProfile";
import CollapWrapper from "@/components/ui/ocp/CollapWrapper";
import { companyMembers, companyStatics } from "@/types/EntityProfile";
import {
  EllipsisVertical,
  Mail,
  Phone,
  MessageCircle,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import Link from "next/link";

import { DocumentsTable } from "@/components/ui/ocp/documentsTable";
import { Company } from "@/types/entities";
import { useTranslations } from "next-intl";
import { useGetCompanyMembers } from "@/endpoints/company/get-company-members";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

function StatCard({
  stat,
  className,
}: {
  stat: companyStatics;
  className?: string;
}) {
  return (
    <div
      key={stat.id}
      className={`flex cursor-default flex-col justify-center w-full 2xl:p-4 p-3 border rounded-xl gap-3 transition-all duration-300 hover:shadow-md transform hover:-translate-y-1 ${className}`}
    >
      <div className="flex justify-between items-center">
        <div className="line-clamp-1 font-medium text-gray-700">
          {stat.title}
        </div>
        <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
          <stat.icon className="2xl:size-6 size-5 text-gray-700" />
        </div>
      </div>
      <div className={`font-bold text-3xl text-${stat.color}-700`}>
        {typeof stat.value === "number"
          ? new Intl.NumberFormat("en-US", {
              notation: stat.value > 9999 ? "compact" : "standard",
              maximumFractionDigits: 1,
            }).format(stat.value)
          : stat.value}
      </div>
      <div className="font-normal text-gray-500 line-clamp-2 text-sm">
        {stat.description}
      </div>
    </div>
  );
}

function ContactInfoComponent({ member }: { member: companyMembers }) {
  return (
    <div className="ml-auto">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-gray-100 transition-colors"
          >
            <EllipsisVertical className="size-5 text-gray-400" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full max-w-md">
          <SheetHeader>
            <SheetTitle>
              <div className="flex items-center gap-3">
                <Avatar className="size-12">
                  <AvatarImage src={member.image} alt={member.fullname} />
                  <AvatarFallback>
                    {member.fullname.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg">{member.fullname}</h3>
                  <span className="text-sm text-custom-green-600 bg-custom-green-50 px-2 py-0.5 rounded-full">
                    {member.role}
                  </span>
                </div>
              </div>
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {member.description && (
              <div className="space-y-2">
                <div className="font-medium text-gray-700">About</div>
                <div className="text-sm text-gray-600 leading-relaxed">
                  {member.description}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="font-medium text-gray-700">
                Contact Information
              </div>
              <div className="">
                {member.mobile && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-gray-600 hover:text-gray-900"
                    asChild
                  >
                    <Link href={`tel:${member.mobile}`}>
                      <Phone className="size-4" />
                      <span>{member.mobile}</span>
                    </Link>
                  </Button>
                )}
                {member.email && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-gray-600 hover:text-gray-900"
                    asChild
                  >
                    <Link href={`mailto:${member.email}`}>
                      <Mail className="size-4" />
                      <span>{member.email}</span>
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function MembersCard({ member }: { member: companyMembers }) {
  const t = useTranslations("companies");

  return (
    <div className="group bg-white rounded-lg border hover:shadow-sm transition-all">
      {/* Header Section */}
      <div className="p-4 space-y-4">
        {/* Avatar and Name */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="size-12 border-2 border-white ring-1 ring-gray-100">
              <AvatarImage src={member.image} alt={member.fullname} />
              <AvatarFallback className="bg-gray-50 text-sm font-medium">
                {member.fullname.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-gray-900">{member.fullname}</h3>
              <span className="inline-flex text-sm text-custom-green-600 bg-custom-green-50/50 px-2 py-0.5 rounded-full">
                {member.role}
              </span>
            </div>
          </div>
          <ContactInfoComponent member={member} />
        </div>

        {/* Description */}
        {member.description && (
          <p className="text-sm text-gray-500 line-clamp-2">
            {member.description}
          </p>
        )}
      </div>

      {/* Actions Footer */}
      <div className="px-4 py-3 border-t bg-gray-50/50 flex items-center justify-between">
        <div className="flex gap-1">
          {member.mobile && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-500"
              asChild
            >
              <Link href={`tel:${member.mobile}`}>
                <Phone className="size-4" />
                <span className="sr-only">{t("call_member")}</span>
              </Link>
            </Button>
          )}
          {member.email && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-500"
              asChild
            >
              <Link href={`mailto:${member.email}`}>
                <Mail className="size-4" />
                <span className="sr-only">{t("email_member")}</span>
              </Link>
            </Button>
          )}
        </div>
        <Button variant="ghost" size="sm" className="h-8 text-gray-500" asChild>
          <Link href={`/dashboard/chat/${member.id}`}>
            <MessageCircle className="size-4 mr-2" />
            <span className="text-sm">{t("chat_with_member")}</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}

function CompanyMembersComponent({
  companyMembers,
}: {
  companyMembers: companyMembers[];
}) {
  const t = useTranslations("companies");
  return (
    <CollapWrapper title={t("company_page.members")}>
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <span className="text-sm text-gray-500">
            {t("company_page.total_members")}:{" "}
            <span className="font-medium text-gray-900">
              {companyMembers.length}
            </span>
          </span>
        </div>

        {companyMembers.length === 0 ? (
          <div className="text-center py-12">
            <div className="size-16 mx-auto mb-4 text-gray-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-900">
              {t("company_page.no_members_title")}
            </h3>
            <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
              {t("company_page.no_members_description")}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {companyMembers.map((member) => (
              <MembersCard key={member.id} member={member} />
            ))}
          </div>
        )}
      </div>
    </CollapWrapper>
  );
}

function CompanyStaticsComponent({
  companyStatics,
}: {
  companyStatics: companyStatics[];
}) {
  const t = useTranslations("companies");

  // Calculate total and trends
  const total = companyStatics.reduce(
    (acc, stat) => acc + (typeof stat.value === "number" ? stat.value : 0),
    0
  );

  return (
    <CollapWrapper title={t("company_page.statistics")}>
      <div className="rounded-lg transition-all space-y-6">
        {/* Summary section */}
        <div className="flex items-center justify-end px-2">
          <div className="text-sm text-gray-500">
            {t("company_page.total_value")}:{" "}
            <span className="font-semibold text-gray-700">
              {new Intl.NumberFormat("en-US", {
                notation: "compact",
                maximumFractionDigits: 1,
              }).format(total)}
            </span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid gap-4 2xl:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-5">
          {companyStatics.slice(0, 5).map((stat, index) => (
            <StatCard
              className={
                index === companyStatics.length - 1
                  ? "xl:col-span-1 col-span-full"
                  : ""
              }
              key={stat.id}
              stat={stat}
            />
          ))}
        </div>
      </div>
    </CollapWrapper>
  );
}

function CompanyDocuments() {
  const t = useTranslations("companies");
  return (
    <div>
      <CollapWrapper title={t("company_page.documents")}>
        <DocumentsTable />
      </CollapWrapper>
    </div>
  );
}

function EntityComponent({ entity }: { entity: Company }) {
  const { data: members } = useGetCompanyMembers(entity.id);
  const companyStatics: companyStatics[] = [
    {
      id: 1,
      title: "Total Members",
      value: 57,
      description: "Active team members",
      color: "gray",
      icon: Users,
    },
    {
      id: 2,
      title: "Total Bids",
      value: 1234,
      description: "All bids submitted",
      color: "blue",
      icon: FileText,
    },
    {
      id: 3,
      title: "Won Bids",
      value: 789,
      description: "63.9% success rate",
      color: "green",
      icon: CheckCircle,
    },
    {
      id: 4,
      title: "Lost Bids",
      value: 312,
      description: "25.3% loss rate",
      color: "red",
      icon: XCircle,
    },
    {
      id: 5,
      title: "Total Bids",
      value: 133,
      description: "10.8% awaiting decision",
      color: "orange",
      icon: Clock,
    },
  ];

  const displayMembers: companyMembers[] = members
    ? members.map((member) => ({
        id: member.id.toString(),
        fullname: `${member.first_name} ${member.last_name}`,
        image: member.avatar?.url || "",
        email: member.email || "",
        role: "Member",
        description: member.bio || "No description available",
        mobile: member.phone_number || "",
      }))
    : [];

  return (
    <div className="h-full w-full flex flex-col gap-6 text-sm bg-white">
      <UserProfile entity={entity} />
      <CompanyStaticsComponent companyStatics={companyStatics} />
      <CompanyDocuments />
      <CompanyMembersComponent companyMembers={displayMembers || []} />
    </div>
  );
}

export {
  CompanyMembersComponent,
  CompanyStaticsComponent,
  EntityComponent,
  MembersCard,
  StatCard,
};
