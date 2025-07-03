"use client";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useSignupSupplierMutation } from "@/endpoints/auth/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import FormFieldWrapper from "./common/FormFieldWrapper";

const formSchema = z
  .object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmation_password: z.string(),
  })
  .refine((data) => data.password === data.confirmation_password, {
    message: "Passwords don't match",
    path: ["confirmation_password"],
  });

export type SignupFormValues = z.infer<typeof formSchema>;

const SignupForm = () => {
  const router = useRouter();
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      confirmation_password: "",
    },
  });

  const signupSupplierMutation = useSignupSupplierMutation();

  function onSubmit(values: SignupFormValues) {
    signupSupplierMutation.mutate(values, {
      onSuccess: () => {
        router.push("/login");
      },
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-black">Sign Up</h1>
          <p className="text-sm text-black">Create your account</p>
        </div>

        <div className="space-y-4">
          <FormFieldWrapper
            form={form}
            name="first_name"
            type="text"
            placeholder="Enter your first name"
            required
          />
          <FormFieldWrapper
            form={form}
            name="last_name"
            type="text"
            placeholder="Enter your last name"
            required
          />
          <FormFieldWrapper
            form={form}
            name="email"
            type="email"
            placeholder="Enter your email"
            required
          />
          <FormFieldWrapper
            form={form}
            name="password"
            inputComponent="password"
            placeholder="Enter your password"
            required
          />
          <FormFieldWrapper
            form={form}
            name="confirmation_password"
            inputComponent="password"
            placeholder="Confirm your password"
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-custom-green-500 hover:bg-custom-green-600 text-white transition-colors"
          disabled={signupSupplierMutation.isPending}
        >
          {signupSupplierMutation.isPending ? "Signing up..." : "Sign up"}
        </Button>
      </form>
    </Form>
  );
};

export default SignupForm;
