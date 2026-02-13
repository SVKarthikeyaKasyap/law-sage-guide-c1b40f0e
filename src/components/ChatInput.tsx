import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Mic, MicOff, Paperclip, X, FileText } from "lucide-react";
import { toast } from "sonner";

interface ChatInputProps {
  onSend: (message: string, fileContent?: { name: string; text: string; type: string }) => void;
  disabled?: boolean;
  placeholder?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const SUPPORTED_TYPES = [
  'text/plain', 'text/csv', 'text/html', 'text/markdown',
  'application/pdf', 'application/json',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png', 'image/jpeg', 'image/webp',
];

export const ChatInput = ({ onSend, disabled, placeholder }: ChatInputProps) => {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; text: string; type: string } | null>(null);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const recognitionRef = useRef<any>(null);
  const baseTextRef = useRef("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let finalText = "";
      let interimText = "";
      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += transcript + " ";
        } else {
          interimText += transcript;
        }
      }
      const base = baseTextRef.current;
      const combined = (base ? base + " " : "") + finalText.trim() + (interimText ? " " + interimText : "");
      setInput(combined.trim());
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        toast.error("Microphone access denied. Please allow microphone permissions.");
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, []);

  const toggleListening = async () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        baseTextRef.current = input.trim();
        recognitionRef.current.start();
        setIsListening(true);
        toast.info("Listening... Speak now.");
      } catch {
        toast.error("Microphone access denied.");
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File too large. Maximum size is 5MB.");
      return;
    }

    setIsReadingFile(true);

    try {
      let text = "";

      if (file.type.startsWith("image/")) {
        // Convert image to base64 for AI vision analysis
        const reader = new FileReader();
        text = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        text = `[Image file: ${file.name}]\nBase64 data: ${text}`;
      } else {
        // Read as text
        text = await file.text();
      }

      if (!text.trim()) {
        toast.error("Could not read file content. The file may be empty or in a binary format.");
        return;
      }

      // Truncate very large files
      const MAX_CONTENT_LENGTH = 30000;
      if (text.length > MAX_CONTENT_LENGTH) {
        text = text.slice(0, MAX_CONTENT_LENGTH) + "\n\n... [Content truncated due to size limit]";
      }

      setAttachedFile({ name: file.name, text, type: file.type });
      toast.success(`Attached: ${file.name}`);
    } catch {
      toast.error("Failed to read the file. Try a different format.");
    } finally {
      setIsReadingFile(false);
      // Reset input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((input.trim() || attachedFile) && !disabled) {
      if (isListening) {
        recognitionRef.current?.stop();
        setIsListening(false);
      }
      const message = input.trim() || (attachedFile ? `Analyze this document: ${attachedFile.name}` : "");
      onSend(message, attachedFile || undefined);
      setInput("");
      setAttachedFile(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="space-y-2">
      {attachedFile && (
        <div className="flex items-center gap-2 bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm">
          <FileText className="h-4 w-4 text-primary flex-shrink-0" />
          <span className="truncate flex-1 text-foreground">{attachedFile.name}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-5 w-5 flex-shrink-0"
            onClick={() => setAttachedFile(null)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept=".txt,.csv,.json,.md,.html,.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.webp"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isReadingFile}
          className="h-[60px] w-[60px] flex-shrink-0"
          title="Attach a document"
        >
          {isReadingFile ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Paperclip className="h-5 w-5" />
          )}
        </Button>
        <Button
          type="button"
          variant={isListening ? "destructive" : "outline"}
          size="icon"
          onClick={toggleListening}
          disabled={disabled}
          className="h-[60px] w-[60px] flex-shrink-0"
          title={isListening ? "Stop listening" : "Voice input"}
        >
          {isListening ? (
            <MicOff className="h-5 w-5 animate-pulse" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
        </Button>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Type your message... (Shift+Enter for new line)"}
          disabled={disabled}
          className="min-h-[60px] max-h-[200px] resize-none"
          rows={2}
        />
        <Button
          type="submit"
          disabled={disabled || (!input.trim() && !attachedFile)}
          size="icon"
          className="h-[60px] w-[60px] flex-shrink-0"
        >
          {disabled ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </form>
    </div>
  );
};
