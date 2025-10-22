-- Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  case_type TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  entities JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create feedback table
CREATE TABLE IF NOT EXISTS public.message_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating IN (-1, 1)),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create documents table
CREATE TABLE IF NOT EXISTS public.generated_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view their own conversations"
  ON public.conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON public.conversations FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their conversations"
  ON public.messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- RLS Policies for feedback
CREATE POLICY "Users can view feedback on their messages"
  ON public.message_feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.messages
      JOIN public.conversations ON conversations.id = messages.conversation_id
      WHERE messages.id = message_feedback.message_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create feedback on their messages"
  ON public.message_feedback FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.messages
      JOIN public.conversations ON conversations.id = messages.conversation_id
      WHERE messages.id = message_feedback.message_id
      AND conversations.user_id = auth.uid()
    )
  );

-- RLS Policies for documents
CREATE POLICY "Users can view their generated documents"
  ON public.generated_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = generated_documents.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create documents in their conversations"
  ON public.generated_documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = generated_documents.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_feedback_message_id ON public.message_feedback(message_id);
CREATE INDEX idx_documents_conversation_id ON public.generated_documents(conversation_id);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;