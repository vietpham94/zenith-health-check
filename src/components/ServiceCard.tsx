import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";
import { cn } from "@/lib/utils";

export interface ServiceStatus {
  id: string;
  name: string;
  status: "healthy" | "degraded" | "down";
  uptime: string;
  responseTime: string;
  lastChecked: string;
  description?: string;
}

interface ServiceCardProps {
  service: ServiceStatus;
  className?: string;
}

const ServiceCard = ({ service, className }: ServiceCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "border-status-healthy/20 hover:border-status-healthy/40";
      case "degraded":
        return "border-status-degraded/20 hover:border-status-degraded/40";
      case "down":
        return "border-status-down/20 hover:border-status-down/40";
      default:
        return "border-border";
    }
  };

  return (
    <Card className={cn(
      "bg-gradient-card border transition-all duration-300 hover:shadow-card",
      getStatusColor(service.status),
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{service.name}</CardTitle>
          <StatusBadge status={service.status}>
            {service.status === "healthy" ? "Operational" : 
             service.status === "degraded" ? "Degraded" : "Down"}
          </StatusBadge>
        </div>
        {service.description && (
          <p className="text-sm text-muted-foreground">{service.description}</p>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium text-foreground">{service.uptime}</div>
            <div className="text-muted-foreground">Uptime</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-foreground">{service.responseTime}</div>
            <div className="text-muted-foreground">Response</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-foreground">{service.lastChecked}</div>
            <div className="text-muted-foreground">Last Check</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;