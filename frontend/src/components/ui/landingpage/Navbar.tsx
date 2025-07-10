import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LogIn, Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";

export const Navbar = () => {
  const t = useTranslations("navbar");

  return (
    <header className="fixed w-full backdrop-blur-md bg-white/70 z-50 border-b">
      <div className="container mx-auto px-6 py-2 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
        >
          <Image
            src="/ftaqa_logo.png"
            alt="TAQA Logo"
            width={160}
            height={40}
            className="w-32 sm:w-40 md:w-sm"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:block">
          <NavigationMenuList className="space-x-2">
            <NavigationMenuItem>
              <Link href="/public-requests">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-custom-green-800 hover:text-custom-green-900 hover:bg-custom-green-100/50"
                >
                  {t("publicRequests")}
                </Button>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-custom-green-800 hover:text-custom-green-900 hover:bg-custom-green-100/50"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  {t("login")}
                </Button>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="sm" className="px-2">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <div className="flex flex-col space-y-4">
              <SheetTitle>{t("menu")}</SheetTitle>
              <div className="flex flex-col space-y-4">
                <Link href="/public-requests">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-custom-green-800 hover:text-custom-green-900 hover:bg-custom-green-100/50"
                  >
                    {t("publicRequests")}
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-custom-green-800 hover:text-custom-green-900 hover:bg-custom-green-100/50"
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    {t("login")}
                  </Button>
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};
