import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const body = await req.json();

    // Input validation
    const VALID_ACTIONS = ['generate', 'scan', 'edit'];
    const VALID_COUNTRIES = ['india', 'usa', 'russia', 'china', 'japan', 'uk'];
    const MAX_DOC_LENGTH = 50000;
    const MAX_CONTEXT_MESSAGES = 50;

    const action = body.action;
    if (!action || !VALID_ACTIONS.includes(action)) {
      return new Response(JSON.stringify({ error: 'Invalid action: must be generate, scan, or edit' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const documentText = typeof body.documentText === 'string' ? body.documentText.slice(0, MAX_DOC_LENGTH) : '';
    const documentType = typeof body.documentType === 'string' ? body.documentType.slice(0, 100) : 'legal';
    const caseType = typeof body.caseType === 'string' ? body.caseType.slice(0, 100) : 'Criminal';
    const country = VALID_COUNTRIES.includes(body.country) ? body.country : 'india';
    const chatContext = Array.isArray(body.chatContext) ? body.chatContext.slice(0, MAX_CONTEXT_MESSAGES) : [];

    if (!documentText && action !== 'generate') {
      return new Response(JSON.stringify({ error: 'Document text is required for scan/edit actions' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let systemPrompt = '';
    let userPrompt = '';

    if (action === 'generate') {
      // Generate a document from chat context
      systemPrompt = `You are an expert legal document drafter specializing in ${country.toUpperCase()} law. 
Generate a professional, legally accurate draft document based on the provided case context.

RULES:
- Use proper legal formatting with headers, sections, and appropriate legal language
- Include all necessary legal references and section citations
- Use placeholder brackets [PLACEHOLDER] for information that needs to be filled in
- Make it as complete as possible based on the available context
- Follow the standard format for the document type in ${country.toUpperCase()}`;

      const contextSummary = (chatContext || [])
        .filter((m: any) => m.role === 'user')
        .map((m: any) => m.content)
        .join('\n');

      userPrompt = `Generate a ${documentType} draft based on these case facts:\n\n${contextSummary}\n\nCase Type: ${caseType}\nCountry: ${country}`;
    
    } else if (action === 'scan') {
      // Scan/check document for correctness
      systemPrompt = `You are an expert legal document reviewer specializing in ${country.toUpperCase()} law.
Analyze the provided legal document thoroughly for:

1. **Legal Accuracy** - Are the cited laws, sections, and provisions correct and current?
2. **Formatting** - Does it follow the proper legal format for this type of document?
3. **Completeness** - Are all required sections and information present?
4. **Language** - Is the legal language appropriate and precise?
5. **Authenticity Indicators** - Are there signs the document may be fraudulent or improperly prepared?

RESPONSE FORMAT (you MUST use this exact JSON structure):
{
  "overallScore": <number 1-100>,
  "verdict": "<VALID|NEEDS_CHANGES|INVALID>",
  "summary": "<brief overall assessment>",
  "issues": [
    {
      "severity": "<critical|warning|info>",
      "location": "<text snippet where issue is found>",
      "issue": "<description of the problem>",
      "suggestion": "<how to fix it>"
    }
  ],
  "strengths": ["<list of things done correctly>"],
  "missingElements": ["<list of required elements that are missing>"]
}

Be thorough but fair. Identify SPECIFIC text portions that need changes.`;

      userPrompt = `Analyze this ${documentType || 'legal'} document for correctness and legal validity:\n\n${documentText}`;
    
    } else if (action === 'edit') {
      // Edit document with AI to fix issues
      systemPrompt = `You are an expert legal document editor specializing in ${country.toUpperCase()} law.
You will receive a legal document that has issues. Fix ALL the issues while:

1. Preserving the original intent and facts
2. Correcting legal citations and section references
3. Improving legal language and formatting
4. Adding any missing required sections
5. Ensuring compliance with ${country.toUpperCase()} legal standards

After editing, check if there are any placeholders like [PLACEHOLDER], [NAME], [DATE], [ADDRESS], or any other missing information that requires user input.

Return a JSON response in this EXACT format:
{
  "document": "<the full corrected document text>",
  "missingDetails": ["<list of specific details still needed from the user, e.g. 'Full name of the complainant', 'Date of incident', 'Address of the police station'>"]
}

If no details are missing, return an empty array for missingDetails.
Return ONLY valid JSON, no markdown code blocks or extra text.`;

      userPrompt = `Fix and improve this ${documentType || 'legal'} document:\n\n${documentText}`;
    } else {
      throw new Error(`Unknown action: ${action}`);
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: action === 'scan' ? 0.3 : 0.5,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    if (action === 'scan') {
      // Parse the JSON response for scan results
      try {
        // Extract JSON from the response (might be wrapped in markdown code block)
        let jsonStr = content;
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
          jsonStr = jsonMatch[1].trim();
        }
        const scanResult = JSON.parse(jsonStr);
        return new Response(JSON.stringify({ success: true, result: scanResult }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (parseError) {
        // If JSON parsing fails, return raw text with a basic structure
        return new Response(JSON.stringify({ 
          success: true, 
          result: {
            overallScore: 50,
            verdict: 'NEEDS_CHANGES',
            summary: content,
            issues: [],
            strengths: [],
            missingElements: []
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // For edit action, try to parse structured JSON response
    if (action === 'edit') {
      try {
        let jsonStr = content;
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
          jsonStr = jsonMatch[1].trim();
        }
        const parsed = JSON.parse(jsonStr);
        return new Response(JSON.stringify({ 
          success: true, 
          content: parsed.document || content,
          missingDetails: Array.isArray(parsed.missingDetails) ? parsed.missingDetails : []
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch {
        // Fallback: return raw content if JSON parsing fails
        return new Response(JSON.stringify({ success: true, content, missingDetails: [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({ success: true, content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Analyze document error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
