"use client";

import { FOCPLogo } from "@/components/ui/ocp/focp-logo";
import TwoFactorForm from "@/components/ui/ocp/form/two-factor-form";
import ImagesCarousel from "@/components/ui/ocp/images-carousel";

const LoginPage = () => {
  return (
    <div className="min-h-screen w-full flex">
      <div className="w-full lg:w-1/3 p-8 flex flex-col justify-center items-center">
        <FOCPLogo />
        <div className="max-w-md w-full mx-auto space-y-8">
          <TwoFactorForm />
        </div>
      </div>

      <div className="hidden lg:block lg:w-2/3 bg-blue-500">
        <ImagesCarousel />
      </div>
    </div>
  );
};

export default LoginPage;
