import { AlertTriangle, Shield, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

const PrivacySettings = () => {
  const t = useTranslations('Settings.privacy');
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>{t('title')}</CardTitle>
          </div>
          <CardDescription>
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-1">
                <div className="text-sm font-medium">{t('dataCollection.title')}</div>
                <p className="text-sm text-muted-foreground">
                  {t('dataCollection.description')}
                </p>
              </div>
              {/* Privacy controls */}
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">{t('dataExport.title')}</h3>
              {/* Data export options */}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6 border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            <CardTitle>{t('deleteAccount.title')}</CardTitle>
          </div>
          <CardDescription>
            {t('deleteAccount.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive">{t('deleteAccount.title')}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  {t('deleteAccount.title')}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="p-4 border border-destructive/50 rounded-lg">
                  <p className="text-sm font-medium text-destructive">Warning:</p>
                  <ul className="mt-2 text-sm space-y-1">
                    <li>• All your data will be permanently deleted</li>
                    <li>• Your conversations and documents will be removed</li>
                    <li>• This action cannot be undone</li>
                  </ul>
                </div>
                <div className="flex justify-end gap-4">
                  <Button variant="outline">Cancel</Button>
                  <Button variant="destructive">Yes, Delete My Account</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </>
  );
};

export default PrivacySettings;
