import { PurchaseRequestInfo } from "@/app/api/purchase-requests/route";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BuildingIcon, CalendarIcon, HashIcon, MapPinIcon } from "lucide-react";

interface RequestCardProps {
  request: PurchaseRequestInfo;
}

export function RequestCard({ request }: RequestCardProps) {
  return (
    <Card className="hover:bg-accent/50 transition-colors">
      <CardHeader>
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">{request.tenderTitle}</h3>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {request.categoryName}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{request.description}</p>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BuildingIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Organization:
              </span>
              <span className="text-sm">{request.buyerOrganization}</span>
            </div>
            <div className="flex items-center gap-2">
              <HashIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Reference:
              </span>
              <span className="text-sm">{request.tenderReference}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                RFI Deadline:
              </span>
              <span className="text-sm">
                {new Date(request.rfiDeadline).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPinIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Site:
              </span>
              <span className="text-sm">{request.ocpSite}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
