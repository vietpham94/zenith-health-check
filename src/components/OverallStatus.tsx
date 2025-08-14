import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";
import type { ServiceStatus } from "./ServiceCard";

interface OverallStatusProps {
  services: ServiceStatus[];
}

const OverallStatus = ({ services }: OverallStatusProps) => {
  const getOverallStatus = () => {
    const hasDown = services.some(service => service.status === "down");
    const hasDegraded = services.some(service => service.status === "degraded");
    
    if (hasDown) return "down";
    if (hasDegraded) return "degraded";
    return "healthy";
  };

  const overallStatus = getOverallStatus();
  const healthyCount = services.filter(s => s.status === "healthy").length;
  const totalCount = services.length;

  const getStatusMessage = () => {
    switch (overallStatus) {
      case "healthy":
        return "All systems operational";
      case "degraded":
        return "Some systems experiencing issues";
      case "down":
        return "Service disruption detected";
      default:
        return "Status unknown";
    }
  };

  return (
    <Card className="bg-gradient-card border border-border/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">System Status</h2>
              <StatusBadge status={overallStatus}>
                {getStatusMessage()}
              </StatusBadge>
            </div>
            <p className="text-muted-foreground">
              {healthyCount} of {totalCount} services operational
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-foreground">
              {Math.round((healthyCount / totalCount) * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">Uptime</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OverallStatus;