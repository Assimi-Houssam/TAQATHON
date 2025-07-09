"use client";

import Link from "next/link";

const Logo = () => {
  return (
    <Link href="/" className="flex items-center">
      <h1 className="text-xl font-bold text-primary hover:text-primary/80 transition-colors">
        ANOMALERT
      </h1>
    </Link>
  );
};

export default Logo;
