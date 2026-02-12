
-- Fix 1: Remove overly permissive write policies on legal_sections
DROP POLICY IF EXISTS "Anyone can insert legal sections" ON public.legal_sections;
DROP POLICY IF EXISTS "Anyone can update legal sections" ON public.legal_sections;

-- Add service-role-only write policies
CREATE POLICY "Service role can insert legal sections"
ON public.legal_sections FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Service role can update legal sections"
ON public.legal_sections FOR UPDATE
TO service_role
USING (true);

-- Fix 2: Add missing DELETE policy for conversations
CREATE POLICY "Users can delete their own conversations"
ON public.conversations FOR DELETE
USING (auth.uid() = user_id);
