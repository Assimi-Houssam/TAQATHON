import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

// Features Component
export const Features = () => {
  const t = useTranslations("features");

  const industrialFeatures = [
    {
      title: "Real-time Monitoring",
      description: "Monitor industrial systems and detect anomalies in real-time with advanced sensors and analytics"
    },
    {
      title: "Predictive Analytics", 
      description: "Use AI-powered analytics to predict potential failures and optimize maintenance schedules"
    },
    {
      title: "Automated Alerts",
      description: "Receive instant notifications when anomalies are detected, enabling rapid response and intervention"
    },
    {
      title: "Performance Tracking",
      description: "Track system performance metrics and generate comprehensive reports for continuous improvement"
    },
    {
      title: "Integration Capabilities",
      description: "Seamlessly integrate with existing industrial systems and third-party monitoring tools"
    },
    {
      title: "Compliance Management",
      description: "Ensure regulatory compliance with automated reporting and audit trail functionality"
    }
  ];

  return (
    <section className="container mx-auto px-6 py-24">
      <h2 className="text-4xl font-bold text-custom-green-900 text-center mb-16">
        {t("title")}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 md:gap-8">
        {industrialFeatures.map((feature, index) => (
          <Card
            key={feature.title}
            className="group hover:shadow-lg transition-all duration-300 border-none bg-white/50 backdrop-blur-sm hover:-translate-y-1 hover:bg-white/80"
          >
            <CardHeader className="sm:min-h-[100px]">
              <div className="flex items-start gap-4">
                <span className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-custom-green-100 text-custom-green-900 font-bold text-lg transition-colors group-hover:bg-custom-green-200">
                  {index + 1}
                </span>
                <CardTitle className="text-custom-green-800 text-lg sm:text-xl group-hover:text-custom-green-900 transition-colors">
                  {feature.title}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-custom-green-700 text-sm sm:text-base leading-relaxed group-hover:text-custom-green-800 transition-colors">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
