import * as z from "zod";

export const settingsSchema = z.object({
  profile: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    title: z.string().min(1, "Role is required"),
    phone: z.string().optional(),
    language: z.string().min(1, "Language is required"),
    timezone: z.string().min(1, "Timezone is required"),
    avatar: z.string().optional(),
    bio: z.string().optional(),
  }),
  security: z
    .object({
      currentPassword: z.string().min(6, "Current password is required"),
      newPassword: z.string().min(1, "Password must be at least 6 characters"),
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    }),
  notifications: z.object({
    emailNotifications: z.boolean(),
    pushNotifications: z.boolean(),
    bidUpdates: z.boolean(),
    securityAlerts: z.boolean(),
    newsAndUpdates: z.boolean(),
  }),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;
