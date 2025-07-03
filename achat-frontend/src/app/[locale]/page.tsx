import { Navbar } from "@/components/ui/landingpage/Navbar";
import { Hero } from "@/components/ui/landingpage/Hero";
import { Features } from "@/components/ui/landingpage/Features";
import { Footer } from "@/components/ui/landingpage/Footer";

export default async function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-custom-green-50/50 to-custom-green-100/30">
      <Navbar />
      <Hero />
      <Features />
      <Footer />
    </main>
  );
}
