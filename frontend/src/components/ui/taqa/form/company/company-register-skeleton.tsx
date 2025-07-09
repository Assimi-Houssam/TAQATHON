"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CompanyRegistrationSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-full p-4">
      <Card className="w-full max-w-3xl shadow-md">
        <CardHeader className="flex flex-row items-center gap-4 space-y-0 border-b pb-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-36" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="bg-amber-50 p-4 rounded-lg">
              <Skeleton className="h-4 w-full" />
            </div>
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
