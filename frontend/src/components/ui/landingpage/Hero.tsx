import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";

export const Hero = () => {
  const t = useTranslations("hero");

  return (
    <section className="container mx-auto px-4 sm:px-6 pt-24 sm:pt-32">
      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
        <div className="w-full md:w-1/2 space-y-6 md:space-y-8 text-center md:text-left animate-fade-in">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-custom-green-900 tracking-tight">
            {t("title")}
          </h1>
          <p className="text-lg sm:text-xl text-custom-green-800/90 leading-relaxed max-w-2xl md:max-w-none mx-auto">
            {t("description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button
                variant="default"
                size="lg"
                className="w-full sm:w-auto hover:shadow-lg"
              >
                {t("registerButton")}
              </Button>
            </Link>
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto hover:shadow-lg hover:bg-custom-green-50"
              >
                {t("browseButton")}
              </Button>
            </Link>
          </div>
        </div>

        <div className="w-full md:w-1/2 relative animate-fade-in-delayed group mt-8 md:mt-0">
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 group-hover:shadow-3xl">
            <Image
                          src="/ftaqa_building.png"
            alt="TAQA Facility"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/60 to-transparent transition-opacity duration-500 group-hover:opacity-40" />
          </div>
        </div>
      </div>
    </section>
  );
};
