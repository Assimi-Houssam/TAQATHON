import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

const ImagesCarousel = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const t = useTranslations();

  const carouselImages = [
    {
      src: "https://www.barlamantoday.com/wp-content/uploads/2024/05/WhatsApp-Image-2024-05-03-at-14.34.17.jpeg",
      title: "OCP Foundation",
      description: "Empowering communities through sustainable development",
    },
    {
      src: "https://www.ocpgroup.ma/media/2020-07/Caravane%20agricole%20-%20Fondation%20OCP%20-%20RWANDA%20-%202019_1_0.jpg",
      title: "Agricultural Development",
      description: "Supporting farmers and agricultural initiatives",
    },
    {
      src: "https://ocpsiteprodsa.blob.core.windows.net/media/styles/wide_x1_max_w1440/azblob/2020-07/Screen%20Shot%202020-07-12%20at%2022.01.07.png",
      title: "Innovation & Technology",
      description: "Driving progress through technological advancement",
    },
    {
      src: "https://ocpsiteprodsa.blob.core.windows.net/media/2020-07/OCP_hero_Ethiopia_%201440_compressed.jpg",
      title: "Global Impact",
      description: "Making a difference across continents",
    },
  ];

  useEffect(() => {
    if (!api) {
      return;
    }

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });

    const autoScrollInterval = setInterval(() => {
      const isLastSlide =
        api.selectedScrollSnap() === carouselImages.length - 1;
      if (isLastSlide) {
        api.scrollTo(0);
      } else {
        api.scrollNext();
      }
    }, 5000);

    return () => clearInterval(autoScrollInterval);
  }, [api, carouselImages.length]);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center relative px-6">
      <div className="absolute inset-0 z-10" />

      <Carousel className="w-full max-w-6xl" setApi={setApi}>
        <CarouselContent>
          {carouselImages.map((image, index) => (
            <CarouselItem
              key={index}
              className="transition-all duration-700 ease-in-out"
            >
              <motion.div
                className="p-1 relative aspect-[16/9]"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{
                  opacity: current === index ? 1 : 0.5,
                  scale: current === index ? 1 : 0.95,
                }}
                transition={{ duration: 0.5 }}
              >
                <Image
                  src={image.src}
                  alt={`Carousel image ${index + 1}`}
                  fill
                  className="object-cover rounded-xl shadow-2xl"
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  priority={index === 0}
                />
                <motion.div
                  className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent rounded-b-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: current === index ? 1 : 0,
                    y: current === index ? 0 : 20,
                  }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <h3 className="text-white text-2xl font-bold mb-2">
                    {image.title}
                  </h3>
                  <p className="text-white/90 text-sm">{image.description}</p>
                </motion.div>
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="flex gap-3 mt-8 relative z-20">
        {carouselImages.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={`w-16 h-1.5 rounded-full transition-all duration-300 transform ${
              current === index
                ? "bg-white scale-100"
                : "bg-white/30 scale-90 hover:bg-white/50"
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImagesCarousel;
