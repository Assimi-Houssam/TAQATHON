"use client";

import Link from "next/link";
import { HelpCircle, Settings } from "lucide-react";

const SideBarFooter = () => {
  return (
    <div className="p-4 border-t border-gray-200">
      <Link
        href="/settings"
        className="w-full flex items-center px-4 py-2 text-sm rounded-lg"
      >
        <Settings className="h-5 w-5 mr-3" /> Settings
      </Link>
      <Link
        href="/help"
        className="w-full flex items-center px-4 py-2 text-sm rounded-lg"
      >
        <HelpCircle className="h-5 w-5 mr-3" /> Help
      </Link>
    </div>
  );
};

export default SideBarFooter;
