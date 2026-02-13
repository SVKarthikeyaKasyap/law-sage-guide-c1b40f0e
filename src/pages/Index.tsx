import { useState, useRef, useEffect, useMemo } from "react";
import { Header } from "@/components/Header";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { CaseTypeSelector } from "@/components/CaseTypeSelector";
import { UserCaseSelector } from "@/components/UserCaseSelector";
import { FeedbackButtons } from "@/components/FeedbackButtons";
import { DocumentWorkspace } from "@/components/DocumentWorkspace";
import { DataScraperPanel } from "@/components/DataScraperPanel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RotateCcw, FileText, Database } from "lucide-react";
import { toast } from "sonner";
import { useStreamingChat } from "@/hooks/useStreamingChat";
import { UserRole } from "@/components/RoleSwitcher";
import { Country, countries } from "@/components/CountrySelector";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const generateConversationId = () => {
  return `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [caseType, setCaseType] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>("user");
  const [country, setCountry] = useState<Country>("india");
  const [activeTab, setActiveTab] = useState("chat");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const conversationId = useMemo(() => generateConversationId(), [caseType]);

  const { sendMessage, isLoading } = useStreamingChat({
    conversationId,
    caseType: caseType || 'Criminal',
    country,
    role,
    onMessagesUpdate: setMessages
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleRoleChange = (newRole: UserRole) => {
    if (newRole !== role) {
      setRole(newRole);
      setCaseType(null);
      setMessages([]);
    }
  };

  const handleCountryChange = (newCountry: Country) => {
    if (newCountry !== country) {
      setCountry(newCountry);
      setCaseType(null);
      setMessages([]);
      const countryInfo = countries.find(c => c.id === newCountry);
      toast.success(`Switched to ${countryInfo?.name} laws`);
    }
  };

  const handleCaseTypeSelect = (type: string) => {
    setCaseType(type);
    
    let welcomeContent = "";
    
    if (role === "user") {
      if (type === "general-emergency") {
        welcomeContent = `🙏 I'm here for you. Take a deep breath - you're not alone in this.

**🚨 First, Your Safety:**
If you're in immediate danger:
1. **GET TO SAFETY NOW** - Move to a safe location if possible
2. If you can't leave safely, stay hidden and call emergency services
3. **Emergency Numbers:** Police: 100 | Women Helpline: 181 | Emergency: 112

---

I understand this must be frightening. Whether you've witnessed something traumatic or are in a difficult situation, I want you to know:

💚 **You matter, and your safety is the priority**

**As a witness, you are PROTECTED:**
• Section 195A IPC shields you from intimidation
• Witness Protection Scheme 2018 can hide your identity
• Courts can order police protection for you
• Threatening a witness is a serious crime

**Please share what happened when you're ready.** I'm here to:
• Guide you through your legal rights
• Help you understand what to expect
• Suggest safe next steps

*Take your time. I'm listening.* 💙`;
      } else if (type === "transport") {
        welcomeContent = `🌍 I understand being stuck in another country can feel overwhelming. Don't worry - we'll figure this out together.

**🛡️ First, Stay Calm:**
Many people face visa/immigration issues every day, and there are solutions.

---

**Common Situations I Can Help With:**
• ✈️ Visa expired while abroad
• 📄 Lost or stolen passport
• 🚫 Detained at immigration
• 🆘 Need emergency travel documents

**Immediate Steps to Feel Secure:**
1. 📍 **Stay where it's safe** - a hotel, friend's place, or public area
2. 📞 **Note your embassy number** - they're there to help citizens abroad
3. 💼 **Keep copies of all documents** safe (even photos on phone help)
4. 🤝 **Don't panic** - overstaying is usually handled with a fine, not jail

**Please tell me:**
• Which country are you in?
• What happened with your visa/documents?
• What do you have with you now?

*I'm here to guide you step by step. You're going to be okay.* 💪`;
      }
    } else {
      welcomeContent = `**${type.charAt(0).toUpperCase() + type.slice(1)} Law Case Analysis**

I'll assist with precise legal analysis for this case.

**Available Functions:**
• Identify applicable legal provisions with section citations
• Extract and organize case facts systematically
• Analyze procedural requirements
• Generate draft legal documents (FIR, notices, complaints)

**Please provide the case facts.** I will:
1. Identify relevant sections and precedents
2. Ask targeted questions to complete the legal picture
3. Provide structured analysis suitable for professional use

*This is for informational purposes. Verify all citations independently.*`;
    }
    
    const welcomeMessage: Message = {
      role: "assistant",
      content: welcomeContent,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  const handleSendMessage = async (content: string, fileContent?: { name: string; text: string; type: string }) => {
    try {
      await sendMessage(content, messages, fileContent);
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
      console.error(error);
    }
  };

  const handleReset = () => {
    setCaseType(null);
    setMessages([]);
    setActiveTab("chat");
    toast.success("Conversation reset. Select a new case type to start.");
  };

  const handleMissingDetails = (details: string[]) => {
    const detailsList = details.map((d, i) => `${i + 1}. ${d}`).join('\n');
    const assistantMessage: Message = {
      role: "assistant",
      content: `📝 **The document has been updated, but some details are still missing and need your input:**\n\n${detailsList}\n\nPlease provide these details so I can complete the document for you.`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, assistantMessage]);
    setActiveTab("chat");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header 
        role={role} 
        onRoleChange={handleRoleChange} 
        country={country} 
        onCountryChange={handleCountryChange} 
      />

      <main className="flex-1 container mx-auto px-4 py-6 flex flex-col max-w-5xl">
        {!caseType ? (
          <div className="flex-1 flex items-center justify-center">
            {role === "user" ? (
              <UserCaseSelector onSelect={handleCaseTypeSelect} />
            ) : (
              <CaseTypeSelector onSelect={handleCaseTypeSelect} />
            )}
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

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
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
                <DocumentWorkspace
                  conversationId={conversationId}
                  messages={messages}
                  caseType={caseType || 'Criminal'}
                  country={country}
                  onMissingDetails={handleMissingDetails}
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
