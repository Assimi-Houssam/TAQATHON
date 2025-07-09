"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SectionTitle } from "@/components/ui/taqa/HistoryComponent";
import { UserProfile } from "@/components/ui/taqa/layout/ProfileSupplier/EntityProfile";
import { PurchaseRequestsTable } from "@/components/ui/taqa/purchaseRequestsTable";
import CollapWrapper from "@/components/ui/taqa/CollapWrapper";
import { companyMembers, companyStatics } from "@/types/EntityProfile";
import { EllipsisVertical, Mail, Phone } from "lucide-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DocumentsTable } from "@/components/ui/taqa/documentsTable";
import { User } from "@/types/entities";
import { useTranslations } from "next-intl";

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
      className={`flex flex-col justify-center w-full 2xl:p-3 p-2 border rounded gap-2 bg-${stat.color}-50 bg-opacity-20 ${className}`}
    >
      <div className="flex justify-between">
        <div className="line-clamp-1">{stat.title}</div>
        <stat.icon className="2xl:size-6 size-4" />
      </div>
      <div className={`font-semibold text-2xl text-${stat.color}-700`}>
        {stat.value}
      </div>
      <div className="font-light text-gray-500 line-clamp-1 text-[0.6rem] 2xl:text-sm">
        {stat.description}
      </div>
    </div>
  );
}

function ContactInfoComponent({ member }: { member: companyMembers }) {
  return (
    <div className="font-light text-gray-500 hover:underline cursor-pointer absolute right-0 top-0 hover:bg-gray-50 size-6 rounded-full m-1 flex justify-center items-center">
      <AlertDialog>
        <AlertDialogTrigger>
          <EllipsisVertical className="text-gray-500 size-4" />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {member.fullname},{" "}
              <span className="font-normal">{member.role}</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="flex flex-col gap-4 text-black">
              <span className="line-clamp-4 text-gray-800">
                {member.description}
              </span>
              <span className="flex flex-col gap-1">
                <Link
                  href={"#"}
                  className="flex items-center gap-2 hover:underline w-fit"
                >
                  <Phone className="size-4" />
                  <span className="line-clamp-1">{member.mobile}</span>
                </Link>
                <Link
                  href={"#"}
                  className="flex items-center gap-2 hover:underline w-fit"
                >
                  <Mail className="size-4" />
                  <span className="line-clamp-1">{member.email}</span>
                </Link>
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function MembersCard({ member }: { member: companyMembers }) {
  return (
    <div
      key={member.id}
      className="flex flex-col gap-2 justify-center items-center p-4 border rounded-lg w-full overflow-hidden relative bg-white"
    >
      <Avatar className="size-24">
        <AvatarImage src={member.image} alt="user avatar" />
        <AvatarFallback>YL</AvatarFallback>
      </Avatar>
      <div className="text-center">
        <h1 className="text-xl line-clamp-1">
          {member.fullname} Lorem ipsum dolor sit amet consectetur adipisicing
          elit. Enim maxime doloremque tempore incidunt, itaque obcaecati? Nulla
          suscipit, adipisci harum optio atque omnis debitis, laborum iure sequi
          perferendis, voluptates corrupti. Aut.
        </h1>
        <h1 className="text-xs text-blue-500 line-clamp-1">
          {member.role}
        </h1>
      </div>
      <p className="text-center text-xs line-clamp-2 text-gray-700">
        {member.description}
      </p>
      <ContactInfoComponent member={member} />
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
      <div className="rounded-lg transition-all space-y-4">
        <div className="grid lg:grid-cols-4 grid-cols-2 gap-4 justify-between items-center">
          {companyMembers.map((member) => (
            <MembersCard key={member.id} member={member} />
          ))}
        </div>
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
  return (
    <CollapWrapper title={t("company_page.statistics")}>
      <div className="rounded-lg transition-all space-y-4">
        <div className="grid gap-3 2xl:gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-5">
          {companyStatics.map((stat, index) => (
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

function EntityComponent({ entity, type }: { entity: User; type: string }) {
  const t = useTranslations("historyComponent");
  return (
    <div className="h-full w-full flex flex-col gap-6 text-sm bg-white">
      <UserProfile entity={entity} type={type} />
      {type === "company" && (
        <>
          <CompanyStaticsComponent companyStatics={[]} />
          <CompanyDocuments />
          <CompanyMembersComponent companyMembers={[]} />
        </>
      )}
      {type === "agent" && (
        <div>
          <SectionTitle title={t("purchaseRequest.title")} />

          <PurchaseRequestsTable type="table" />
        </div>
      )}
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
