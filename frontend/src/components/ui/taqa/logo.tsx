"use client";

import Link from "next/link";

const Logo = () => {
  return (
    <a href="/" className="flex items-center">
      <h1 className="text-xl font-bold text-primary hover:text-primary/80 transition-colors">
        <img className="transition-all duration-200" src="/logo.png" alt="logo" width={120} height={120} />
      </h1>
    </a>
  );
};

export default Logo;
