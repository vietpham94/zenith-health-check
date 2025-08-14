import { useState, useEffect } from "react";
import OverallStatus from "@/components/OverallStatus";
import ServiceCard, { type ServiceStatus } from "@/components/ServiceCard";
import IncidentHistory, { type Incident } from "@/components/IncidentHistory";

const Index = () => {
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      id: "api",
      name: "API Server",
      status: "healthy",
      uptime: "99.98%",
      responseTime: "145ms",
      lastChecked: "30s ago",
      description: "Core API services and endpoints"
    },
    {
      id: "database",
      name: "Database",
      status: "healthy", 
      uptime: "99.95%",
      responseTime: "12ms",
      lastChecked: "30s ago",
      description: "Primary database cluster"
    },
    {
      id: "cdn",
      name: "CDN",
      status: "degraded",
      uptime: "98.82%",
      responseTime: "380ms",
      lastChecked: "45s ago",
      description: "Content delivery network"
    },
    {
      id: "auth",
      name: "Authentication",
      status: "healthy",
      uptime: "99.99%",
      responseTime: "95ms", 
      lastChecked: "30s ago",
      description: "User authentication and authorization"
    },
    {
      id: "monitoring",
      name: "Monitoring",
      status: "healthy",
      uptime: "99.91%",
      responseTime: "67ms",
      lastChecked: "15s ago",
      description: "System monitoring and alerting"
    },
    {
      id: "queue",
      name: "Message Queue",
      status: "healthy",
      uptime: "99.96%",
      responseTime: "23ms",
      lastChecked: "30s ago",
      description: "Background job processing"
    }
  ]);

  const [incidents] = useState<Incident[]>([
    {
      id: "1",
      title: "CDN Performance Degradation",
      status: "monitoring",
      severity: "minor", 
      startTime: "2024-01-14 14:32 UTC",
      description: "Elevated response times detected on CDN edge servers in EU region"
    }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setServices(prev => prev.map(service => ({
        ...service,
        lastChecked: Math.random() > 0.5 ? "30s ago" : "15s ago",
        responseTime: service.id === "cdn" 
          ? `${Math.floor(Math.random() * 100) + 350}ms`
          : `${Math.floor(Math.random() * 50) + parseInt(service.responseTime)}ms`
      })));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">System Health Dashboard</h1>
          <p className="text-lg text-muted-foreground">Real-time monitoring of all services and infrastructure</p>
        </div>

        {/* Overall Status */}
        <OverallStatus services={services} />

        {/* Services Grid */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Service Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>

        {/* Incident History */}
        <IncidentHistory incidents={incidents} />
      </div>
    </div>
  );
};

export default Index;
