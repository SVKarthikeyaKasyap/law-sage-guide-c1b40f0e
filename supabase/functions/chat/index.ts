import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Local legal corpus - IPC sections (fallback/default data)
const LEGAL_CORPUS = [
  {
    section: "IPC Section 302",
    title: "Murder",
    content: "Whoever commits murder shall be punished with death or imprisonment for life, and shall also be liable to fine.",
    keywords: ["murder", "death", "life imprisonment", "killing", "homicide"],
    category: "Criminal"
  },
  {
    section: "IPC Section 304",
    title: "Culpable Homicide Not Amounting to Murder",
    content: "Whoever commits culpable homicide not amounting to murder shall be punished with imprisonment for life, or imprisonment for a term which may extend to ten years, and shall also be liable to fine.",
    keywords: ["culpable homicide", "manslaughter", "killing", "not murder"],
    category: "Criminal"
  },
  {
    section: "IPC Section 323",
    title: "Punishment for Voluntarily Causing Hurt",
    content: "Whoever voluntarily causes hurt shall be punished with imprisonment of either description for a term which may extend to one year, or with fine which may extend to one thousand rupees, or with both.",
    keywords: ["hurt", "assault", "injury", "violence", "beating"],
    category: "Criminal"
  },
  {
    section: "IPC Section 324",
    title: "Voluntarily Causing Hurt by Dangerous Weapons",
    content: "Whoever voluntarily causes hurt by means of any instrument for shooting, stabbing or cutting, or any instrument which, used as weapon, is likely to cause death, shall be punished with imprisonment of either description for a term which may extend to three years, or with fine, or with both.",
    keywords: ["weapon", "dangerous weapon", "stabbing", "shooting", "hurt", "knife", "gun"],
    category: "Criminal"
  },
  {
    section: "IPC Section 354",
    title: "Assault or Criminal Force to Woman with Intent to Outrage her Modesty",
    content: "Whoever assaults or uses criminal force to any woman, intending to outrage or knowing it to be likely that he will thereby outrage her modesty, shall be punished with imprisonment of either description for a term which shall not be less than one year but which may extend to five years, and shall also be liable to fine.",
    keywords: ["modesty", "woman", "assault", "outrage", "harassment", "molestation"],
    category: "Criminal"
  },
  {
    section: "IPC Section 376",
    title: "Punishment for Rape",
    content: "Whoever commits rape shall be punished with rigorous imprisonment for a term which shall not be less than ten years, but which may extend to imprisonment for life, and shall also be liable to fine.",
    keywords: ["rape", "sexual assault", "sexual violence", "woman", "consent"],
    category: "Criminal"
  },
  {
    section: "IPC Section 379",
    title: "Punishment for Theft",
    content: "Whoever commits theft shall be punished with imprisonment of either description for a term which may extend to three years, or with fine, or with both.",
    keywords: ["theft", "stealing", "property", "dishonest", "movable property"],
    category: "Criminal"
  },
  {
    section: "IPC Section 420",
    title: "Cheating and Dishonestly Inducing Delivery of Property",
    content: "Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person, or to make, alter or destroy the whole or any part of a valuable security, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.",
    keywords: ["cheating", "fraud", "dishonest", "deception", "property", "scam"],
    category: "Criminal"
  },
  {
    section: "IPC Section 498A",
    title: "Cruelty by Husband or Relatives of Husband",
    content: "Whoever, being the husband or the relative of the husband of a woman, subjects such woman to cruelty shall be punished with imprisonment for a term which may extend to three years and shall also be liable to fine.",
    keywords: ["dowry", "cruelty", "husband", "domestic violence", "harassment", "torture"],
    category: "Criminal"
  },
  {
    section: "CrPC Section 154",
    title: "Information in Cognizable Cases",
    content: "Every information relating to the commission of a cognizable offence, if given orally to an officer in charge of a police station, shall be reduced to writing by him or under his direction, and be read over to the informant.",
    keywords: ["FIR", "police", "complaint", "cognizable", "information", "report"],
    category: "Criminal Procedure"
  },
  {
    section: "CrPC Section 156",
    title: "Power of Police Officer to Investigate Cognizable Case",
    content: "Any officer in charge of a police station may, without the order of a Magistrate, investigate any cognizable case which a Court having jurisdiction over the local area within the limits of such station would have power to inquire into or try.",
    keywords: ["investigation", "police", "cognizable", "power", "inquiry"],
    category: "Criminal Procedure"
  },
  {
    section: "CrPC Section 41",
    title: "When Police May Arrest Without Warrant",
    content: "Any police officer may without an order from a Magistrate and without a warrant, arrest any person who commits a cognizable offence in his presence, or against whom a reasonable complaint has been made.",
    keywords: ["arrest", "warrant", "police", "cognizable", "detention"],
    category: "Criminal Procedure"
  }
];

interface LegalSection {
  section: string;
  title: string;
  content: string;
  keywords: string[];
  category: string;
  source?: string;
}

// Simple keyword-based retrieval function for local corpus
function retrieveFromLocalCorpus(query: string, caseType: string, topK: number = 3): LegalSection[] {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 3);
  
  const scored = LEGAL_CORPUS.map(section => {
    let score = 0;
    
    if (section.category.toLowerCase().includes(caseType.toLowerCase())) {
      score += 5;
    }
    
    section.keywords.forEach(keyword => {
      if (queryLower.includes(keyword.toLowerCase())) {
        score += 3;
      }
    });
    
    queryWords.forEach(word => {
      if (section.content.toLowerCase().includes(word)) {
        score += 1;
      }
      if (section.title.toLowerCase().includes(word)) {
        score += 2;
      }
    });
    
    return { ...section, score, source: 'local' };
  });
  
  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

// Search Supabase database for legal sections
async function searchSupabaseDatabase(supabase: any, query: string, caseType: string, topK: number = 5): Promise<LegalSection[]> {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 3);
  
  try {
    // Search by keywords and content
    const { data, error } = await supabase
      .from('legal_sections')
      .select('*')
      .or(queryWords.map(w => `content.ilike.%${w}%`).join(','))
      .limit(topK * 2);
    
    if (error) {
      console.error('Supabase search error:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Score and sort results
    const scored = data.map((section: any) => {
      let score = 0;
      
      if (section.category?.toLowerCase().includes(caseType.toLowerCase())) {
        score += 5;
      }
      
      (section.keywords || []).forEach((keyword: string) => {
        if (queryLower.includes(keyword.toLowerCase())) {
          score += 3;
        }
      });
      
      queryWords.forEach(word => {
        if (section.content?.toLowerCase().includes(word)) {
          score += 1;
        }
        if (section.title?.toLowerCase().includes(word)) {
          score += 2;
        }
      });
      
      return { ...section, score, source: 'database' };
    });
    
    return scored
      .filter((s: any) => s.score > 0)
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, topK);
  } catch (error) {
    console.error('Database search error:', error);
    return [];
  }
}

// Scrape legal content from web and store in database
async function scrapeAndStoreLegalContent(supabase: any, query: string): Promise<LegalSection[]> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials for scraping');
    return [];
  }
  
  try {
    console.log('Initiating web scraping for query:', query);
    
    // Call the scrape-legal-content function
    const scrapeResponse = await fetch(`${supabaseUrl}/functions/v1/scrape-legal-content`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    
    if (!scrapeResponse.ok) {
      console.error('Scrape function error:', scrapeResponse.status);
      return [];
    }
    
    const scrapeResult = await scrapeResponse.json();
    
    if (!scrapeResult.success || !scrapeResult.sections || scrapeResult.sections.length === 0) {
      console.log('No sections scraped from web');
      return [];
    }
    
    console.log(`Scraped ${scrapeResult.sections.length} sections from web`);
    
    // Store scraped sections in database
    const sectionsToStore = scrapeResult.sections.map((s: any) => ({
      section: s.section,
      title: s.title || 'Untitled',
      content: s.content,
      keywords: s.keywords || [],
      category: s.category || 'General',
      source: 'web_scraped'
    }));
    
    // Upsert to avoid duplicates
    for (const section of sectionsToStore) {
      const { error } = await supabase
        .from('legal_sections')
        .upsert(section, { onConflict: 'section' });
      
      if (error) {
        console.error('Error storing scraped section:', error);
      }
    }
    
    console.log('Stored scraped sections in database');
    
    return sectionsToStore.map((s: any) => ({ ...s, source: 'web_scraped' }));
  } catch (error) {
    console.error('Scraping error:', error);
    return [];
  }
}

// Main cascading search function
async function cascadingLegalSearch(
  supabase: any,
  query: string,
  caseType: string,
  minResults: number = 3
): Promise<{ sections: LegalSection[], sources: string[] }> {
  const sources: string[] = [];
  let allSections: LegalSection[] = [];
  
  // Step 1: Search local corpus
  console.log('Step 1: Searching local corpus...');
  const localResults = retrieveFromLocalCorpus(query, caseType, 5);
  if (localResults.length > 0) {
    sources.push('local_corpus');
    allSections = [...allSections, ...localResults];
    console.log(`Found ${localResults.length} results in local corpus`);
  }
  
  // Step 2: Search Supabase database
  if (allSections.length < minResults) {
    console.log('Step 2: Searching database...');
    const dbResults = await searchSupabaseDatabase(supabase, query, caseType, 5);
    if (dbResults.length > 0) {
      sources.push('database');
      // Add only unique sections (by section name)
      const existingSections = new Set(allSections.map(s => s.section));
      const uniqueDbResults = dbResults.filter(s => !existingSections.has(s.section));
      allSections = [...allSections, ...uniqueDbResults];
      console.log(`Found ${dbResults.length} results in database (${uniqueDbResults.length} unique)`);
    }
  }
  
  // Step 3: Scrape from web if still not enough results
  if (allSections.length < minResults) {
    console.log('Step 3: Scraping from web...');
    const scrapedResults = await scrapeAndStoreLegalContent(supabase, query);
    if (scrapedResults.length > 0) {
      sources.push('web_scraping');
      const existingSections = new Set(allSections.map(s => s.section));
      const uniqueScrapedResults = scrapedResults.filter(s => !existingSections.has(s.section));
      allSections = [...allSections, ...uniqueScrapedResults];
      console.log(`Scraped ${scrapedResults.length} results from web (${uniqueScrapedResults.length} unique)`);
    }
  }
  
  // Sort all results by relevance and limit
  return {
    sections: allSections.slice(0, 8),
    sources
  };
}

// NER tool definition for extracting case entities
const NER_TOOL = {
  type: "function",
  function: {
    name: "extract_case_entities",
    description: "Extract key legal entities and facts from the case description",
    parameters: {
      type: "object",
      properties: {
        victim: { type: "string", description: "Name of the victim (if mentioned)" },
        accused: { type: "string", description: "Name of the accused (if mentioned)" },
        date: { type: "string", description: "Date of incident (if mentioned)" },
        location: { type: "string", description: "Location of incident (if mentioned)" },
        weapon: { type: "string", description: "Weapon or method used (if mentioned)" },
        witnesses: { type: "array", items: { type: "string" }, description: "Names of witnesses (if mentioned)" },
        injuries: { type: "string", description: "Type of injuries sustained (if mentioned)" },
        key_facts: { type: "array", items: { type: "string" }, description: "Key facts of the case" }
      }
    }
  }
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase credentials not configured');
    }

    // Create Supabase client with service role for database operations
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { messages, conversationId, caseType } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      throw new Error('Messages array is required');
    }

    // Get the last user message for retrieval
    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop();
    const userQuery = lastUserMessage?.content || '';

    // Perform cascading search
    console.log('Starting cascading legal search for:', userQuery);
    const { sections: relevantSections, sources } = await cascadingLegalSearch(
      supabase,
      userQuery,
      caseType || 'Criminal',
      3
    );
    
    console.log(`Found ${relevantSections.length} relevant sections from sources: ${sources.join(', ')}`);
    
    // Build context from retrieved sections
    const legalContext = relevantSections.length > 0
      ? relevantSections
          .map(s => `**${s.section}: ${s.title}** [Source: ${s.source}]\n${s.content}`)
          .join('\n\n')
      : 'No specific legal provisions found. Please provide more details about your case.';

    // Note about data sources
    const sourcesNote = sources.length > 0
      ? `\n\n*Data retrieved from: ${sources.map(s => s.replace('_', ' ')).join(', ')}*`
      : '';

    // System prompt with legal expertise
    const systemPrompt = `You are an expert Indian legal assistant specializing in IPC (Indian Penal Code), CrPC (Code of Criminal Procedure), and Constitutional law.

**Your Responsibilities:**
1. Analyze case facts and identify applicable legal provisions
2. Cite specific section numbers (e.g., IPC Section 302, CrPC Section 154)
3. Ask clarifying questions ONE AT A TIME to gather complete case information
4. Explain legal provisions in simple, clear language
5. Guide users through the legal process step-by-step
6. Extract key entities (victim, accused, dates, locations, weapons, witnesses)

**Important Guidelines:**
- Always cite specific section numbers when referencing laws
- Ask focused, relevant questions to understand the case better
- Never provide definitive legal advice - always recommend consulting a qualified lawyer
- Be empathetic and professional
- Keep responses clear and concise
- If relevant laws were scraped from web sources, mention that for transparency

**Relevant Legal Provisions for this Case:**
${legalContext}${sourcesNote}

**Case Type:** ${caseType || 'Not specified'}

Remember: This is informational guidance only. Always advise users to consult with a qualified lawyer for legal advice.`;

    // Prepare request body with NER tool
    const requestBody: any = {
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 2000
    };

    // Add NER tool for first few messages to extract entities
    if (messages.length <= 6) {
      requestBody.tools = [NER_TOOL];
      requestBody.tool_choice = "auto";
    }

    console.log('Sending request to Lovable AI with context:', {
      messageCount: messages.length,
      relevantSectionsCount: relevantSections.length,
      sources,
      caseType
    });

    // Call Lovable AI
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    // Stream the response back to client
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Chat error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
