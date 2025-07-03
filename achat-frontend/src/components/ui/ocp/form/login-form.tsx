"use client";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useLoginMutation } from "@/endpoints/auth/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import FormFieldWrapper from "./common/FormFieldWrapper";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

// Define validation schema
const loginSchema = z.object({
  username: z.string().min(1, "Please enter your username"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const t = useTranslations("login");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useLoginMutation();

  const onSubmit = async (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <Form {...form}>
      <motion.form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="space-y-3">
          <motion.h1
            className="text-3xl font-bold tracking-tight text-gray-900"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {t("welcomeBack")}
          </motion.h1>
          <motion.p
            className="text-sm text-gray-600"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {t("enterCredentials")}
          </motion.p>
        </div>

        <motion.div
          className="space-y-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <FormFieldWrapper
            form={form}
            name="username"
            type="text"
            placeholder={t("username.placeholder")}
            required
            label={t("username.label")}
            className="transition-all duration-200"
          />
          <div className="relative">
            <FormFieldWrapper
              form={form}
              name="password"
              inputComponent={showPassword ? "text" : "password"}
              placeholder={t("password.placeholder")}
              required
              label={t("password.label")}
              className="transition-all duration-200"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-[34px] text-gray-500 hover:text-gray-700 focus:outline-none"
            ></button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-custom-green-500 focus:ring-custom-green-500 transition-colors duration-200"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-700 select-none cursor-pointer"
              >
                {t("rememberMe")}
              </label>
            </div>
            <div className="text-sm">
              <a
                href="#"
                className="font-medium text-custom-green-600 hover:text-custom-green-500 transition-colors duration-200 hover:underline"
              >
                {t("forgotPassword")}
              </a>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            type="submit"
            className={`w-full py-6 bg-custom-green-500 hover:bg-custom-green-600 text-white transition-all duration-300 
              shadow-lg hover:shadow-xl text-lg font-semibold rounded-lg relative overflow-hidden
              ${
                loginMutation.isPending
                  ? "cursor-not-allowed opacity-90"
                  : "transform hover:-translate-y-0.5"
              }`}
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>{t("signingIn")}</span>
              </div>
            ) : (
              <span>{t("signIn")}</span>
            )}
          </Button>
        </motion.div>
      </motion.form>
    </Form>
  );
};

export default LoginForm;
