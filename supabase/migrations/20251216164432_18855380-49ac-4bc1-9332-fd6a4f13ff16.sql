-- Create function to update timestamps (if not exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create a table to store scraped legal sections
CREATE TABLE public.legal_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  category TEXT DEFAULT 'General',
  source TEXT DEFAULT 'scraped',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(section)
);

-- Enable Row Level Security
ALTER TABLE public.legal_sections ENABLE ROW LEVEL SECURITY;

-- Allow public read access (legal data is public information)
CREATE POLICY "Legal sections are publicly readable" 
ON public.legal_sections 
FOR SELECT 
USING (true);

-- Allow insert/update for all (edge functions will use this)
CREATE POLICY "Anyone can insert legal sections" 
ON public.legal_sections 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update legal sections" 
ON public.legal_sections 
FOR UPDATE 
USING (true);

-- Create indexes for faster searches
CREATE INDEX idx_legal_sections_keywords ON public.legal_sections USING GIN(keywords);
CREATE INDEX idx_legal_sections_category ON public.legal_sections(category);
CREATE INDEX idx_legal_sections_section ON public.legal_sections(section);

-- Create trigger for updated_at
CREATE TRIGGER update_legal_sections_updated_at
BEFORE UPDATE ON public.legal_sections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();