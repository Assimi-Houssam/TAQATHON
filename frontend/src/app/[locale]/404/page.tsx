import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function NotFound() {
  const t = await getTranslations("error.404");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white via-custom-green-50/50 to-custom-green-100/30">
      <div className="text-center space-y-8">
        <h1 className="text-6xl font-bold text-custom-green-800">404</h1>
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-custom-green-800">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700">{t("title")}</h2>
          <p className="text-gray-600 max-w-md mx-auto">{t("description")}</p>
        </div>

        <div className="space-x-4">
          <Link href=".." className="inline-block">
            <Button variant="outline">{t("buttonBack")}</Button>
          </Link>
          <Link href="/" className="inline-block">
            <Button>{t("buttonHome")}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
