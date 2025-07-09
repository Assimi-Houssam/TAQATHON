"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface CustomCardProps {
  title: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  defaultExpanded?: boolean;
}

export function CustomCard({
  title,
  children,
  headerAction,
  defaultExpanded = true,
}: CustomCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <Card className="rounded-sm">
      <CardHeader
        className="bg-gray-50 rounded flex flex-row justify-between items-center cursor-pointer py-3 overflow-hidden"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="text-blue-500">{title}</CardTitle>
        <div className="flex items-center gap-2">
          {headerAction}
          <ChevronDown
            className={`h-5 w-5 transition-transform duration-200 ${
              isExpanded ? "transform rotate-180" : ""
            }`}
          />
        </div>
      </CardHeader>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isExpanded ? "max-h-[1000px] pt-4" : "max-h-0"
        }`}
      >
        <CardContent>{children}</CardContent>
      </div>
    </Card>
  );
}
