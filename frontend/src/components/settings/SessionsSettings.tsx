import { User } from "lucide-react";

import { SessionsList } from "../ui/taqa/SessionsList";

import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

const SessionsSettings = () => {
  const t = useTranslations('Settings.sessions');
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <User className="h-5 w-5" />
          <CardTitle>{t('title')}</CardTitle>
        </div>
        <CardDescription>
          {t('description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SessionsList />
      </CardContent>
    </Card>
  );
};

export default SessionsSettings;