import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  CheckCircleIcon, 
  RefreshCwIcon, 
  ChevronDownIcon, 
  LoaderIcon, 
  BrainIcon,
  FileTextIcon,
  AlertTriangleIcon 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface TicketData {
  id: string;
  subject: string;
  description: string;
  status: "processing" | "analyzed" | "approved" | "escalated";
  classification?: string;
  contextSnippets?: string[];
  draftResponse?: string;
}

const mockClassifications = ["Technical", "Billing", "Security", "General"];
const mockContextSnippets = [
  "Knowledge Base: Password reset procedures require admin approval for security accounts",
  "Previous Cases: Similar issues resolved by updating browser cache and cookies",
  "Documentation: Multi-factor authentication setup guide available in help center"
];

const mockDraftResponse = `Thank you for contacting support regarding your login issue.

Based on your description, this appears to be related to browser cache or cookie conflicts. Here's how to resolve this:

1. Clear your browser cache and cookies for our site
2. Disable any browser extensions temporarily
3. Try logging in using an incognito/private browsing window

If the issue persists, please try resetting your password using the "Forgot Password" link on the login page.

Let me know if you need any additional assistance!

Best regards,
AI Support Agent`;

export function TicketProcessing() {
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [processingStep, setProcessingStep] = useState(0);
  const [editedResponse, setEditedResponse] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Load ticket from localStorage
    const ticketId = localStorage.getItem("currentTicketId");
    if (ticketId) {
      const ticketData = localStorage.getItem(`ticket-${ticketId}`);
      if (ticketData) {
        const parsed = JSON.parse(ticketData);
        setTicket(parsed);
        
        // Simulate processing steps
        if (parsed.status === "processing") {
          simulateProcessing(parsed);
        }
      }
    }
  }, []);

  const simulateProcessing = async (ticketData: TicketData) => {
    // Step 1: Classification
    setTimeout(() => {
      setProcessingStep(1);
      setTicket(prev => prev ? { ...prev, classification: mockClassifications[Math.floor(Math.random() * mockClassifications.length)] } : null);
    }, 2000);

    // Step 2: Context Retrieval
    setTimeout(() => {
      setProcessingStep(2);
      setTicket(prev => prev ? { ...prev, contextSnippets: mockContextSnippets } : null);
    }, 4000);

    // Step 3: Draft Response
    setTimeout(() => {
      setProcessingStep(3);
      setTicket(prev => prev ? { ...prev, draftResponse: mockDraftResponse, status: "analyzed" } : null);
      setEditedResponse(mockDraftResponse);
    }, 6000);
  };

  const handleApprove = () => {
    if (ticket) {
      const updatedTicket = { ...ticket, status: "approved" as const };
      setTicket(updatedTicket);
      localStorage.setItem(`ticket-${ticket.id}`, JSON.stringify(updatedTicket));
      
      toast({
        title: "Response Approved",
        description: "The AI response has been approved and sent to the customer.",
      });
    }
  };

  const handleRetry = () => {
    if (ticket) {
      setProcessingStep(0);
      setTicket(prev => prev ? { ...prev, status: "processing" } : null);
      
      setTimeout(() => {
        if (Math.random() > 0.7) {
          // 30% chance of escalation
          const escalatedTicket = { ...ticket, status: "escalated" as const };
          setTicket(escalatedTicket);
          localStorage.setItem(`ticket-${ticket.id}`, JSON.stringify(escalatedTicket));
        } else {
          simulateProcessing(ticket);
        }
      }, 1000);
    }
  };

  if (!ticket) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-muted-foreground">No ticket found. Please submit a new ticket.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Ticket Processing</h1>
        <p className="text-muted-foreground">Ticket #{ticket.id}</p>
      </div>

      {/* Original Ticket */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileTextIcon className="w-5 h-5" />
            <span>Original Ticket</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="font-medium text-sm text-muted-foreground">Subject</p>
            <p className="text-base">{ticket.subject}</p>
          </div>
          <div>
            <p className="font-medium text-sm text-muted-foreground">Description</p>
            <p className="text-base">{ticket.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Processing Status */}
      {ticket.status === "processing" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <LoaderIcon className="w-5 h-5 animate-spin" />
              <span>Analyzing Ticket...</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className={cn("flex items-center space-x-3", processingStep >= 1 ? "text-success" : "text-muted-foreground")}>
                {processingStep >= 1 ? <CheckCircleIcon className="w-5 h-5" /> : <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />}
                <span>Classifying ticket type</span>
              </div>
              <div className={cn("flex items-center space-x-3", processingStep >= 2 ? "text-success" : "text-muted-foreground")}>
                {processingStep >= 2 ? <CheckCircleIcon className="w-5 h-5" /> : <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />}
                <span>Retrieving relevant context</span>
              </div>
              <div className={cn("flex items-center space-x-3", processingStep >= 3 ? "text-success" : "text-muted-foreground")}>
                {processingStep >= 3 ? <CheckCircleIcon className="w-5 h-5" /> : <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />}
                <span>Generating response draft</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {ticket.status === "analyzed" && (
        <>
          {/* Classification */}
          {ticket.classification && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BrainIcon className="w-5 h-5" />
                  <span>Classification</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className="text-base px-3 py-1">
                  {ticket.classification}
                </Badge>
              </CardContent>
            </Card>
          )}

          {/* Context Snippets */}
          {ticket.contextSnippets && (
            <Card>
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center space-x-2">
                        <FileTextIcon className="w-5 h-5" />
                        <span>Retrieved Context ({ticket.contextSnippets.length})</span>
                      </span>
                      <ChevronDownIcon className="w-4 h-4" />
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-3 pt-0">
                    {ticket.contextSnippets.map((snippet, index) => (
                      <div key={index} className="p-3 bg-muted/50 rounded-md text-sm">
                        {snippet}
                      </div>
                    ))}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          )}

          {/* Draft Response */}
          {ticket.draftResponse && (
            <Card>
              <CardHeader>
                <CardTitle>AI Draft Response</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={editedResponse}
                  onChange={(e) => setEditedResponse(e.target.value)}
                  className="min-h-[200px]"
                />
                <div className="flex space-x-3">
                  <Button onClick={handleApprove} className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>Approve & Send</span>
                  </Button>
                  <Button variant="outline" onClick={handleRetry} className="flex items-center space-x-2">
                    <RefreshCwIcon className="w-4 h-4" />
                    <span>Retry Analysis</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Approved State */}
      {ticket.status === "approved" && (
        <Card className="border-success">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircleIcon className="w-12 h-12 text-success mx-auto" />
              <div>
                <h3 className="text-lg font-semibold">Response Approved</h3>
                <p className="text-muted-foreground">Your response has been sent to the customer successfully.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Escalated State */}
      {ticket.status === "escalated" && (
        <Card className="border-warning">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertTriangleIcon className="w-12 h-12 text-warning mx-auto" />
              <div>
                <h3 className="text-lg font-semibold">Ticket Escalated</h3>
                <p className="text-muted-foreground">
                  Your ticket has been escalated to a human support agent. You will hear back soon.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}