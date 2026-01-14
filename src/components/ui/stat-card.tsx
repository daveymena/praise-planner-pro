import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
}

export function StatCard({ title, value, subtitle, icon: Icon, trend }: StatCardProps) {
  return (
    <div className="card-premium p-6 group hover:border-primary/50 transition-all duration-500 overflow-hidden relative fade-in">
      {/* Decorative element */}
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/5 rounded-full group-hover:bg-primary/10 transition-colors duration-500" />

      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-2">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{title}</p>
          <p className="text-3xl font-black text-foreground tracking-tighter">{value}</p>
          {subtitle && (
            <div className="flex items-center gap-1.5">
              {trend === 'up' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
              {trend === 'down' && <div className="w-1.5 h-1.5 rounded-full bg-red-500" />}
              <p className={`text-[10px] font-bold uppercase tracking-widest ${trend === 'up' ? 'text-emerald-600' :
                  trend === 'down' ? 'text-red-500' :
                    'text-muted-foreground'
                }`}>
                {subtitle}
              </p>
            </div>
          )}
        </div>
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-sm border border-primary/5">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
    </div>
  );
}
