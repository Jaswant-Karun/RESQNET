import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-mono font-bold tracking-wider uppercase transition-all duration-150 border",
  {
    variants: {
      variant: {
        critical:
          "border-rose-500/50 bg-rose-950/70 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.25)]",
        warning:
          "border-amber-500/50 bg-amber-950/70 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]",
        success:
          "border-emerald-500/50 bg-emerald-950/70 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]",
        info:
          "border-blue-500/50 bg-blue-950/70 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.2)]",
        purple:
          "border-purple-500/50 bg-purple-950/70 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.2)]",
        cyan:
          "border-cyan-500/50 bg-cyan-950/70 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]",
        neutral:
          "border-slate-750 bg-slate-850/90 text-slate-300 border-slate-700",
        outline:
          "border-slate-700 text-slate-400 bg-slate-900/40",
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
            "mr-1.5 h-1.5 w-1.5 rounded-full animate-ping shrink-0",
            variant === "critical" && "bg-rose-400",
            variant === "warning" && "bg-amber-400",
            variant === "success" && "bg-emerald-400",
            variant === "info" && "bg-blue-400",
            variant === "purple" && "bg-purple-400",
            variant === "cyan" && "bg-cyan-400",
            (!variant || variant === "neutral" || variant === "outline") && "bg-slate-400"
          )}
        />
      )}
      {children}
    </div>
  );
}
