import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/context/user-context";
import { apiClient } from "@/lib/axios";
import { cn } from "@/lib/utils";
import { SettingsFormValues } from "@/types/settings";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, Globe, Loader2, Mail, Trash, User } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import FormFieldWrapper from "../ui/taqa/form/common/FormFieldWrapper";

const ProfileSettings = ({
  form,
}: {
  form: UseFormReturn<SettingsFormValues>;
}) => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('Settings.profile');

  const [isHovered, setIsHovered] = useState(false);

  const getInitial = () => {
    if (user?.first_name) {
      return user.first_name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "?";
  };

  const getAvatarUrl = () => {
    return user?.avatar
      ? `${process.env.NEXT_PUBLIC_API_URL}/documents/avatar/${user.avatar.id}`
      : null;
  };

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await apiClient.post("/users/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Avatar updated successfully");
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload avatar"
      );
    },
  });

  const deleteAvatarMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.delete("/users/avatar");
      return response.data;
    },
    onSuccess: () => {
      toast.success("Avatar deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete avatar"
      );
    },
  });

  const switchLanguage = (newLocale: string) => {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <User className="h-5 w-5" />
          <CardTitle>{t('title')}</CardTitle>
        </div>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative group">
            <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-border shadow-lg">
              {user?.avatar ? (
                <Image
                  src={getAvatarUrl()!}
                  alt="Profile"
                  fill
                  className={cn(
                    "object-cover transition-all duration-200",
                    isHovered && "scale-110 opacity-75"
                  )}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-primary text-primary-foreground text-4xl font-semibold">
                  {getInitial()}
                </div>
              )}
              <label
                htmlFor="avatar-upload"
                className={cn(
                  "absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 transition-opacity cursor-pointer",
                  isHovered && "opacity-100"
                )}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <Camera className="h-8 w-8 text-white mb-2" />
                <span className="text-white text-sm font-medium">
                  {t('avatar.changePhoto')}
                </span>
              </label>
              <Input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    uploadAvatarMutation.mutate(file);
                  }
                }}
                disabled={uploadAvatarMutation.isPending}
              />
              {uploadAvatarMutation.isPending && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
              )}
            </div>
          </div>

          {user?.avatar && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  {t('avatar.removePhoto')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('avatar.confirmRemove.title')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('avatar.confirmRemove.description')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('avatar.confirmRemove.cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteAvatarMutation.mutate()}
                    disabled={deleteAvatarMutation.isPending}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    {deleteAvatarMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('avatar.removing')}
                      </>
                    ) : (
                      t('avatar.confirmRemove.confirm')
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        <Separator />

        {/* Personal Information */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <h3 className="text-lg font-medium">{t('personalInfo.title')}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormFieldWrapper
              form={form}
              name="profile.firstName"
              label={t('personalInfo.firstName')}
              required
            />
            <FormFieldWrapper
              form={form}
              name="profile.lastName"
              label={t('personalInfo.lastName')}
              required
            />
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('personalInfo.email')}</label>
              <div className="flex items-center gap-2 p-2 rounded-md bg-muted">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {user?.email}
                </span>
              </div>
            </div>
            <FormFieldWrapper
              form={form}
              name="profile.phone"
              label={t('personalInfo.phone')}
              type="tel"
            />
          </div>
        </div>

        <Separator />

        {/* Professional Information */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <h3 className="text-lg font-medium">{t('professionalInfo.title')}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              type="text"
              placeholder={t('professionalInfo.jobTitle')}
              value={user?.title}
              onChange={(e) => form.setValue("profile.title", e.target.value)}
            />
          </div>
        </div>

        <Separator />

        {/* Language Preferences */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            <h3 className="text-lg font-medium">{t('language.title')}</h3>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant={locale === "en" ? "default" : "outline"}
              onClick={() => switchLanguage("en")}
              className="flex items-center gap-2"
            >
              <Globe className="h-4 w-4" />
              {t('language.english')}
            </Button>
            <Button
              variant={locale === "fr" ? "default" : "outline"}
              onClick={() => switchLanguage("fr")}
              className="flex items-center gap-2"
            >
              <Globe className="h-4 w-4" />
              {t('language.french')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSettings;
