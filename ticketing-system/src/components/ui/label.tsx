import * as React from "react";
import { cn } from "@/lib/utils"; // Helper to merge class names (if you use it)

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "block text-sm font-medium text-gray-700 dark:text-gray-300",
        className
      )}
      {...props}
    />
  )
);

Label.displayName = "Label";

export { Label };
