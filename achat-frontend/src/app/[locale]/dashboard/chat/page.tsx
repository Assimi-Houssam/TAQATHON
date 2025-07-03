"use client";
import { useTranslations } from "next-intl";

const NoChatSelected = () => {
  const t = useTranslations("chat");
  return (
    <div className="w-full h-full text-center flex flex-col justify-center gap-2 2xl:gap-3">
      <h1 className="text-zinc-500 font-light select-none 2xl:text-xl">
        {t("no_chat_selected")}
      </h1>
    </div>
  );
};

const page = () => {
  return <NoChatSelected />;
};

export default page;
