"use client";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useVerify2FALoginMutation } from "@/endpoints/auth/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import FormFieldWrapper from "./common/FormFieldWrapper";

// Define validation schema
const twoFactorSchema = z.object({
  token: z.string().min(6, "Please enter a valid 2FA code").max(6),
});

export type TwoFactorFormValues = z.infer<typeof twoFactorSchema>;

const TwoFactorForm = () => {
  const form = useForm<TwoFactorFormValues>({
    resolver: zodResolver(twoFactorSchema),
    defaultValues: {
      token: "",
    },
  });

  const verify2FAMutation = useVerify2FALoginMutation();

  const onSubmit = async (values: TwoFactorFormValues) => {
    verify2FAMutation.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-black">
            Two-Factor Authentication
          </h1>
          <p className="text-sm text-black">
            Enter the code from your authenticator app.
          </p>
        </div>

        <div className="space-y-4">
          <FormFieldWrapper
            form={form}
            name="token"
            type="text"
            placeholder="Enter 6-digit code"
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white transition-colors"
          disabled={verify2FAMutation.isPending}
        >
          {verify2FAMutation.isPending ? "Verifying..." : "Verify"}
        </Button>
      </form>
    </Form>
  );
};

export default TwoFactorForm;
