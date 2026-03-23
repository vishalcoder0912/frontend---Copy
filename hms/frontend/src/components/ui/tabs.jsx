import * as React from "react";
import PropTypes from "prop-types";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "../../lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center rounded-md border border-slate-200 bg-white p-1",
      className
    )}
    {...props}
  />
));
TabsList.displayName = "TabsList";

const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center rounded-sm px-3 py-1 text-sm font-medium text-slate-600 data-[state=active]:bg-sky-600 data-[state=active]:text-white",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Content ref={ref} className={cn("mt-4", className)} {...props} />
));
TabsContent.displayName = "TabsContent";

TabsList.propTypes = { className: PropTypes.string };
TabsTrigger.propTypes = { className: PropTypes.string };
TabsContent.propTypes = { className: PropTypes.string };

export { Tabs, TabsList, TabsTrigger, TabsContent };
