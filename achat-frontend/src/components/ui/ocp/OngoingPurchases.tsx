import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { FaEdit, FaEye } from "react-icons/fa";

interface Purchase {
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
  purchases: Purchase[];
  className?: string;
}

export const OngoingPurchases = ({ purchases, className }: OngoingPurchasesProps) => {
  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "stock":
        return "bg-blue-100 text-blue-800";
      case "equipment":
        return "bg-purple-100 text-purple-800";
      case "service":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className={cn("flex flex-col h-full", className)}>
      {/* <CardHeader className="pb-3 px-6">
        <CardTitle>Ongoing Purchases</CardTitle>
      </CardHeader> */}
      <CardContent className="flex-1 p-0 pt-6">
        <ScrollArea className="h-[calc(100%-1rem)]">
          <div className="space-y-3">
            {purchases.map((purchase, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-100 p-4 hover:border-gray-200 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium leading-none">
                        {purchase.title}
                      </h3>
                      <Badge
                        variant="secondary"
                        className={cn("text-xs", getTypeColor(purchase.type))}
                      >
                        {purchase.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                      {purchase.description}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="h-8 w-8"
                    >
                      <Link href={`/dashboard/purchase-request/${purchase.id}`}>
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
                        href={`/dashboard/purchase-request/${purchase.id}/edit`}
                      >
                        <FaEdit className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Deadline:</span>
                    <span className="font-medium">
                      {purchase.bidding_deadline}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Department:</span>
                    <span className="font-medium">
                      {purchase.requesterDepartment}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Entity:</span>
                    <span className="font-medium">
                      {purchase.requesterEntity}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Requester:</span>
                    <span className="font-medium">{purchase.requester}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
