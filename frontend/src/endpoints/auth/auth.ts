import { LoginFormValues } from "@/components/ui/taqa/form/login-form";
import { SignupFormValues } from "@/components/ui/taqa/form/signup-form";
import { useRouter } from "@/i18n/routing";
import { apiClient } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { deleteCookie, setCookie } from "cookies-next";
import { toast } from "sonner";

interface LoginResponse {
  access_token: string;
  requires_2fa: boolean;
}

export const useLoginMutation = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: async (credentials: LoginFormValues) => {
      const response = await apiClient.post<LoginResponse>(
        "/auth/login",
        credentials
      );
      return response.data;
    },
    onSuccess: (response) => {
      if (response.access_token) {
        setCookie("access_token", response.access_token);
        if (response.requires_2fa) router.push("/login/2fa");
        else {
          toast.success("Successfully logged in");
          router.push("/dashboard");
        }
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to login");
    },
  });
};

export const useSignupSupplierMutation = () => {
  return useMutation({
    mutationFn: async (credentials: SignupFormValues) => {
      const response = await apiClient.post<LoginResponse>(
        "/auth/register-supplier",
        credentials
      );
      return response.data;
    },
    onSuccess: (response) => {
      if (response.access_token) {
        setCookie("access_token", response.access_token);
      }
      toast.success("Successfully signed up");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to sign up");
    },
  });
};

export const useLogoutMutation = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post("/auth/logout");
      deleteCookie("access_token");
      deleteCookie("refresh_token");
      return response.data;
    },
    onSuccess: () => {
      toast.success("Successfully logged out");
      router.push("/login");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to logout");
    },
  });
};

export const useVerify2FALoginMutation = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: async (data: { token: string }) => {
      const response = await apiClient.post("/auth/2fa/verify", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Successfully verified 2FA code");
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to verify 2FA code"
      );
    },
  });
};
