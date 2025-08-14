import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      status: {
        healthy: "bg-status-healthy text-status-healthy-foreground",
        degraded: "bg-status-degraded text-status-degraded-foreground", 
        down: "bg-status-down text-status-down-foreground",
      },
    },
    defaultVariants: {
      status: "healthy",
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  status: "healthy" | "degraded" | "down";
}

const StatusBadge = ({ className, status, children, ...props }: StatusBadgeProps) => {
  return (
    <div className={cn(statusBadgeVariants({ status }), className)} {...props}>
      <div className={cn("w-2 h-2 rounded-full mr-2", {
        "bg-status-healthy-foreground": status === "healthy",
        "bg-status-degraded-foreground": status === "degraded", 
        "bg-status-down-foreground": status === "down",
      })} />
      {children}
    </div>
  );
};

export { StatusBadge, statusBadgeVariants };