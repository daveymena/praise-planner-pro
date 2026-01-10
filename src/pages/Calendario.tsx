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
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add the days of the month
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 fade-in">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">
              Calendario 📅
            </h1>
            <p className="text-muted-foreground mt-1">
              Vista general de ensayos y servicios
            </p>
          </div>
        </div>

        {/* Calendar Controls */}
        <div className="card-elevated p-4 mb-6 flex items-center justify-between fade-in">
          <Button variant="ghost" size="icon" onClick={previousMonth}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-xl font-serif font-semibold text-foreground">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">Ensayo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-sm text-muted-foreground">Servicio</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-sm text-muted-foreground">Especial</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="card-elevated overflow-hidden slide-up">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 bg-secondary/50">
            {daysOfWeek.map(day => (
              <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground">
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
                  className={`min-h-24 lg:min-h-32 p-2 border-t border-r border-border/50 ${
                    day ? 'bg-card hover:bg-secondary/30 transition-colors' : 'bg-secondary/20'
                  } ${index % 7 === 0 ? 'border-l-0' : ''}`}
                >
                  {day && (
                    <>
                      <span className={`text-sm font-medium ${
                        isToday(day) 
                          ? 'w-7 h-7 flex items-center justify-center rounded-full gold-gradient text-primary-foreground' 
                          : 'text-foreground'
                      }`}>
                        {day}
                      </span>
                      
                      <div className="mt-1 space-y-1">
                        {events.slice(0, 2).map(event => {
                          const style = eventTypeStyles[event.type];
                          const Icon = style.icon;
                          
                          return (
                            <div 
                              key={event.id}
                              className={`${style.bg} ${style.text} p-1 rounded text-xs truncate flex items-center gap-1`}
                            >
                              <Icon className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate hidden sm:inline">{event.title}</span>
                              <span className="sm:hidden">{event.time}</span>
                            </div>
                          );
                        })}
                        {events.length > 2 && (
                          <span className="text-xs text-muted-foreground">
                            +{events.length - 2} más
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="mt-8">
          <h2 className="text-xl font-serif font-semibold text-foreground mb-4">
            Próximos Eventos
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockEvents.slice(0, 6).map((event, index) => {
              const style = eventTypeStyles[event.type];
              const Icon = style.icon;
              
              return (
                <div 
                  key={event.id}
                  className="card-elevated p-4 flex items-center gap-4 slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`w-12 h-12 rounded-xl ${style.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${style.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">{event.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })} • {event.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
