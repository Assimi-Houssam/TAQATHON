"use client";

import { CalendarDays, Building2, Tag, Clock, Mail, Phone } from "lucide-react";
import { ReferenceBadge } from "./reference-badge";
import { StatusBadge } from "./status-badge";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { PurchaseRequest } from "@/types/entities/index";
import { formatDate, formatDateTime } from "@/lib/utils/date";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";

const projectManager = {
  name: "Alex Morgan",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  email: "alex.m@company.com",
  phone: "+1 234 567 890",
};

// Animation variants
const fadeIn = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.2 },
};

interface PurchaseRequestHeaderProps {
  purchaseRequest: PurchaseRequest;
  styles: {
    card: string;
    cardHeader: string;
    cardTitle: string;
    cardContent: string;
  };
}

export function PurchaseRequestHeader({
  purchaseRequest,
  styles,
}: PurchaseRequestHeaderProps) {
  if (!purchaseRequest) return null;

  const {
    request_code,
    title,
    status,
    bidding_deadline,
    category,
    buying_department,
    created_at,
  } = purchaseRequest;

  return (
    <TooltipProvider>
      <Card className={`${styles.card} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-500/[0.02] to-transparent" />
        <div className="absolute inset-0 bg-grid-white/[0.015] bg-[size:20px_20px]" />
        <CardContent className="p-6 relative">
          <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-start justify-between gap-4 flex-wrap lg:flex-nowrap">
              <motion.div className="space-y-2 flex-1" {...fadeIn}>
                <h1 className="text-2xl font-semibold text-zinc-900">
                  {title}
                </h1>
                <div className="flex flex-wrap items-center gap-2">
                  <ReferenceBadge label="PR" value={request_code} />
                  <StatusBadge status={status} />
                </div>
              </motion.div>

              {/* Enhanced Project Manager */}
              <motion.div
                className="flex items-center gap-4 px-5 py-3 rounded-lg bg-zinc-50/50 border border-zinc-100/50 min-w-[20rem] cursor-default transition-all duration-200"
                {...fadeIn}
              >
                <Avatar className="h-10 w-10 border-2 border-white ring-2 ring-zinc-500/10">
                  <AvatarImage src={projectManager.avatar} alt="PM" />
                  <AvatarFallback>AM</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-zinc-900">
                    {projectManager.name}
                  </p>
                  <div className="flex flex-col gap-1 text-xs text-zinc-500">
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3 text-zinc-500" />
                      <span>{projectManager.email}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3 text-zinc-500" />
                      <span>{projectManager.phone}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <Separator className="bg-zinc-200/50" />

            {/* Essential Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {[
                {
                  icon: CalendarDays,
                  label: "Due Date",
                  value: formatDate(new Date(bidding_deadline)),
                  subValue: "14 days remaining",
                },
                {
                  icon: Building2,
                  label: "Department",
                  value: buying_department.name || "N/A",
                  subValue: "Requesting Unit",
                },
                {
                  icon: Tag,
                  label: "Category",
                  value: category,
                  subValue: "Purchase Type",
                },
                {
                  icon: Clock,
                  label: "Created",
                  value: formatDateTime(
                    created_at ? new Date(created_at) : new Date()
                  ),
                },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <DetailItem {...item} />
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start space-x-3 p-4 rounded-lg h-full">
      <div className="mt-0.5">
        <Icon className="h-5 w-5 text-zinc-600" />
      </div>
      <div>
        <p className="text-base font-medium text-zinc-900">{label}</p>
        <p className="text-sm text-zinc-600">{value}</p>
      </div>
    </div>
  );
}
