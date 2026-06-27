import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export default function Button({ className, variant = "primary", size = "md", children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "font-body-bold rounded-lg transition-all duration-150 flex items-center justify-center gap-2",
        variant === "primary" && "bg-primary text-on-primary hover:bg-primary/90 shadow-[0_0_15px_rgba(249,115,22,0.4)]",
        variant === "outline" && "border border-outline-variant text-on-surface-variant hover:bg-surface-variant/30 hover:text-primary hover:border-primary/50",
        variant === "ghost" && "text-on-surface-variant hover:text-primary hover:bg-primary/10",
        variant === "danger" && "border border-error/50 text-error hover:bg-error/10",
        size === "sm" && "px-3 py-1 text-sm",
        size === "md" && "px-lg py-2 text-body-bold",
        size === "lg" && "px-xl py-4 text-lg",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
