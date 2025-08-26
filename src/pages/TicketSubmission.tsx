import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SendIcon, TicketIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function TicketSubmission() {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both subject and description fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Ticket Submitted Successfully",
        description: "Your support ticket is being processed by our AI agent.",
      });
      
      // Store ticket data in localStorage for demo
      const ticketId = Date.now().toString();
      const ticketData = {
        id: ticketId,
        subject,
        description,
        status: "processing",
        submittedAt: new Date().toISOString(),
      };
      
      localStorage.setItem(`ticket-${ticketId}`, JSON.stringify(ticketData));
      localStorage.setItem("currentTicketId", ticketId);
      
      navigate("/processing");
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full">
          <TicketIcon className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Submit a Support Ticket</h1>
        <p className="text-lg text-muted-foreground">
          Describe your issue and our AI agent will analyze and provide assistance
        </p>
      </div>

      <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Ticket Details</CardTitle>
          <CardDescription>
            Please provide clear information about your issue for the best assistance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of your issue"
                className="h-11"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide detailed information about your issue, including any error messages or steps to reproduce the problem"
                className="min-h-[120px] resize-none"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span>Submitting...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <SendIcon className="w-4 h-4" />
                  <span>Submit Ticket</span>
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}