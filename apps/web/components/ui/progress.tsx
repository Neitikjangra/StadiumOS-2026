import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const progressVariants = cva(
  "relative h-2 w-full overflow-hidden rounded-full bg-surface-alt",
  {
    variants: {
      variant: {
        default: "",
        success: "",
        warning: "",
        danger: "",
        info: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const barColors = {
  default: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
};

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants> {
  value?: number;
  max?: number;
}

function Progress({ className, value = 0, max = 100, variant = "default", ...props }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={cn(progressVariants({ variant }), className)} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} {...props}>
      <div
        className={cn("h-full rounded-full transition-all duration-300 ease-out", barColors[variant || "default"])}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export { Progress };
