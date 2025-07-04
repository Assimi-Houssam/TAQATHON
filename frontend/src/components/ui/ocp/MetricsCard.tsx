import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const MetricValue = ({ value }: { value: string }) => (
  <p className=" text-xl md:text-2xl font-semibold text-gray-900 leading-none line-clamp-1">
    {value}
  </p>
);

const MetricSubtitle = ({ subtitle }: { subtitle: string }) => (
  <p className="text-gray-500 text-sm leading-none line-clamp-1">{subtitle}</p>
);

const MetricIcon = ({ icon }: { icon: React.ReactNode }) => (
          <div className="p-2 rounded-xl bg-blue-500/10">
          <span className="text-blue-600 text-lg">{icon}</span>
  </div>
);

const MetricContent = ({
  value,
  subtitle,
}: {
  value: string;
  subtitle: string;
}) => (
  <div className="flex flex-col space-y-2">
    <MetricValue value={value} />
    <MetricSubtitle subtitle={subtitle} />
  </div>
);

interface MetricsCardProps {
  item: {
    title?: string;
    value?: string;
    subtitle?: string;
    icon?: React.ReactNode;
    subMetrics?: Array<{
      value: string;
      subtitle: string;
    }>;
  };
  className?: string;
}

export const MetricsCard = ({ item, className = "" }: MetricsCardProps) => {
  const Header = () => (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-gray-800 font-medium leading-none text-sm">
        {item.title}
      </h2>
      <MetricIcon icon={item.icon} />
    </div>
  );

  const cardClasses = cn(
    "relative bg-white/90 backdrop-blur-xl rounded-xl shadow-sm border border-gray-100/50",
    "transition-all duration-300 ease-in-out"
  );

  const contentClasses = "p-4 flex flex-col h-full";

  if (item.subMetrics) {
    return (
      <div className={cn(className, "w-full h-full")}>
        <Card className={cn(cardClasses, "w-full h-full")}>
          <CardContent className={cn(contentClasses, "w-full h-full")}>
            <Header />
            <Carousel className="w-full flex-1">
              <div className="flex flex-col justify-between h-full">
                <CarouselContent>
                  {item.subMetrics.map((subMetric, index) => (
                    <CarouselItem key={index} className="pt-0">
                      <div className="flex flex-col justify-between h-full">
                        <div className="mt-auto">
                          <MetricContent
                            value={subMetric.value}
                            subtitle={subMetric.subtitle}
                          />
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                <div className="flex justify-end items-center gap-2 mt-4 absolute bottom-0 right-0">
                  <CarouselPrevious className="h-7 w-7 p-1.5 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 static translate-y-0 transition-colors duration-200">
                    <ChevronLeft className="h-3 w-3" />
                  </CarouselPrevious>
                  <CarouselNext className="h-7 w-7 p-1.5 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 static translate-y-0 transition-colors duration-200">
                    <ChevronRight className="h-3 w-3" />
                  </CarouselNext>
                </div>
              </div>
            </Carousel>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn(className, "w-full h-full")}>
      <Card className={cn(cardClasses, "w-full h-full")}>
        <CardContent className={cn(contentClasses, "w-full h-full")}>
          <Header />
          <div className="flex flex-col justify-between h-full">
            <div className="mt-auto">
              {item.value && item.subtitle && (
                <MetricContent value={item.value} subtitle={item.subtitle} />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
