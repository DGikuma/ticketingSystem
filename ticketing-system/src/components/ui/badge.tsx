import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
  color = "default",
}: {
  children: React.ReactNode;
  className?: string;
  color?: "default" | "success" | "danger" | "warning" | "info";
}) {
  const colorClasses = {
    default: "bg-gray-200 text-gray-800",
    success: "bg-green-100 text-green-700",
    danger: "bg-red-100 text-red-700",
    warning: "bg-yellow-100 text-yellow-800",
    info: "bg-blue-100 text-blue-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        colorClasses[color],
        className
      )}
    >
      {children}
    </span>
  );
}
