import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface Incident {
  id: string;
  title: string;
  status: "investigating" | "identified" | "monitoring" | "resolved";
  severity: "minor" | "major" | "critical";
  startTime: string;
  resolvedTime?: string;
  description: string;
}

interface IncidentHistoryProps {
  incidents: Incident[];
}

const IncidentHistory = ({ incidents }: IncidentHistoryProps) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "minor":
        return "bg-status-degraded text-status-degraded-foreground";
      case "major":
        return "bg-status-down text-status-down-foreground";
      case "critical":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-status-healthy text-status-healthy-foreground";
      case "monitoring":
        return "bg-status-degraded text-status-degraded-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (incidents.length === 0) {
    return (
      <Card className="bg-gradient-card">
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-status-healthy text-2xl mb-2">✓</div>
            <p className="text-muted-foreground">No recent incidents to report</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card">
      <CardHeader>
        <CardTitle>Recent Incidents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {incidents.map((incident) => (
          <div key={incident.id} className="border border-border rounded-lg p-4 space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="font-medium text-foreground">{incident.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{incident.description}</p>
              </div>
              <div className="flex gap-2">
                <Badge className={getSeverityColor(incident.severity)}>
                  {incident.severity}
                </Badge>
                <Badge className={getStatusColor(incident.status)}>
                  {incident.status}
                </Badge>
              </div>
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>Started: {incident.startTime}</span>
              {incident.resolvedTime && (
                <span>Resolved: {incident.resolvedTime}</span>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default IncidentHistory;