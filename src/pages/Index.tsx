import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { CaseTypeSelector } from "@/components/CaseTypeSelector";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [caseType, setCaseType] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleCaseTypeSelect = (type: string) => {
    setCaseType(type);
    const welcomeMessage: Message = {
      role: "assistant",
      content: `I'll help you with your ${type} case. I'm an AI assistant trained on Indian law including the IPC, CrPC, and Constitution.\n\nPlease describe the facts of your case, and I'll guide you through the relevant legal provisions step by step.\n\nWhat are the key facts of your case?`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Simulate AI response for now
      // In production, this would call an edge function with Lovable AI
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const assistantMessage: Message = {
        role: "assistant",
        content: `Thank you for providing those details. Based on the information:\n\n**Relevant Legal Provisions:**\n\n1. **Indian Penal Code (IPC)** - This case may involve sections related to [specific sections based on case facts]\n\n2. **Code of Criminal Procedure (CrPC)** - Applicable procedural provisions include...\n\n**Next Steps:**\n\nTo provide more specific guidance, could you please clarify:\n\n• What is the date of the incident?\n• Are there any witnesses?\n• Has an FIR been filed?\n\n*Note: This is a prototype. Connect to Lovable AI for real legal analysis.*`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCaseType(null);
    setMessages([]);
    toast.success("Conversation reset");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6 flex flex-col max-w-5xl">
        {!caseType ? (
          <div className="flex-1 flex items-center justify-center">
            <CaseTypeSelector onSelect={handleCaseTypeSelect} />
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground capitalize">
                  {caseType} Law Case
                </h2>
                <p className="text-sm text-muted-foreground">
                  {messages.length} message{messages.length !== 1 ? "s" : ""}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                New Case
              </Button>
            </div>

            <Card className="flex-1 flex flex-col shadow-elegant">
              <ScrollArea className="flex-1 p-6" ref={scrollRef}>
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center text-muted-foreground">
                    <p>Start the conversation by describing your case...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <ChatMessage key={index} {...message} />
                    ))}
                  </div>
                )}
              </ScrollArea>

              <div className="border-t border-border p-4">
                <ChatInput
                  onSend={handleSendMessage}
                  disabled={isLoading}
                  placeholder="Describe the case facts, ask for legal provisions, or answer follow-up questions..."
                />
              </div>
            </Card>
          </>
        )}
      </main>

      <footer className="border-t border-border py-4">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          <p>
            LawBoard AI Assistant • Prototype for Indian Law Analysis
          </p>
          <p className="mt-1">
            This is an AI prototype. Always consult a qualified lawyer for legal advice.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
