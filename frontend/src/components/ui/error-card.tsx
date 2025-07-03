import { AlertCircle, ArrowLeft, RotateCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "./button";
import { motion } from "framer-motion";

interface ErrorCardProps {
  title: string;
  variant?: "error" | "warning";
  backUrl?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorCard({
  title,
  variant = "error",
  backUrl,
  onRetry,
  className,
}: ErrorCardProps) {
  const colors = {
    error: {
      border: "border-red-200",
      bg: "from-red-50",
      orb: "bg-red-100",
      text: "text-red-600",
      icon: "text-red-500",
      hover: "hover:border-red-200",
      gradient: "from-red-500 to-red-600 hover:from-red-600 hover:to-red-700",
    },
    warning: {
      border: "border-yellow-200",
      bg: "from-yellow-50",
      orb: "bg-yellow-100",
      text: "text-yellow-600",
      icon: "text-yellow-500",
      hover: "hover:border-yellow-200",
      gradient:
        "from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700",
    },
  };

  const color = colors[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={cn(
          "bg-white/50 backdrop-blur-sm border relative overflow-hidden",
          color.border,
          className
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br to-transparent opacity-50",
            color.bg
          )}
        />
        <div
          className={cn(
            "absolute -right-20 -top-20 w-40 h-40 rounded-full blur-3xl opacity-30",
            color.orb
          )}
        />

        <CardHeader className="border-none relative z-10">
          <div className="flex items-center space-x-2">
            <AlertCircle className={cn("w-6 h-6", color.icon)} />
            <CardTitle className={color.text}>{title}</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 space-y-6">
          <div className="flex items-center space-x-4">
            {backUrl && (
              <Link
                href={backUrl}
                className={cn(
                  "group transition-all duration-200 flex items-center gap-2",
                  "bg-white/50 backdrop-blur-sm border rounded-lg p-2",
                  color.hover
                )}
              >
                <ArrowLeft
                  className={cn(
                    "w-4 h-4 transition-transform duration-200",
                    "",
                    color.text
                  )}
                />
                <span className={color.text}>Go Back</span>
              </Link>
            )}

            {onRetry && (
              <Button
                onClick={onRetry}
                className={cn(
                  "bg-gradient-to-r text-white transition-all duration-200",
                  color.gradient
                )}
              >
                <RotateCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
