import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { CaseTypeSelector } from "@/components/CaseTypeSelector";
import { FeedbackButtons } from "@/components/FeedbackButtons";
import { DocumentGenerator } from "@/components/DocumentGenerator";
import { DataScraperPanel } from "@/components/DataScraperPanel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RotateCcw, FileText, Database } from "lucide-react";
import { toast } from "sonner";
import { useStreamingChat } from "@/hooks/useStreamingChat";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [caseType, setCaseType] = useState<string | null>(null);
  const [showDocGenerator, setShowDocGenerator] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { sendMessage, isLoading } = useStreamingChat({
    caseType: caseType || 'Criminal',
    onMessagesUpdate: setMessages
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleCaseTypeSelect = (type: string) => {
    setCaseType(type);
    const welcomeMessage: Message = {
      role: "assistant",
      content: `I'll help you with your ${type} case. I'm an AI assistant powered by advanced language models, trained on Indian law including the IPC, CrPC, and Constitution.\n\n**How I can help:**\n• Identify applicable legal provisions\n• Guide you through case facts gathering\n• Explain legal procedures step-by-step\n• Generate draft legal documents (FIR, notices, complaints)\n\n**Please describe the facts of your case, and I'll analyze it for you.**\n\n*Note: This is informational guidance only. Always consult a qualified lawyer for legal advice.*`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage(content, messages);
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
      console.error(error);
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
                  {messages.length} message{messages.length !== 1 ? "s" : ""} • Powered by AI
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

            <Tabs defaultValue="chat" className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="documents">
                  <FileText className="w-4 h-4 mr-2" />
                  Documents
                </TabsTrigger>
                <TabsTrigger value="scraper">
                  <Database className="w-4 h-4 mr-2" />
                  Data Scraper
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="flex-1 flex flex-col">
                <Card className="flex-1 flex flex-col shadow-elegant">
              <ScrollArea className="flex-1 p-6" ref={scrollRef}>
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center text-muted-foreground">
                    <p>Start the conversation by describing your case...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div key={index}>
                        <ChatMessage {...message} />
                        {message.role === 'assistant' && (
                          <FeedbackButtons
                            onFeedback={(rating) => {
                              toast.success(rating === 1 ? 'Thank you for the feedback!' : 'Thanks, we\'ll improve');
                            }}
                          />
                        )}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-3 mb-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-law-gold flex items-center justify-center">
                          <span className="text-xs font-semibold text-primary">AI</span>
                        </div>
                        <div className="bg-card border border-border rounded-2xl px-4 py-3">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
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
              </TabsContent>

              <TabsContent value="documents" className="flex-1">
                <DocumentGenerator
                  messages={messages}
                  caseType={caseType || 'Criminal'}
                />
              </TabsContent>

              <TabsContent value="scraper" className="flex-1">
                <DataScraperPanel />
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>

      <footer className="border-t border-border py-4">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          <p>
            LawBoard AI Assistant • Powered by Lovable AI & RAG Technology
          </p>
          <p className="mt-1">
            Features: Real-time Streaming • Named Entity Recognition • Legal Document Generation • Semantic Search
          </p>
          <p className="mt-1 font-semibold">
            ⚠️ This is informational guidance only. Always consult a qualified lawyer for legal advice.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
