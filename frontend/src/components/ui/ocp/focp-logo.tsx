"use client";
import Image from "next/image";

export const FOCPLogo = () => (
  <div className="w-sm">
    <Image
      src="/focp_logo.png"
      alt="OCP Logo"
      width={300}
      height={100}
      priority
      className="w-full h-auto"
    />
  </div>
);
