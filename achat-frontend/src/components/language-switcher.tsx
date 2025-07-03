"use client";

import { setCookie } from "cookies-next/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const LanguageSwitcher = ({ currentLang }: { currentLang: string }) => {
  const router = useRouter();

  const handleLanguageChange = (locale: string) => {
    setCookie("NEXT_LOCALE", locale);
    router.push(`/${locale}`);
  };

  return (
    <div className="flex items-center space-x-4">
      <span className="text-custom-green-100">Language:</span>
      <div className="flex space-x-2">
        {["en", "fr"].map((locale) => (
          <Link
            key={locale}
            href={`/${locale}`}
            onClick={() => handleLanguageChange(locale)}
            className={`px-2 py-1 rounded ${
              currentLang === locale
                ? "bg-custom-green-700 text-white"
                : "text-custom-green-100 hover:text-white hover:bg-custom-green-800/50"
            } transition-all uppercase text-sm`}
          >
            {locale}
          </Link>
        ))}
      </div>
    </div>
  );
};
