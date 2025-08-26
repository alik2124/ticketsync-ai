import { Link, useLocation } from "react-router-dom";
import { TicketIcon, ClockIcon, HomeIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "New Ticket", href: "/", icon: HomeIcon },
  { name: "Processing", href: "/processing", icon: TicketIcon },
  { name: "History", href: "/history", icon: ClockIcon },
];

export function Navigation() {
  const location = useLocation();

  return (
    <nav className="bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-semibold text-primary">
              Support Agent AI
            </Link>
            <div className="hidden md:flex space-x-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}