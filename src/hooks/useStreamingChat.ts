import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UseStreamingChatProps {
  conversationId?: string;
  caseType: string;
  country?: string;
  role?: 'user' | 'lawyer';
  deepSearch?: boolean;
  onMessagesUpdate: (messages: Message[]) => void;
}

export const useStreamingChat = ({
  conversationId,
  caseType,
  country = 'india',
  role = 'user',
  deepSearch = false,
  onMessagesUpdate
}: UseStreamingChatProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (
    content: string,
    currentMessages: Message[],
    fileContent?: { name: string; text: string; type: string }
  ) => {
    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: new Date(),
    };

    const updatedMessages = [...currentMessages, userMessage];
    onMessagesUpdate(updatedMessages);
    setIsLoading(true);

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
      
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({
            role: m.role,
            content: m.content
          })),
          conversationId,
          caseType,
          country,
          userRole: role,
          deepSearch,
          ...(fileContent ? { documentAttachment: { name: fileContent.name, text: fileContent.text, type: fileContent.type } } : {})
        }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${resp.status}`);
      }

      if (!resp.body) {
        throw new Error('No response body');
      }

      // Stream the response
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let assistantContent = '';
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            
            if (content) {
              assistantContent += content;
              
              // Update the last message in real-time
              const messagesWithAssistant = [
                ...updatedMessages,
                {
                  role: 'assistant' as const,
                  content: assistantContent,
                  timestamp: new Date()
                }
              ];
              onMessagesUpdate(messagesWithAssistant);
            }
          } catch (e) {
            // Incomplete JSON, put it back
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw || raw.startsWith(':') || !raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
            }
          } catch { /* ignore */ }
        }
      }

      // Ensure final state is set
      if (assistantContent) {
        const finalMessages = [
          ...updatedMessages,
          {
            role: 'assistant' as const,
            content: assistantContent,
            timestamp: new Date()
          }
        ];
        onMessagesUpdate(finalMessages);
      }

    } catch (error) {
      console.error('Streaming chat error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, caseType, country, role, deepSearch, onMessagesUpdate]);

  return { sendMessage, isLoading };
};