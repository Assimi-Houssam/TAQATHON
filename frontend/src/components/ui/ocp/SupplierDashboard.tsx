import { DashboardCard } from "@/components/ui/ocp/DashboardCard";
import { DashboardHeader } from "@/components/ui/ocp/DashboardHeader";
import { ExportMenu } from "@/components/ui/ocp/ExportMenu";
import { MetricsCard } from "@/components/ui/ocp/MetricsCard";
import { TimeframeSelect } from "@/components/ui/ocp/TimeframeSelect";
import { TodoList, AddNewTaskButton } from "@/components/ui/ocp/TodoList";
import { useUser } from "@/context/user-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  DollarSign,
  FileText,
  Globe,
  Mail,
  Package,
  Phone,
  Timer,
  TrendingUp,
  ClipboardList,
} from "lucide-react";

interface BidCardProps {
  title: string;
  dueDate: string;
  status: string;
  amount: string;
  progress: number;
}

const BidCard = ({
  title,
  dueDate,
  status,
  amount,
  progress,
}: BidCardProps) => (
  <Card className="group transition-all cursor-pointer border">
    <div className="p-4">
      <div className="flex flex-col space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-lg transition-colors">
                {title}
              </h3>
              <Badge
                variant={
                  status === "pending"
                    ? "secondary"
                    : status === "approved"
                    ? "default"
                    : "destructive"
                }
                className="capitalize"
              >
                {status}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>Due {dueDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <DollarSign className="h-4 w-4" />
                <span>{amount}</span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Completion</span>
              <Badge variant="outline" className="font-normal">
                {progress}%
              </Badge>
            </div>
            <span
              className={
                progress >= 75
                  ? "text-green-500"
                  : progress >= 50
                  ? "text-yellow-500"
                  : "text-muted-foreground"
              }
            >
              {progress >= 75
                ? "Almost Complete"
                : progress >= 50
                ? "In Progress"
                : "Getting Started"}
            </span>
          </div>
          <div className="relative">
            <Progress
              value={progress}
              className={cn(
                "h-2",
                progress >= 75
                  ? "bg-green-500"
                  : progress >= 50
                  ? "bg-yellow-500"
                  : "bg-primary"
              )}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  </Card>
);

export const SupplierDashboard = () => {
  const { user } = useUser();
  const iconSize = "h-4 w-4";

  const metrics = [
    {
      title: "Active Bids",
      value: "12",
      subtitle: "4 pending responses",
      icon: <BarChart3 className="h-4 w-4" />,
      trend: { value: 12, isPositive: true },
    },
    {
      title: "Won Contracts",
      value: "8",
      subtitle: "This year",
      icon: <FileText className="h-4 w-4" />,
      trend: { value: 8, isPositive: true },
    },
    {
      title: "Ongoing Deliveries",
      value: "3",
      subtitle: "2 due this week",
      icon: <Package className="h-4 w-4" />,
    },
    {
      title: "Success Rate",
      value: "76%",
      subtitle: "Last 30 days",
      icon: <TrendingUp className="h-4 w-4" />,
      trend: { value: 5, isPositive: true },
    },
  ];

  const mockIncidents = [
    {
      title: "Temperature Sensor Calibration",
      dueDate: "3 days",
      status: "pending",
      amount: "Priority: High",
      progress: 75,
    },
    {
      title: "Vibration Anomaly Analysis",
      dueDate: "5 days",
      status: "approved",
      amount: "Priority: Critical",
      progress: 40,
    },
    {
      title: "Pressure System Inspection",
      dueDate: "1 week",
      status: "pending",
      amount: "Priority: Medium",
      progress: 20,
    },
  ];

  const mockActivities = [
    {
      type: "success",
      title: "Bid Approved",
      description: "Your bid for IT Equipment Tender has been approved",
      time: "2 hours ago",
      icon: <CheckCircle2 className="h-5 w-5" />,
    },
    {
      type: "warning",
      title: "Deadline Approaching",
      description: "24 hours left to submit bid for Office Supplies",
      time: "5 hours ago",
      icon: <Timer className="h-5 w-5" />,
    },
    {
      type: "info",
      title: "New Opportunity",
      description: "New tender matching your profile: Industrial Equipment",
      time: "1 day ago",
      icon: <AlertCircle className="h-5 w-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="p-8 space-y-8 max-w-[2000px] mx-auto">
        <DashboardHeader
          title={`Welcome back, ${user?.username}!`}
          subtitle="Here's what's happening with your company"
          action={
            <div className="flex items-center gap-4">
              <TimeframeSelect
                fromYear={new Date().getFullYear() - 10}
                toYear={new Date().getFullYear()}
              />
              <ExportMenu
                onExportXLSX={() => {}}
                onExportJSON={() => {}}
                onExportCSV={() => {}}
                onPrint={() => {}}
              />
            </div>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          {metrics.map((item, index) => (
            <MetricsCard key={index} item={item} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Bids & Activities */}
          <div className="lg:col-span-8 space-y-6">
            <DashboardCard title="Recent Bids" icon={<FileText className="h-4 w-4" />}>
              <Tabs defaultValue="all" className="w-full">
                <div className="px-6 pt-4">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="approved">Approved</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected</TabsTrigger>
                  </TabsList>
                </div>

                <div className="p-4 space-y-4">
                  <TabsContent value="all" className="space-y-4 mt-0">
                    {mockIncidents.map((incident, index) => (
                      <BidCard key={index} {...incident} />
                    ))}
                  </TabsContent>
                </div>
              </Tabs>
            </DashboardCard>

            <DashboardCard title="Recent Activities" icon={<AlertCircle className="h-4 w-4" />}>
              <div className="p-4 space-y-6">
                {mockActivities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div
                      className={cn(
                        "p-2 rounded-full shrink-0",
                        activity.type === "success"
                          ? "bg-green-100 text-green-600"
                          : activity.type === "warning"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-blue-100 text-blue-600"
                      )}
                    >
                      {activity.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="font-medium">{activity.title}</p>
                        <span className="text-sm text-muted-foreground whitespace-nowrap ml-4">
                          {activity.time}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </DashboardCard>
          </div>

          {/* Right Column - Company Info & Tasks */}
          <div className="lg:col-span-4 space-y-6">
            <DashboardCard
              title="Company Overview"
              icon={<Building2 className="h-4 w-4" />}
              action={
                <Button variant="outline" size="sm" className="gap-2">
                  <span>Edit Profile</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              }
            >
              <div className="p-4">
                <div className="flex flex-col gap-4">
                  <div className="shrink-0 flex items-center justify-between gap-4">
                    <div className="w-20 h-20 bg-zinc-50 rounded-lg flex items-center justify-center border">
                      <FileText className="h-8 w-8 text-zinc-600" />
                    </div>
                    <div className="w-full flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium">
                          {user?.company?.name || "Company Name"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Manufacturing & Supply
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-zinc-50 text-zinc-600">
                        Verified Supplier
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm p-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>contact@company.com</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Globe className="h-4 w-4" />
                      <span>www.company.com</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>+1 234 567 890</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {user?.company?.created_at
                          ? new Date(user.company.created_at).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
                    <div className="px-4 py-3 bg-zinc-50 rounded-lg">
                      <p className="text-2xl font-semibold text-zinc-900">127</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Total Bids
                      </p>
                    </div>
                    <div className="px-4 py-3 bg-zinc-50 rounded-lg">
                      <p className="text-2xl font-semibold text-zinc-900">92%</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Success Rate
                      </p>
                    </div>
                    <div className="px-4 py-3 bg-zinc-50 rounded-lg">
                      <p className="text-2xl font-semibold text-zinc-900">4.8/5</p>
                      <p className="text-sm text-muted-foreground mt-1">Rating</p>
                    </div>
                  </div>
                </div>
              </div>
            </DashboardCard>

            <DashboardCard
              title="Tasks"
              icon={<ClipboardList className="h-4 w-4" />}
              contentClassName="max-h-[800px]"
              action={<AddNewTaskButton />}
            >
              <TodoList className="h-full border-none shadow-none" />
            </DashboardCard>
          </div>
        </div>
      </div>
    </div>
  );
};
