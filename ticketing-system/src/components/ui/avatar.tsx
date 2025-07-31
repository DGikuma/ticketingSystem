import * as React from "react";
import { cn } from "@/lib/utils";

// Avatar root component
export function Avatar({
  children,
  className,
  status = "offline",
  loading = false,
  ...props
}: {
  children?: React.ReactNode;
  className?: string;
  status?: "online" | "offline";
  loading?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="relative">
      <div
        className={cn(
          "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full justify-center items-center",
          loading
            ? "bg-gray-200 dark:bg-gray-700 animate-pulse"
            : "bg-gradient-to-br from-indigo-500 to-purple-600 text-white",
          className
        )}
        {...props}
      >
        {children}
      </div>

      {/* Status Dot */}
      <span
        className={cn(
          "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-gray-900",
          status === "online" ? "bg-green-500" : "bg-gray-400"
        )}
      />
    </div>
  );
}

// Avatar image with fallback handling
export function AvatarImage({
  src,
  alt,
  onErrorFallback,
  className,
  ...props
}: {
  src: string;
  alt?: string;
  onErrorFallback?: React.ReactNode;
  className?: string;
} & React.ImgHTMLAttributes<HTMLImageElement>) {
  const [hasError, setHasError] = React.useState(false);

  if (hasError) return onErrorFallback || null;

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className={cn("h-full w-full object-cover", className)}
      {...props}
    />
  );
}

// Fallback initials when image fails
export function AvatarFallback({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "flex h-full w-full items-center justify-center uppercase text-sm font-bold text-white",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
