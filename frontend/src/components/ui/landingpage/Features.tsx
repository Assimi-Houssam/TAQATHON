import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

// Features Component
export const Features = () => {
  const t = useTranslations("features");

  const procurementSteps = [
    {
      title: t("registration.title"),
      description: t("registration.description"),
    },
    {
      title: t("verification.title"),
      description: t("verification.description"),
    },
    {
      title: t("platformAccess.title"),
      description: t("platformAccess.description"),
    },
    {
      title: t("bidSubmission.title"),
      description: t("bidSubmission.description"),
    },
    {
      title: t("contractAward.title"),
      description: t("contractAward.description"),
    },
  ];

  return (
    <section className="container mx-auto px-6 py-24">
      <h2 className="text-4xl font-bold text-custom-green-900 text-center mb-16">
        {t("title")}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 md:gap-8">
        {procurementSteps.map((step, index) => (
          <Card
            key={step.title}
            className="group hover:shadow-lg transition-all duration-300 border-none bg-white/50 backdrop-blur-sm hover:-translate-y-1 hover:bg-white/80"
          >
            <CardHeader className="sm:min-h-[100px]">
              <div className="flex items-start gap-4">
                <span className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-custom-green-100 text-custom-green-900 font-bold text-lg transition-colors group-hover:bg-custom-green-200">
                  {index + 1}
                </span>
                <CardTitle className="text-custom-green-800 text-lg sm:text-xl group-hover:text-custom-green-900 transition-colors">
                  {step.title}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-custom-green-700 text-sm sm:text-base leading-relaxed group-hover:text-custom-green-800 transition-colors">
                {step.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
