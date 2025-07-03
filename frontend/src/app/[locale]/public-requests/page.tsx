import { Footer } from "@/components/ui/landingpage/Footer";
import { Navbar } from "@/components/ui/landingpage/Navbar";
import { PublicRequestsList } from "@/components/ui/public-requests/PublicRequestsList";

export default async function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-custom-green-50/50 to-custom-green-100/30">
      <Navbar />
      <PublicRequestsList />
      <Footer />
    </main>
  );
}
