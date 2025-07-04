"use client";

import NotificationSettings from "@/components/settings/NotifSettings";
import PrivacySettings from "@/components/settings/PrivacySettings";
import ProfileSettings from "@/components/settings/ProfileSettings";
import SecuritySettings from "@/components/settings/SecuritySettings";
import SessionsSettings from "@/components/settings/SessionsSettings";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/context/user-context";
import type { SettingsFormValues } from "@/types/settings";
import { settingsSchema } from "@/types/settings";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Bell, Lock, Shield, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const t = useTranslations('Settings');
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState<string>(
    searchParams.get("tab") || "profile"
  );
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      profile: {
        firstName: user?.first_name ?? "",
        lastName: user?.last_name ?? "",
        email: user?.email ?? "",
        phone: user?.phone_number ?? "",
        language: user?.language ?? "en",
        avatar: user?.avatar?.url ?? "",
        bio: user?.bio ?? "",
        title: user?.title ?? "",
      },
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (values: SettingsFormValues) => {
      console.log("Updating settings with:", values);
      return new Promise((resolve) => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      toast.success(t('saveChanges.success'));
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to update settings"
      );
    },
  });

  const onSubmit = (values: SettingsFormValues) => {
    updateSettings.mutate(values);
  };

  const handleTabChange = (value: string) => {
    setActiveSection(value);
    router.push(`?tab=${value}`);
  };

  const navigationItems = [
    { icon: User, label: t('profile.title'), id: "profile" },
    { icon: Lock, label: t('security.title'), id: "security" },
    { icon: Bell, label: t('notifications.title'), id: "notifications" },
    { icon: User, label: t('sessions.title'), id: "sessions" },
    { icon: Shield, label: t('privacy.title'), id: "privacy" },
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-8" />
        <div className="h-12 bg-gray-200 rounded animate-pulse mb-8" />
        <div className="h-[400px] bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>

      <Tabs
        value={activeSection}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="w-fit justify-start mb-8 bg-muted/50 rounded-t-lg rounded-b-none p-1">
          {navigationItems.map((item) => (
            <TabsTrigger
              key={item.id}
              value={item.id}
              className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-t-md rounded-b-none"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {activeSection === "profile" && <ProfileSettings form={form} />}
            {activeSection === "security" && <SecuritySettings />}
            {activeSection === "notifications" && (
              <NotificationSettings form={form} />
            )}
            {activeSection === "sessions" && <SessionsSettings />}
            {activeSection === "privacy" && <PrivacySettings />}

            {activeSection !== "sessions" && (
              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600"
                  disabled={updateSettings.isPending}
                >
                  {updateSettings.isPending ? t('saveChanges.updating') : t('saveChanges.save')}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </Tabs>
    </div>
  );
}
