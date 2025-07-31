import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = React.createContext<TabsContextType | undefined>(undefined);

export function Tabs({
  children,
  value,
  onValueChange,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  value: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <TabsContext.Provider
      value={{
        activeTab: value,
        setActiveTab: onValueChange,
      }}
    >
      <div {...props}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        "inline-flex rounded-xl bg-muted p-1 text-muted-foreground shadow-inner",
        className
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  children,
  className,
  value,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within <Tabs>");

  const isActive = context.activeTab === value;

  return (
    <button
      {...props}
      onClick={() => context.setActiveTab(value)}
      className={cn(
        "px-4 py-1.5 text-sm font-medium rounded-lg transition-all",
        isActive
          ? "bg-background text-foreground shadow-sm"
          : "hover:text-foreground",
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  children,
  className,
  value,
}: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within <Tabs>");

  return (
    <div className={cn(context.activeTab !== value && "hidden", "pt-4", className)}>
      {children}
    </div>
  );
}
