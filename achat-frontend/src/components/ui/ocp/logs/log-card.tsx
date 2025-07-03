"use client";

import { Log } from "@/types/entities/Logs.interface";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  FileText,
  MessageSquare,
  Building2,
  ShieldCheck,
  FileCheck,
  UserCheck,
} from "lucide-react";

const actionTypeIcons = {
  FEEDBACK: <MessageSquare className="h-4 w-4" />,
  BID: <FileText className="h-4 w-4" />,
  PURCHASE_REQUEST: <FileCheck className="h-4 w-4" />,
  PROFILE: <UserCheck className="h-4 w-4" />,
  COMPANY: <Building2 className="h-4 w-4" />,
  AUTH: <ShieldCheck className="h-4 w-4" />,
  CREATE_REPORT: <FileText className="h-4 w-4" />,
  ADD_REPLY: <MessageSquare className="h-4 w-4" />,
  UPDATE_REPORT: <FileCheck className="h-4 w-4" />,
};

const actionTypeColors = {
  FEEDBACK: "bg-blue-100 text-blue-700",
  BID: "bg-purple-100 text-purple-700",
  PURCHASE_REQUEST: "bg-green-100 text-green-700",
  PROFILE: "bg-yellow-100 text-yellow-700",
  COMPANY: "bg-orange-100 text-orange-700",
  AUTH: "bg-red-100 text-red-700",
  CREATE_REPORT: "bg-indigo-100 text-indigo-700",
  ADD_REPLY: "bg-cyan-100 text-cyan-700",
  UPDATE_REPORT: "bg-emerald-100 text-emerald-700",
};

interface LogCardProps {
  log: Log;
  isLast?: boolean;
}

export function LogCard({
  log,
  isLast,
  index = 0,
}: LogCardProps & { index?: number }) {
  const t = useTranslations("logs");
  const icon = actionTypeIcons[log.action_type] || (
    <FileText className="h-4 w-4" />
  );
  const iconColorClass =
    actionTypeColors[log.action_type] || "bg-gray-100 text-gray-700";

  return (
    <motion.div
      className="relative flex gap-4"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.1,
        ease: [0.23, 1, 0.32, 1],
      }}
    >
      {/* Timeline line */}
      {!isLast && (
        <motion.div
          className="absolute left-[15px] top-[32px] h-full w-[2px] bg-border"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.4, delay: index * 0.1 + 0.2 }}
        />
      )}

      {/* Icon */}
      <motion.div
        className={cn(
          "relative z-10 flex h-8 w-8 items-center justify-center rounded-full",
          iconColorClass
        )}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20,
          delay: index * 0.1 + 0.1,
        }}
      >
        {icon}
      </motion.div>

      {/* Content */}
      <motion.div
        className="flex-1 min-w-0 pt-1.5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
      >
        <div className="flex items-center justify-between gap-x-2">
          <time className="text-md text-muted-foreground shrink-0">
            {format(new Date(log.created_at), "HH:mm")}
          </time>
        </div>

        <div className="mt-1">
          <p className="text-md text-foreground/90">{log.action}</p>
          {log.previous_status && (
            <p className="mt-1 text-md text-muted-foreground">
              Previous status: {log.previous_status}
            </p>
          )}
          <div className="flex gap-2 mt-2">
            <span className="text-xs bg-slate-100 px-2 py-1 rounded-full">
              {t(`types.${log.action_type}`)}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
