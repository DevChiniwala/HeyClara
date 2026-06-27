import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export default function GlassCard({ className, hover = true, children, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass-card rounded-xl p-lg",
        hover && "hover:border-primary/60 hover:shadow-[0_0_20px_rgba(249,115,22,0.1)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
