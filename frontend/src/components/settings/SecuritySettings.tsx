import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "../ui/input";

import { useUser } from "@/context/user-context";
import { apiClient } from "@/lib/axios";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import FormFieldWrapper from "../ui/taqa/form/common/FormFieldWrapper";
import { Switch } from "../ui/switch";
import { useTranslations } from "next-intl";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

const PasswordSection = () => {
  const t = useTranslations("Settings.security.password");
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const passwordMutation = useMutation({
    mutationFn: async (data: PasswordFormValues) => {
      await apiClient.post("/auth/change-password", data);
    },
    onSuccess: () => {
      toast.success("Password changed successfully");
      form.reset();
    },
    onError: () => {
      toast.error("Failed to change password");
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{t("title")}</h3>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-primary"
          type="button"
          onClick={() => form.reset()}
        >
          {t("clearFields")}
        </Button>
      </div>
      <div className="grid gap-6 p-6 border rounded-lg">
        <div className="space-y-2">
          <FormFieldWrapper
            form={form}
            name="currentPassword"
            label={t("currentPassword")}
            inputComponent="password"
            required
            placeholder={t("passwordPlaceholder")}
          />
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              {t("newPassword")}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <FormFieldWrapper
            form={form}
            name="newPassword"
            label={t("newPassword")}
            inputComponent="password"
            required
            placeholder={t("requirements")}
            error={form.formState.errors.newPassword?.message}
          />

          <FormFieldWrapper
            form={form}
            name="confirmPassword"
            label={t("confirmNewPassword")}
            inputComponent="password"
            required
            placeholder={t("confirmNewPasswordPlaceholder")}
            error={form.formState.errors.confirmPassword?.message}
          />

          <Button
            className="w-full"
            type="button"
            disabled={passwordMutation.isPending}
            onClick={form.handleSubmit((data) => passwordMutation.mutate(data))}
          >
            {passwordMutation.isPending ? t("updating") : t("updateButton")}
          </Button>
        </div>
      </div>
    </div>
  );
};

const TwoFactorSetup = ({
  qrCode,
  verificationCode,
  setVerificationCode,
  onVerify,
  isPending,
}: {
  qrCode: string | null;
  verificationCode: string;
  setVerificationCode: (code: string) => void;
  onVerify: () => void;
  isPending: boolean;
}) => {
  const t = useTranslations("Settings.security.twoFactor.setup");
  return (
    <>
      <div className="space-y-6">
        <div className="space-y-4">
          <h4 className="font-medium">{t("title")}</h4>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                1
              </div>
              <span>{t("steps.1")}</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                2
              </div>
              <span>{t("steps.2")}</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                3
              </div>
              <span>{t("steps.3")}</span>
            </li>
          </ol>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <div className="relative p-6 bg-white rounded-xl shadow-sm border">
            {qrCode && (
              <>
                <div className="relative">
                  <Image
                    src={qrCode}
                    alt="2FA QR Code"
                    width={200}
                    height={200}
                    className="rounded-lg"
                  />
                </div>
              </>
            )}
          </div>

          <div className="w-full max-w-xs space-y-2">
            <Input
              placeholder={t("verifyCode")}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength={6}
              className="text-center text-lg tracking-widest"
            />
            <Button
              onClick={onVerify}
              className="w-full"
              disabled={isPending || verificationCode.length !== 6}
            >
              {isPending ? (
                <>
                  <span className="size-4 border-2 border-white/30 border-t-white animate-spin rounded-full mr-2" />
                  Verifying...
                </>
              ) : (
                t("verifyButton")
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

const DisableDialog = ({
  open,
  onOpenChange,
  verificationCode,
  setVerificationCode,
  onDisable,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  verificationCode: string;
  setVerificationCode: (code: string) => void;
  onDisable: () => void;
  isPending: boolean;
}) => {
  const t = useTranslations("Settings.security.twoFactor.disable");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("disableDescription")}
          </p>
          <Input
            placeholder={t("verifyCode")}
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
          />
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setVerificationCode("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={onDisable} disabled={isPending}>
              {isPending ? t("disabling") : t("disableButton")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const TwoFactorEnabled = ({
  onDisable,
  show,
}: {
  onDisable: () => void;
  show: boolean;
}) => {
  const t = useTranslations("Settings.security.twoFactor.disable");
  if (!show) return null;
  return (
    <div className="space-y-4 p-6 border rounded-lg">
                  <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
              <div className="size-2 rounded-full bg-blue-600" />
        {t("isEnabled")}
      </div>

      <div className="space-y-3 text-sm text-muted-foreground">
        <p>{t("description")}</p>
        <p>{t("description2")}</p>
      </div>

      <Button
        variant="outline"
        className="text-destructive hover:text-destructive"
        onClick={onDisable}
      >
        {t("disableButton")}
      </Button>
    </div>
  );
};

const SecuritySettings = () => {
  const t = useTranslations("Settings.security");
  const { user } = useUser();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);

  const queryClient = useQueryClient();

  const setup2FAMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post("/auth/2fa/setup");
      return response.data;
    },
    onSuccess: (data) => {
      setQrCode(data.qrCode);
    },
    onError: () => {
      setShow2FASetup(false);
      toast.error(t("twoFactor.setup.error"));
    },
  });

  const verify2FAMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post("/auth/2fa/verify", { token: verificationCode });
    },
    onSuccess: () => {
      setQrCode(null);
      setVerificationCode("");
      setShow2FASetup(false);
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success(t("twoFactor.setup.success"));
    },
    onError: () => {
      toast.error(t("twoFactor.setup.error"));
    },
  });

  const disable2FAMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post("/auth/2fa/disable", { token: verificationCode });
    },
    onSuccess: () => {
      setShowDisableDialog(false);
      setVerificationCode("");
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success(t("twoFactor.disable.success"));
    },
    onError: () => {
      toast.error(t("twoFactor.disable.error"));
    },
  });

  const handle2FAToggle = (checked: boolean) => {
    if (!checked) {
      setShow2FASetup(false);
      return;
    }

    if (user?.two_factor_enabled) {
      return;
    }

    setShow2FASetup(true);
    setup2FAMutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          <CardTitle>{t("title")}</CardTitle>
        </div>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <PasswordSection />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">{t("twoFactor.title")}</h3>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-1">
              <div className="text-sm font-medium leading-none">
                {t("twoFactor.title")}
              </div>
              <p className="text-sm text-muted-foreground">
                {t("twoFactor.description")}
              </p>
            </div>
            <Switch
              checked={user?.two_factor_enabled || show2FASetup}
              onCheckedChange={handle2FAToggle}
            />
          </div>

          {show2FASetup && !user?.two_factor_enabled && (
            <div className="space-y-4 p-6 border rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <div className="size-2 rounded-full bg-primary animate-pulse" />
                {t("twoFactor.setupInProgress")}
              </div>

              {qrCode && (
                <TwoFactorSetup
                  qrCode={qrCode}
                  verificationCode={verificationCode}
                  setVerificationCode={setVerificationCode}
                  onVerify={() => verify2FAMutation.mutate()}
                  isPending={verify2FAMutation.isPending}
                />
              )}
            </div>
          )}

          <TwoFactorEnabled
            onDisable={() => setShowDisableDialog(true)}
            show={user?.two_factor_enabled ?? false}
          />

          <DisableDialog
            open={showDisableDialog}
            onOpenChange={setShowDisableDialog}
            verificationCode={verificationCode}
            setVerificationCode={setVerificationCode}
            onDisable={() => disable2FAMutation.mutate()}
            isPending={disable2FAMutation.isPending}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default SecuritySettings;
