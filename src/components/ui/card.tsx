import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    glow?: "red" | "orange" | "amber" | "blue" | "green" | "purple" | "cyan";
  }
>(({ className, glow, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border border-slate-800/90 bg-[#080d1a]/95 text-slate-100 shadow-xl backdrop-blur-md transition-all duration-200 hover:border-slate-700/80",
      glow === "red" && "border-red-600/40 shadow-[0_0_25px_rgba(239,68,68,0.12)] hover:border-red-500/60",
      (glow === "orange" || glow === "amber") && "border-amber-600/40 shadow-[0_0_25px_rgba(245,158,11,0.12)] hover:border-amber-500/60",
      glow === "blue" && "border-blue-600/40 shadow-[0_0_25px_rgba(59,130,246,0.12)] hover:border-blue-500/60",
      glow === "green" && "border-emerald-600/40 shadow-[0_0_25px_rgba(16,185,129,0.12)] hover:border-emerald-500/60",
      glow === "purple" && "border-purple-600/40 shadow-[0_0_25px_rgba(168,85,247,0.12)] hover:border-purple-500/60",
      glow === "cyan" && "border-cyan-600/40 shadow-[0_0_25px_rgba(6,182,212,0.12)] hover:border-cyan-500/60",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-4 sm:p-5 border-b border-slate-800/80 bg-slate-950/40 rounded-t-xl", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xs sm:text-sm font-bold tracking-wider uppercase text-slate-100 font-mono flex items-center gap-2",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs text-slate-400 font-normal leading-relaxed font-sans", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4 sm:p-5", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-4 border-t border-slate-800/80 bg-slate-950/60 rounded-b-xl", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
