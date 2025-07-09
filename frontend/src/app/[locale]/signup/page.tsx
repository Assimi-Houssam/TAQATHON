"use client";

import { TaqaLogo } from "@/components/ui/taqa/focp-logo";
import SignupForm from "@/components/ui/taqa/form/signup-form";
import ImagesCarousel from "@/components/ui/taqa/images-carousel";

const RegisterPage = () => {
  return (
    <div className="min-h-screen w-full flex">
      <div className="hidden lg:block lg:w-2/3 bg-blue-500">
        <ImagesCarousel />
      </div>
      <div className="w-full lg:w-1/3 p-8 flex flex-col justify-center items-center">
        <TaqaLogo />
        <div className="max-w-md w-full mx-auto space-y-8">
          <SignupForm />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
