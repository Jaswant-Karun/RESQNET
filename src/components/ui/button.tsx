import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-blue-600 text-white shadow-md shadow-blue-900/30 hover:bg-blue-500 hover:shadow-blue-600/40 border border-blue-500/50",
        destructive:
          "bg-rose-600 text-white shadow-md shadow-rose-950/40 hover:bg-rose-500 hover:shadow-rose-600/40 border border-rose-500/50",
        outline:
          "border border-slate-700 bg-slate-900/80 text-slate-200 hover:bg-slate-800 hover:border-slate-500 hover:text-white shadow-sm",
        secondary:
          "bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700/60 shadow-sm",
        ghost:
          "text-slate-300 hover:bg-slate-850 hover:text-white border border-transparent",
        success:
          "bg-emerald-600 text-white shadow-md shadow-emerald-950/40 hover:bg-emerald-500 hover:shadow-emerald-600/40 border border-emerald-500/50",
        warning:
          "bg-amber-600 text-slate-950 shadow-md shadow-amber-950/40 hover:bg-amber-500 hover:shadow-amber-500/40 border border-amber-500/50",
      },
      size: {
        default: "h-8.5 px-4 py-1.5",
        sm: "h-7 rounded-md px-2.5 text-[11px]",
        lg: "h-10 rounded-lg px-6 text-xs",
        icon: "h-8.5 w-8.5 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
