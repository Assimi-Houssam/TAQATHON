import { LanguageSwitcher } from "@/components/language-switcher";
import {
  FacebookIcon,
  LinkedInIcon,
  TwitterIcon,
} from "@/components/ui/brand-icons";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Mail, MapPin } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

// Footer Component
export const Footer = () => {
  const t = useTranslations("footer");
  const locale = useLocale();

  return (
    <footer className="bg-custom-green-900 text-white py-20">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-16">
          {/* Contact Section */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold">{t("contact.title")}</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 mt-1 text-custom-green-100" />
                <p className="text-custom-green-100 hover:text-white transition-colors">
                  <a href="mailto:claim@ocpfoundation.org">
                    {t("contact.email")}
                  </a>
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 mt-1 text-custom-green-100" />
                <p className="text-custom-green-100">{t("contact.address")}</p>
              </div>
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold">{t("quickLinks.title")}</h4>
            <ul className="space-y-4 list-none">
              {[
                {
                  href: "/privacy",
                  label: t("quickLinks.privacy"),
                },
                { href: "/terms", label: t("quickLinks.terms") },
                { href: "/faq", label: t("quickLinks.faq") },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center text-custom-green-100 hover:text-white transition-colors group w-fit"
                  >
                    <ExternalLink className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links Section */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold">{t("social.title")}</h4>
            {/* Language Switcher */}
            <div className="mb-6">
              <LanguageSwitcher currentLang={locale} />
            </div>
            {/* Existing Social Links */}
            <div className="flex space-x-4">
              {[
                {
                  icon: LinkedInIcon,
                  href: "#",
                  label: t("social.linkedin"),
                },
                {
                  icon: TwitterIcon,
                  href: "#",
                  label: t("social.twitter"),
                },
                {
                  icon: FacebookIcon,
                  href: "#",
                  label: t("social.facebook"),
                },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-11 w-11 flex items-center justify-center rounded-full bg-custom-green-800/50 hover:bg-custom-green-700 text-custom-green-100 hover:text-white transition-all hover:scale-110"
                >
                  <social.icon />
                  <span className="sr-only">{social.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-custom-green-800/50" />

        <div className="text-center text-custom-green-100 text-sm">
          <p>
            {t("copyright", {
              year: new Date().getFullYear().toString(),
            })}
          </p>
        </div>
      </div>
    </footer>
  );
};
