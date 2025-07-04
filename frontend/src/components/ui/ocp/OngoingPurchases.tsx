import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { FaEdit, FaEye } from "react-icons/fa";
import { motion } from "framer-motion";
import { Monitor } from "lucide-react";

interface MonitoringSystem {
  title: string;
  description: string;
  bidding_deadline: string;
  type: string;
  requesterEntity: string;
  requesterDepartment: string;
  requester: string;
  status: string;
  id: string;
}

interface OngoingPurchasesProps {
  purchases: MonitoringSystem[];
  className?: string;
}

export const OngoingPurchases = ({ purchases, className }: OngoingPurchasesProps) => {
  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "temperature":
        return "bg-red-100 text-red-800";
      case "vibration":
        return "bg-purple-100 text-purple-800";
      case "chemical":
        return "bg-green-100 text-green-800";
      case "pressure":
        return "bg-blue-100 text-blue-800";
      case "flow":
        return "bg-cyan-100 text-cyan-800";
      case "electrical":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };



  // Show empty state when no monitoring systems
  if (!purchases.length) {
    return (
      <Card className={cn("flex flex-col h-full", className)}>
        <CardContent className="flex-1 p-0 pt-6">
          <div className="h-full flex flex-col items-center justify-center px-6 py-12">
            {/* Background Pattern */}
            {/* <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100" />
              <div className="h-full w-full bg-[linear-gradient(45deg,transparent_25%,rgba(59,130,246,.1)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]" />
            </div> */}

            {/* Icon */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.2,
                duration: 0.5,
                type: "spring",
                stiffness: 100,
              }}
              className="mb-6 relative"
            >
              <div className="relative">
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative z-10"
                >
                  <Monitor className="w-12 h-12 text-blue-600/80" />
                </motion.div>
                <motion.div
                  className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </motion.div>

            {/* Text Content */}
            <motion.div
              className="text-center space-y-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <motion.h3
                className="text-lg font-semibold text-gray-900"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                No active monitoring systems
              </motion.h3>
              <motion.p
                className="text-sm text-gray-500 max-w-sm mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Your monitoring systems will appear here once they are configured and actively collecting data from your industrial units.
              </motion.p>
            </motion.div>

            {/* Status Indicators */}
            <motion.div
              className="mt-8 flex items-center gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="w-2 h-2 bg-gray-300 rounded-full" />
                <span>Systems offline</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-blue-600">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 bg-blue-500 rounded-full"
                />
                <span>Ready to configure</span>
              </div>
            </motion.div>

            {/* Decorative Elements */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl" />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("flex flex-col h-full", className)}>
      {/* <CardHeader className="pb-3 px-6">
        <CardTitle>Ongoing Purchases</CardTitle>
      </CardHeader> */}
      <CardContent className="flex-1 p-0 pt-6">
        <ScrollArea className="h-[calc(100%-1rem)]">
          <div className="space-y-3">
            {purchases.map((system, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className="rounded-lg border border-gray-100 p-4 hover:border-gray-200 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium leading-none">
                        {system.title}
                      </h3>
                      <Badge
                        variant="secondary"
                        className={cn("text-xs", getTypeColor(system.type))}
                      >
                        {system.type}
                      </Badge>
                      {system.status === "active" && (
                        <div className="flex items-center gap-1">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-2 h-2 bg-green-500 rounded-full"
                          />
                          <span className="text-xs text-green-600 font-medium">ACTIVE</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                      {system.description}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="h-8 w-8"
                    >
                      <Link href={`/dashboard/monitoring-system/${system.id}`}>
                        <FaEye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="h-8 w-8"
                    >
                      <Link
                        href={`/dashboard/monitoring-system/${system.id}/edit`}
                      >
                        <FaEdit className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Next Check:</span>
                    <span className="font-medium">
                      {system.bidding_deadline}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Unit:</span>
                    <span className="font-medium">
                      {system.requesterDepartment}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-medium">
                      {system.requesterEntity}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Operator:</span>
                    <span className="font-medium">{system.requester}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
