import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold tracking-wide uppercase transition-colors border",
  {
    variants: {
      variant: {
        critical:
          "border-red-500/40 bg-red-950/60 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.25)]",
        warning:
          "border-amber-500/40 bg-amber-950/60 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]",
        success:
          "border-emerald-500/40 bg-emerald-950/60 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]",
        info:
          "border-blue-500/40 bg-blue-950/60 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.2)]",
        neutral:
          "border-slate-700 bg-slate-800/80 text-slate-300",
        outline:
          "border-slate-600 text-slate-400 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  pulse?: boolean;
}

export function Badge({ className, variant, pulse, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {pulse && (
        <span
          className={cn(
            "mr-1.5 h-1.5 w-1.5 rounded-full animate-ping",
            variant === "critical" && "bg-red-400",
            variant === "warning" && "bg-amber-400",
            variant === "success" && "bg-emerald-400",
            variant === "info" && "bg-blue-400",
            !variant && "bg-slate-400"
          )}
        />
      )}
      {children}
    </div>
  );
}
