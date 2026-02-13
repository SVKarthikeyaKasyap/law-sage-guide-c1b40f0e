import { useState } from "react";
import { cn } from "@/lib/utils";
import { Scale, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

export const ChatMessage = ({ role, content, timestamp }: ChatMessageProps) => {
  const isAssistant = role === "assistant";
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Strip markdown for cleaner speech
    const cleanText = content
      .replace(/[*_#`~>|\[\]()!]/g, "")
      .replace(/\n{2,}/g, ". ")
      .replace(/\n/g, " ")
      .slice(0, 3000);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <div
      className={cn(
        "flex gap-3 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-500",
        isAssistant ? "justify-start" : "justify-end"
      )}
    >
      {isAssistant && (
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-law-gold flex items-center justify-center">
          <Scale className="w-4 h-4 text-primary" />
        </div>
      )}
      
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 shadow-card transition-smooth relative group",
          isAssistant
            ? "bg-card border border-border"
            : "bg-primary text-primary-foreground"
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        {timestamp && (
          <span className="text-xs opacity-60 mt-1 block">
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
        {isAssistant && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSpeak}
            className="absolute -bottom-3 -right-3 h-7 w-7 rounded-full bg-muted border border-border opacity-0 group-hover:opacity-100 transition-opacity"
            title={isSpeaking ? "Stop speaking" : "Read aloud"}
          >
            {isSpeaking ? (
              <VolumeX className="h-3.5 w-3.5 text-destructive" />
            ) : (
              <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </Button>
        )}
      </div>

      {!isAssistant && (
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
          <span className="text-xs font-semibold text-secondary-foreground">U</span>
        </div>
      )}
    </div>
  );
};
