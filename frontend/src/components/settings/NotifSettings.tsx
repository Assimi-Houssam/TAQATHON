import { Bell } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { UseFormReturn } from "react-hook-form";
import type { SettingsFormValues } from "@/types/settings";
import { useTranslations } from "next-intl";

const NotificationSettings = ({
  form,
}: {
  form: UseFormReturn<SettingsFormValues>;
}) => {
  const t = useTranslations('Settings.notifications');
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <CardTitle>{t('title')}</CardTitle>
        </div>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Delivery Preferences</h3>
            <div className="grid gap-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium leading-none">
                    Email Notifications
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email about important updates
                  </p>
                </div>
                <Switch
                  checked={form.watch("notifications.emailNotifications")}
                  onCheckedChange={(checked) =>
                    form.setValue("notifications.emailNotifications", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium leading-none">
                    Push Notifications
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Receive real-time notifications in your browser
                  </p>
                </div>
                <Switch
                  checked={form.watch("notifications.pushNotifications")}
                  onCheckedChange={(checked) =>
                    form.setValue("notifications.pushNotifications", checked)
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Notification Types</h3>
            <div className="grid gap-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium leading-none">
                    Bid Updates
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Get notified about new bids and bid status changes
                  </p>
                </div>
                <Switch
                  checked={form.watch("notifications.bidUpdates")}
                  onCheckedChange={(checked) =>
                    form.setValue("notifications.bidUpdates", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium leading-none">
                    Security Alerts
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Important alerts about your account security
                  </p>
                </div>
                <Switch
                  checked={form.watch("notifications.securityAlerts")}
                  onCheckedChange={(checked) =>
                    form.setValue("notifications.securityAlerts", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium leading-none">
                    News and Updates
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Stay informed about new features and platform updates
                  </p>
                </div>
                <Switch
                  checked={form.watch("notifications.newsAndUpdates")}
                  onCheckedChange={(checked) =>
                    form.setValue("notifications.newsAndUpdates", checked)
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
