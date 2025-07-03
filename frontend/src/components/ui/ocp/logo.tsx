"use client";

import Link from "next/link";
import Image from "next/image";
//
const Logo = () => {
  return (
    <Link href="/">
      <Image
        className="md:mx-4 md:w-32"
        src="/logo-1-slogan-2.png"
        // src={"/logo-white.webp"}
        alt="OCP Foundation"
        width={100}
        height={25}
      />
    </Link>
  );
};

export default Logo;
