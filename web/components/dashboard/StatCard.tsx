import { cn } from "@/lib/utils";
import Sparkline from "./Sparkline";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  trend?: "up" | "down";
  sparklineData?: number[];
  className?: string;
}

export default function StatCard({ label, value, icon, trend, sparklineData, className }: StatCardProps) {
  return (
    <div className={cn("glass-card rounded-xl p-lg flex flex-col justify-between group relative overflow-hidden", className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">{label}</span>
          <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform duration-300">{icon}</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-stat-lg font-stat-lg text-on-surface tracking-tight">{value}</h2>
            {trend && (
              <span className={cn(
                "text-label-sm font-label-sm flex items-center gap-1 mt-1",
                trend === "up" ? "text-green-400" : "text-error"
              )}>
                <span className="material-symbols-outlined text-sm">{trend === "up" ? "trending_up" : "trending_down"}</span>
                {trend === "up" ? "+12%" : "-3%"}
              </span>
            )}
          </div>
          {sparklineData && (
            <div className="opacity-60 group-hover:opacity-100 transition-opacity">
              <Sparkline data={sparklineData} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
