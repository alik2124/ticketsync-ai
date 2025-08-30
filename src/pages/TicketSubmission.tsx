import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SendIcon, TicketIcon, Bot, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

export function TicketSubmission() {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiDraft, setAiDraft] = useState("");
  const [reviewerFeedback, setReviewerFeedback] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [showChat, setShowChat] = useState(false);
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
    setAiDraft("");
    setReviewerFeedback("");
    setIsComplete(false);
    setShowChat(true);
    
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
      let buffer = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          
          // Split by double newline to separate SSE events
          const events = buffer.split('\n\n');
          
          // Keep the last event in buffer in case it's incomplete
          buffer = events.pop() || "";
          
          for (const event of events) {
            if (event.trim()) {
              // Parse SSE format: "event: values\ndata: {...}"
              const lines = event.split('\n');
              let eventData = '';
              
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  eventData = line.slice(6).trim();
                  break;
                }
              }
              
              if (eventData) {
                try {
                  const parsedData = JSON.parse(eventData);
                  
                  // Only update if draft or reviewer_feedback exists
                  if (parsedData.draft !== undefined) {
                    setAiDraft(parsedData.draft);
                  }
                  if (parsedData.reviewer_feedback !== undefined) {
                    setReviewerFeedback(parsedData.reviewer_feedback);
                  }
                } catch (e) {
                  console.log('Failed to parse SSE data:', eventData);
                }
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

      {/* Chat-style conversation display */}
      {showChat && (
        <div className="space-y-4">
          {/* User Message */}
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="max-w-[80%] bg-primary text-primary-foreground rounded-xl rounded-tl-sm p-4 shadow-sm">
              <div className="font-semibold mb-2">{subject}</div>
              <div className="text-sm opacity-90">{description}</div>
            </div>
          </div>

          {/* AI Response */}
          {(aiDraft || isSubmitting) && (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-secondary-foreground" />
              </div>
              <div className="max-w-[85%] bg-card border rounded-xl rounded-tl-sm p-5 shadow-lg">
                <div className="flex items-center space-x-2 mb-4">
                  {isSubmitting && !isComplete ? (
                    <>
                      <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                      <span className="text-sm font-medium text-muted-foreground">AI is responding...</span>
                    </>
                  ) : (
                    <>
                      <div className="w-3 h-3 bg-success rounded-full" />
                      <span className="text-sm font-medium text-success">AI Response Complete</span>
                    </>
                  )}
                </div>
                
                {aiDraft ? (
                  <div className="space-y-4">
                    <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-li:text-foreground">
                      <ReactMarkdown
                        components={{
                          h1: ({children}) => <h1 className="text-lg font-semibold mb-3 text-foreground">{children}</h1>,
                          h2: ({children}) => <h2 className="text-base font-semibold mb-2 text-foreground">{children}</h2>,
                          h3: ({children}) => <h3 className="text-sm font-semibold mb-2 text-foreground">{children}</h3>,
                          p: ({children}) => <p className="mb-2 text-sm leading-relaxed text-foreground">{children}</p>,
                          ul: ({children}) => <ul className="mb-3 ml-4 space-y-1">{children}</ul>,
                          ol: ({children}) => <ol className="mb-3 ml-4 space-y-1">{children}</ol>,
                          li: ({children}) => <li className="text-sm text-foreground">{children}</li>,
                          strong: ({children}) => <strong className="font-semibold text-foreground">{children}</strong>,
                          code: ({children}) => <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>,
                          pre: ({children}) => <pre className="bg-muted p-3 rounded-lg overflow-x-auto text-xs">{children}</pre>
                        }}
                      >
                        {aiDraft}
                      </ReactMarkdown>
                      {isSubmitting && !isComplete && (
                        <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse rounded" />
                      )}
                    </div>
                    
                    {reviewerFeedback && (
                      <div className="mt-4 pt-3 border-t border-border/50 bg-muted/30 rounded-lg p-3">
                        <div className="flex items-center space-x-1 mb-2">
                          <div className="w-2 h-2 bg-warning rounded-full" />
                          <span className="text-xs font-medium text-warning">Reviewer Note</span>
                        </div>
                        <p className="text-xs text-muted-foreground italic leading-relaxed">{reviewerFeedback}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 text-muted-foreground py-6">
                    <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                    <span className="text-sm">Analyzing your request and preparing response...</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}