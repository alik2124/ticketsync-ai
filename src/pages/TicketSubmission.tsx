import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SendIcon, TicketIcon, LoaderIcon, CheckCircleIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function TicketSubmission() {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState("");
  const [isComplete, setIsComplete] = useState(false);
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
    setStreamingResponse("");
    setIsComplete(false);
    
    try {
      const response = await fetch("http://localhost:8000/tickets/stream", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subject, description }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data.trim()) {
                setStreamingResponse(prev => prev + data + ' ');
              }
            }
          }
        }
      }
      
      setIsComplete(true);
      toast({
        title: "Response Complete",
        description: "AI analysis finished successfully.",
      });
    } catch (error) {
      console.error('Streaming error:', error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to the backend. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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

      {/* Streaming Response Display */}
      {(isSubmitting || streamingResponse) && (
        <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {isSubmitting && !isComplete ? (
                <>
                  <LoaderIcon className="w-5 h-5 animate-spin text-primary" />
                  <span>AI is analyzing your ticket...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-5 h-5 text-success" />
                  <span>AI Response Complete</span>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted/30 rounded-lg min-h-[120px] max-h-[400px] overflow-y-auto">
              {streamingResponse ? (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {streamingResponse}
                  {isSubmitting && !isComplete && (
                    <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse" />
                  )}
                </p>
              ) : (
                <div className="flex items-center justify-center h-20">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <LoaderIcon className="w-4 h-4 animate-spin" />
                    <span>Waiting for AI response...</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}