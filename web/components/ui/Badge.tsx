import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "active" | "disabled" | "pending" | "error" | "info";
  children: React.ReactNode;
  className?: string;
}

const variantStyles = {
  active: "bg-primary/20 text-primary border-primary/30",
  disabled: "bg-surface-container-high text-outline border-outline-variant",
  pending: "bg-amber-900/20 text-amber-400 border-amber-800/30",
  error: "bg-error/10 text-error border-error/20",
  info: "bg-surface-container-high text-on-surface-variant border-outline-variant",
};

const dotStyles = {
  active: "bg-primary",
  disabled: "bg-outline",
  pending: "bg-amber-400",
  error: "bg-error",
  info: "bg-on-surface-variant",
};

export default function Badge({ variant = "info", children, className }: BadgeProps) {
  return (
    <span className={cn("px-2 py-1 rounded border text-label-caps font-label-caps flex items-center gap-1 w-fit", variantStyles[variant], className)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", dotStyles[variant])} />
      {children}
    </span>
  );
}
