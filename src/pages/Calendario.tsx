import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Mic2,
  Church,
  Calendar as CalendarIcon
} from "lucide-react";
import { useState } from "react";

interface CalendarEvent {
  id: number;
  date: string;
  title: string;
  time: string;
  type: "ensayo" | "servicio" | "especial";
}

const mockEvents: CalendarEvent[] = [
  { id: 1, date: "2025-01-16", title: "Ensayo General", time: "19:30", type: "ensayo" },
  { id: 2, date: "2025-01-18", title: "Ensayo Vocal", time: "16:00", type: "ensayo" },
  { id: 3, date: "2025-01-19", title: "Culto Domingo", time: "10:00", type: "servicio" },
  { id: 4, date: "2025-01-23", title: "Ensayo General", time: "19:30", type: "ensayo" },
  { id: 5, date: "2025-01-24", title: "Vigilia", time: "21:00", type: "servicio" },
  { id: 6, date: "2025-01-26", title: "Culto Domingo", time: "10:00", type: "servicio" },
  { id: 7, date: "2025-01-30", title: "Ensayo General", time: "19:30", type: "ensayo" },
];

const eventTypeStyles = {
  ensayo: { bg: "bg-primary/20", text: "text-primary", icon: Mic2 },
  servicio: { bg: "bg-purple-500/20", text: "text-purple-600", icon: Church },
  especial: { bg: "bg-amber-500/20", text: "text-amber-600", icon: CalendarIcon },
};

export default function Calendario() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 1)); // January 2025

  const daysOfWeek = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const getEventsForDay = (day: number | null) => {
    if (!day) return [];
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return mockEvents.filter(event => event.date === dateStr);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const days = getDaysInMonth(currentDate);
  const today = new Date();
  const isToday = (day: number | null) => {
    if (!day) return false;
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-0 sm:px-4 space-y-8 pb-32 lg:pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 sm:px-0 fade-in">
          <div className="flex items-center gap-4">
            <div className="w-2 h-10 rounded-full bg-primary" />
            <div className="space-y-1">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                Calendario
              </h1>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                Gestión de Eventos y Servicios
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-secondary/30 p-1.5 rounded-2xl border border-border/50">
            <Button variant="ghost" size="icon" onClick={previousMonth} className="rounded-xl hover:bg-background h-10 w-10">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h2 className="px-6 text-sm font-black uppercase tracking-[0.2em] text-foreground">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <Button variant="ghost" size="icon" onClick={nextMonth} className="rounded-xl hover:bg-background h-10 w-10">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Legend & Stats */}
        <div className="flex flex-wrap items-center gap-6 px-4 sm:px-0">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/20">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Ensayos</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/5 border border-purple-500/20">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-600">Servicios</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/5 border border-amber-500/20">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Especial</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8 px-4 sm:px-0">
          {/* Calendar Grid */}
          <div className="lg:col-span-3">
            <div className="card-premium p-0 overflow-hidden slide-up group">
              {/* Days of Week Header */}
              <div className="grid grid-cols-7 bg-secondary/20 border-b border-border/50">
                {daysOfWeek.map(day => (
                  <div key={day} className="p-4 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7">
                {days.map((day, index) => {
                  const events = getEventsForDay(day);

                  return (
                    <div
                      key={index}
                      className={`min-h-[100px] sm:min-h-[120px] p-2 border-t border-r border-border/40 relative group/day ${day ? 'bg-background hover:bg-primary/[0.02] transition-colors' : 'bg-secondary/10'
                        } ${index % 7 === 0 ? 'border-l-0' : ''}`}
                    >
                      {day && (
                        <>
                          <div className="flex justify-between items-start">
                            <span className={`text-xs font-black w-7 h-7 flex items-center justify-center rounded-xl transition-all ${isToday(day)
                                ? 'gold-gradient text-white shadow-lg'
                                : 'text-muted-foreground group-hover/day:text-foreground'
                              }`}>
                              {day}
                            </span>
                            {events.length > 0 && (
                              <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(255,215,0,0.5)]" />
                            )}
                          </div>

                          <div className="mt-2 space-y-1">
                            {events.slice(0, 2).map(event => {
                              const style = eventTypeStyles[event.type];
                              const Icon = style.icon;

                              return (
                                <div
                                  key={event.id}
                                  className={`${style.bg} ${style.text} px-2 py-1 rounded-lg text-[9px] font-bold truncate flex items-center gap-1.5 border border-transparent hover:border-current/20 transition-all`}
                                >
                                  <Icon className="w-3 h-3 flex-shrink-0 opacity-70" />
                                  <span className="truncate uppercase tracking-tight">{event.title}</span>
                                </div>
                              );
                            })}
                            {events.length > 2 && (
                              <div className="text-[8px] font-black text-muted-foreground/60 uppercase tracking-widest pl-1">
                                + {events.length - 2} MÁS
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Side Panel: Featured Events */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-6 rounded-full bg-primary" />
              <h2 className="text-sm font-black text-foreground uppercase tracking-widest">
                Próximas Fechas
              </h2>
            </div>

            <div className="space-y-4">
              {mockEvents.slice(0, 5).map((event, index) => {
                const style = eventTypeStyles[event.type];
                const Icon = style.icon;

                return (
                  <div
                    key={event.id}
                    className="card-premium p-4 flex items-center gap-4 slide-up group/item hover:border-primary/30"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className={`w-12 h-12 rounded-2xl ${style.bg} flex items-center justify-center shadow-inner group-hover/item:scale-110 transition-transform duration-500`}>
                      <Icon className={`w-5 h-5 ${style.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-black text-foreground uppercase tracking-tight truncate">{event.title}</h3>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                        {new Date(event.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} • <span className="text-primary">{event.time}</span>
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover/item:translate-x-1 transition-transform" />
                  </div>
                );
              })}
            </div>

            <div className="glass-card p-6 bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 overflow-hidden relative">
              <div className="absolute -right-8 -bottom-8 opacity-10">
                <CalendarIcon className="w-32 h-32" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight relative z-10">Agenda Pro</h3>
              <p className="text-xs font-medium text-white/80 mt-2 relative z-10 leading-relaxed">
                Optimiza la programación de tu ministerio con recordatorios automáticos.
              </p>
              <Button variant="outline" className="mt-6 w-full rounded-xl border-white/20 hover:bg-white/10 font-bold uppercase text-[10px] tracking-widest text-white h-11 relative z-10">
                Configurar Avisos
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
