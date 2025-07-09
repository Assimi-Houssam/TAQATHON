"use client";

import { TaqaLogo } from "@/components/ui/taqa/focp-logo";
import LoginForm from "@/components/ui/taqa/form/login-form";
import ImagesCarousel from "@/components/ui/taqa/images-carousel";
import { motion } from "framer-motion";

const LoginPage = () => {
  return (
    <div className="min-h-screen w-full flex bg-gray-50">
      {/* Left side - Login Form */}
      <motion.div 
        className="w-full lg:w-1/3 p-8 md:p-12 xl:p-16 flex flex-col justify-center items-center bg-white relative shadow-2xl"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="absolute top-8 left-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <TaqaLogo />
        </motion.div>
        <div className="max-w-md w-full mx-auto mt-16">
          <LoginForm />
        </div>
      </motion.div>

      {/* Right side - Image Carousel */}
      <motion.div 
        className="hidden lg:flex lg:w-2/3 bg-gradient-to-br from-blue-600 to-blue-500 items-center justify-center overflow-hidden relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="w-full h-full max-w-7xl mx-auto relative z-10">
          <div className="absolute inset-0 to-transparent pointer-events-none" />
          <ImagesCarousel />
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
