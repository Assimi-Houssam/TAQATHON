import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Anomaly, AnomalyStatus } from "@/types/anomaly";
import { Clock, CheckCircle, AlertTriangle, Calendar, Wrench } from "lucide-react";

interface AnomalyTimelineProps {
  anomaly: Anomaly;
  className?: string;
}

interface TimelineEvent {
  status: AnomalyStatus;
  timestamp?: string;
  label: string;
  description: string;
  icon: React.ElementType;
  completed: boolean;
}

export function AnomalyTimeline({ anomaly, className }: AnomalyTimelineProps) {
  const getTimelineEvents = (anomaly: Anomaly): TimelineEvent[] => {
    const currentStatusIndex = [
      'NEW',
      'IN_PROGRESS',
      'CLOSED'
    ].indexOf(anomaly.status || 'NEW');

    return [
      {
        status: 'NEW',
        timestamp: anomaly.created_at ? anomaly.created_at.toString() : undefined,
        label: 'Reported',
        description: 'Anomaly reported and awaiting review',
        icon: AlertTriangle,
        completed: currentStatusIndex >= 0
      },
      {
        status: 'IN_PROGRESS',
        timestamp: anomaly.date_traitement,
        label: 'In Progress',
        description: 'Maintenance In Progress for resolution',
        icon: Calendar,
        completed: currentStatusIndex >= 1
      },
      {
        status: 'CLOSED',
        timestamp: anomaly.resolution_date,
        label: 'Closed',
        description: 'Anomaly resolved and closed',
        icon: CheckCircle,
        completed: currentStatusIndex >= 2
      }
    ];
  };

  const events = getTimelineEvents(anomaly);

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Anomaly Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event, index) => {
            const Icon = event.icon;
            const isActive = anomaly.status === event.status;
            
            return (
              <div key={event.status} className="flex items-start gap-4">
                {/* Timeline connector */}
                <div className="relative flex flex-col items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    ${event.completed 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-gray-100 text-gray-400'
                    }
                    ${isActive ? 'ring-2 ring-blue-500' : ''}
                  `}>
                    <Icon className="h-4 w-4" />
                  </div>
                  {index < events.length - 1 && (
                    <div className={`
                      w-0.5 h-8 mt-1
                      ${event.completed ? 'bg-blue-200' : 'bg-gray-200'}
                    `} />
                  )}
                </div>

                {/* Event content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`text-sm font-medium ${
                      event.completed ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {event.label}
                    </h4>
                    {isActive && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        Current
                      </Badge>
                    )}
                  </div>
                  <p className={`text-sm ${
                    event.completed ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {event.description}
                  </p>
                  {event.timestamp && (
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(event.timestamp)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
} 