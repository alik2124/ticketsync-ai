import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircleIcon, 
  RefreshCwIcon, 
  AlertTriangleIcon, 
  ClockIcon,
  EyeIcon 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: "processing" | "analyzed" | "approved" | "escalated";
  submittedAt: string;
  classification?: string;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "approved":
      return <CheckCircleIcon className="w-4 h-4 text-success" />;
    case "escalated":
      return <AlertTriangleIcon className="w-4 h-4 text-warning" />;
    case "processing":
    case "analyzed":
      return <ClockIcon className="w-4 h-4 text-muted-foreground" />;
    default:
      return <ClockIcon className="w-4 h-4 text-muted-foreground" />;
  }
};

const getStatusVariant = (status: string) => {
  switch (status) {
    case "approved":
      return "default" as const;
    case "escalated":
      return "destructive" as const;
    case "processing":
    case "analyzed":
      return "secondary" as const;
    default:
      return "secondary" as const;
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "approved":
      return "Approved";
    case "escalated":
      return "Escalated";
    case "processing":
      return "Processing";
    case "analyzed":
      return "Pending Review";
    default:
      return "Unknown";
  }
};

export function TicketHistory() {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    // Load all tickets from localStorage
    const loadedTickets: Ticket[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("ticket-")) {
        const ticketData = localStorage.getItem(key);
        if (ticketData) {
          try {
            const ticket = JSON.parse(ticketData);
            loadedTickets.push(ticket);
          } catch (error) {
            console.error("Error parsing ticket data:", error);
          }
        }
      }
    }
    
    // Sort by submission date (newest first)
    loadedTickets.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    setTickets(loadedTickets);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (tickets.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Ticket History</h1>
          <div className="py-12">
            <ClockIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">No tickets submitted yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Submit your first support ticket to see it here
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Ticket History</h1>
        <p className="text-muted-foreground">
          View and track all your support tickets
        </p>
      </div>

      <div className="grid gap-4">
        {tickets.map((ticket) => (
          <Card key={ticket.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>#{ticket.id}</span>
                    <span>{formatDate(ticket.submittedAt)}</span>
                    {ticket.classification && (
                      <Badge variant="outline" className="text-xs">
                        {ticket.classification}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(ticket.status)}
                    <Badge variant={getStatusVariant(ticket.status)}>
                      {getStatusLabel(ticket.status)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-muted-foreground mb-4 line-clamp-2">
                {ticket.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {ticket.status === "processing" && (
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      <span>AI is analyzing...</span>
                    </div>
                  )}
                  {ticket.status === "analyzed" && (
                    <div className="flex items-center space-x-1 text-sm text-warning">
                      <RefreshCwIcon className="w-3 h-3" />
                      <span>Awaiting review</span>
                    </div>
                  )}
                </div>
                <Button variant="outline" size="sm" className="flex items-center space-x-1">
                  <EyeIcon className="w-3 h-3" />
                  <span>View Details</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}