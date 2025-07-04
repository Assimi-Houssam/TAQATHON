"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useSessions,
  useTerminateAllSessions,
  useTerminateSession,
} from "@/endpoints/auth/useSessions";
import { safeFormat } from "@/lib/utils/date";
import { motion } from "framer-motion";
import { Loader2, Monitor, Smartphone, X } from "lucide-react";

interface Session {
  id: number;
  ip_address: string;
  user_agent: string;
  last_activity: string;
  is_active: boolean;
  created_at: string;
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
    </div>
  );
}

function DeviceIcon({ userAgent }: { userAgent: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      {userAgent?.toLowerCase().includes("mobile") ? (
        <Smartphone className="w-6 h-6" />
      ) : (
        <Monitor className="w-6 h-6" />
      )}
    </motion.div>
  );
}

function SessionCard({
  session,
  onTerminate,
  isTerminating,
}: {
  session: Session;
  onTerminate: () => void;
  isTerminating: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <DeviceIcon userAgent={session.user_agent} />
          <div>
            <p className="font-medium">
              {session.user_agent || "Unknown Device"}
            </p>
            <p className="text-sm text-muted-foreground">
              IP: {session.ip_address} • Last active:{" "}
                              {safeFormat(session.last_activity, "PPp", "Invalid date")}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onTerminate}
          disabled={isTerminating}
        >
          {isTerminating ? (
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          ) : (
            <X className="w-4 h-4" />
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

function SessionsListHeader({
  onTerminateAll,
  isTerminatingAll,
}: {
  onTerminateAll: () => void;
  isTerminatingAll: boolean;
}) {
  return (
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
      <CardTitle>Active Sessions</CardTitle>
      <Button
        variant="destructive"
        onClick={onTerminateAll}
        disabled={isTerminatingAll}
      >
        {isTerminatingAll ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2 text-blue-500" />
        ) : null}
        Terminate All Sessions
      </Button>
    </CardHeader>
  );
}

export function SessionsList() {
  const { data: sessions, isLoading } = useSessions();
  const terminateSession = useTerminateSession();
  const terminateAllSessions = useTerminateAllSessions();

  if (isLoading) return <LoadingSpinner />;

  return (
    <Card>
      <SessionsListHeader
        onTerminateAll={() => terminateAllSessions.mutate()}
        isTerminatingAll={terminateAllSessions.isPending}
      />
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {sessions?.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <SessionCard
                  session={session}
                  onTerminate={() => terminateSession.mutate(session.id)}
                  isTerminating={terminateSession.isPending}
                />
              </motion.div>
            ))}
          </motion.div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
