import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Multi-country legal corpus
const LEGAL_CORPUS: Record<string, LegalSection[]> = {
  india: [
    { section: "IPC Section 302", title: "Murder", content: "Whoever commits murder shall be punished with death or imprisonment for life, and shall also be liable to fine.", keywords: ["murder", "death", "life imprisonment", "killing", "homicide"], category: "Criminal" },
    { section: "IPC Section 304", title: "Culpable Homicide Not Amounting to Murder", content: "Whoever commits culpable homicide not amounting to murder shall be punished with imprisonment for life, or imprisonment for a term which may extend to ten years, and shall also be liable to fine.", keywords: ["culpable homicide", "manslaughter", "killing", "not murder"], category: "Criminal" },
    { section: "IPC Section 323", title: "Punishment for Voluntarily Causing Hurt", content: "Whoever voluntarily causes hurt shall be punished with imprisonment of either description for a term which may extend to one year, or with fine which may extend to one thousand rupees, or with both.", keywords: ["hurt", "assault", "injury", "violence", "beating"], category: "Criminal" },
    { section: "IPC Section 324", title: "Voluntarily Causing Hurt by Dangerous Weapons", content: "Whoever voluntarily causes hurt by means of any instrument for shooting, stabbing or cutting, or any instrument which, used as weapon, is likely to cause death, shall be punished with imprisonment of either description for a term which may extend to three years, or with fine, or with both.", keywords: ["weapon", "dangerous weapon", "stabbing", "shooting", "hurt", "knife", "gun"], category: "Criminal" },
    { section: "IPC Section 354", title: "Assault or Criminal Force to Woman", content: "Whoever assaults or uses criminal force to any woman, intending to outrage or knowing it to be likely that he will thereby outrage her modesty, shall be punished with imprisonment of either description for a term which shall not be less than one year but which may extend to five years, and shall also be liable to fine.", keywords: ["modesty", "woman", "assault", "outrage", "harassment", "molestation"], category: "Criminal" },
    { section: "IPC Section 376", title: "Punishment for Rape", content: "Whoever commits rape shall be punished with rigorous imprisonment for a term which shall not be less than ten years, but which may extend to imprisonment for life, and shall also be liable to fine.", keywords: ["rape", "sexual assault", "sexual violence", "woman", "consent"], category: "Criminal" },
    { section: "IPC Section 379", title: "Punishment for Theft", content: "Whoever commits theft shall be punished with imprisonment of either description for a term which may extend to three years, or with fine, or with both.", keywords: ["theft", "stealing", "property", "dishonest", "movable property"], category: "Criminal" },
    { section: "IPC Section 420", title: "Cheating and Dishonestly Inducing Delivery of Property", content: "Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person, or to make, alter or destroy the whole or any part of a valuable security, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.", keywords: ["cheating", "fraud", "dishonest", "deception", "property", "scam"], category: "Criminal" },
    { section: "IPC Section 498A", title: "Cruelty by Husband or Relatives of Husband", content: "Whoever, being the husband or the relative of the husband of a woman, subjects such woman to cruelty shall be punished with imprisonment for a term which may extend to three years and shall also be liable to fine.", keywords: ["dowry", "cruelty", "husband", "domestic violence", "harassment", "torture"], category: "Criminal" },
    { section: "IPC Section 195A", title: "Witness Protection", content: "Whoever threatens or induces any person to give false evidence or withhold true evidence shall be punished. Witnesses are protected under the Witness Protection Scheme 2018.", keywords: ["witness", "protection", "testimony", "threat", "evidence"], category: "Criminal" },
    { section: "CrPC Section 154", title: "Information in Cognizable Cases (FIR)", content: "Every information relating to the commission of a cognizable offence, if given orally to an officer in charge of a police station, shall be reduced to writing by him or under his direction, and be read over to the informant.", keywords: ["FIR", "police", "complaint", "cognizable", "information", "report"], category: "Criminal Procedure" },
    { section: "CrPC Section 156", title: "Power of Police Officer to Investigate", content: "Any officer in charge of a police station may, without the order of a Magistrate, investigate any cognizable case which a Court having jurisdiction over the local area within the limits of such station would have power to inquire into or try.", keywords: ["investigation", "police", "cognizable", "power", "inquiry"], category: "Criminal Procedure" },
    { section: "CrPC Section 41", title: "When Police May Arrest Without Warrant", content: "Any police officer may without an order from a Magistrate and without a warrant, arrest any person who commits a cognizable offence in his presence, or against whom a reasonable complaint has been made.", keywords: ["arrest", "warrant", "police", "cognizable", "detention"], category: "Criminal Procedure" },
    { section: "Foreigners Act Section 14", title: "Penalty for Overstaying Visa", content: "Any foreigner who remains in India beyond the period for which the visa was granted, or fails to comply with the conditions of the visa, shall be punishable with imprisonment up to five years and fine.", keywords: ["visa", "overstay", "foreigner", "immigration", "passport", "expired"], category: "Immigration" },
    { section: "Passport Act Section 12", title: "Offences and Penalties", content: "Whoever makes false representation to obtain passport, or uses passport issued to another person shall be punished with imprisonment up to two years or fine or both.", keywords: ["passport", "false", "fraud", "travel", "document"], category: "Immigration" },
  ],
  usa: [
    { section: "18 U.S.C. § 1111", title: "Murder", content: "Murder is the unlawful killing of a human being with malice aforethought. First degree murder is punishable by death or life imprisonment.", keywords: ["murder", "homicide", "killing", "death penalty"], category: "Criminal" },
    { section: "18 U.S.C. § 113", title: "Assault", content: "Assault with intent to commit murder or serious bodily injury is punishable by imprisonment of up to 20 years.", keywords: ["assault", "battery", "injury", "violence"], category: "Criminal" },
    { section: "18 U.S.C. § 2241", title: "Sexual Abuse", content: "Whoever knowingly causes another person to engage in a sexual act by using force shall be fined and imprisoned for any term of years or for life.", keywords: ["sexual", "abuse", "rape", "assault"], category: "Criminal" },
    { section: "18 U.S.C. § 2111", title: "Robbery", content: "Whoever by force and violence takes from the person of another anything of value shall be imprisoned not more than fifteen years.", keywords: ["robbery", "theft", "force", "violence"], category: "Criminal" },
    { section: "8 U.S.C. § 1227", title: "Deportable Aliens", content: "Any alien who has violated immigration law is deportable.", keywords: ["deportation", "visa", "immigration"], category: "Immigration" },
    { section: "Miranda v. Arizona", title: "Right to Remain Silent", content: "Before custodial interrogation, police must inform suspects of their right to remain silent and right to an attorney.", keywords: ["miranda", "rights", "silence", "attorney"], category: "Constitutional" },
  ],
  russia: [
    { section: "Article 105 Criminal Code RF", title: "Murder", content: "Murder shall be punishable by deprivation of liberty for a term of six to fifteen years.", keywords: ["murder", "death", "killing"], category: "Criminal" },
    { section: "Article 158 Criminal Code RF", title: "Theft", content: "Theft shall be punishable by a fine, or by deprivation of liberty for up to two years.", keywords: ["theft", "stealing", "property"], category: "Criminal" },
    { section: "Federal Law No. 115-FZ", title: "Legal Status of Foreign Citizens", content: "Foreign citizens must have valid visa and migration card. Overstaying results in fines and possible deportation.", keywords: ["visa", "foreigner", "migration", "deportation"], category: "Immigration" },
  ],
  china: [
    { section: "Article 232 Criminal Law PRC", title: "Intentional Homicide", content: "Whoever intentionally kills another person shall be sentenced to death, life imprisonment or fixed-term imprisonment of not less than 10 years.", keywords: ["murder", "homicide", "killing", "death"], category: "Criminal" },
    { section: "Article 264 Criminal Law PRC", title: "Theft", content: "Whoever steals a relatively large amount of property shall be sentenced to fixed-term imprisonment of not more than 3 years.", keywords: ["theft", "stealing", "property"], category: "Criminal" },
    { section: "Exit-Entry Administration Law Art. 78", title: "Illegal Stay", content: "Foreigners who illegally stay in China shall be given a warning and may be fined or detained.", keywords: ["visa", "overstay", "foreigner"], category: "Immigration" },
  ],
  japan: [
    { section: "Penal Code Article 199", title: "Homicide", content: "A person who kills another shall be punished by the death penalty or imprisonment with work for life or for not less than 5 years.", keywords: ["murder", "homicide", "killing"], category: "Criminal" },
    { section: "Penal Code Article 235", title: "Theft", content: "A person who steals the property of another shall be punished by imprisonment for not more than 10 years.", keywords: ["theft", "stealing", "property"], category: "Criminal" },
    { section: "Immigration Control Act Art. 70", title: "Illegal Stay", content: "A foreign national who stays beyond their period of stay shall be punished by imprisonment for not more than 3 years.", keywords: ["visa", "overstay", "illegal"], category: "Immigration" },
  ],
  uk: [
    { section: "Murder (Common Law)", title: "Murder", content: "Murder is the unlawful killing of a human being with malice aforethought. The mandatory sentence is life imprisonment.", keywords: ["murder", "homicide", "killing"], category: "Criminal" },
    { section: "Theft Act 1968 s.1", title: "Theft", content: "A person is guilty of theft if he dishonestly appropriates property belonging to another. Maximum 7 years imprisonment.", keywords: ["theft", "stealing", "property"], category: "Criminal" },
    { section: "Immigration Act 1971 s.24", title: "Illegal Entry and Overstaying", content: "A person who knowingly enters the UK without leave, or overstays, is guilty of an offence. Up to 6 months imprisonment.", keywords: ["visa", "overstay", "immigration"], category: "Immigration" },
    { section: "Police and Criminal Evidence Act 1984", title: "Rights on Arrest", content: "Upon arrest, you have the right to remain silent, to have someone informed, and to consult a solicitor privately.", keywords: ["arrest", "rights", "solicitor", "police"], category: "Criminal Procedure" },
  ]
};

interface LegalSection {
  section: string;
  title: string;
  content: string;
  keywords: string[];
  category: string;
  source?: string;
}

const COUNTRY_INFO: Record<string, { name: string; lawSystem: string }> = {
  india: { name: "India", lawSystem: "Indian Penal Code (IPC), CrPC, and Constitution" },
  usa: { name: "United States", lawSystem: "US Code, State Laws, and Constitutional Rights" },
  russia: { name: "Russia", lawSystem: "Criminal Code of the Russian Federation" },
  china: { name: "China", lawSystem: "Criminal Law of the People's Republic of China" },
  japan: { name: "Japan", lawSystem: "Japanese Penal Code and Immigration Control Act" },
  uk: { name: "United Kingdom", lawSystem: "Common Law, Statutory Law, and Human Rights Act" }
};

function retrieveFromLocalCorpus(query: string, caseType: string, country: string, topK: number = 5): LegalSection[] {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 3);
  const countryCorpus = LEGAL_CORPUS[country] || LEGAL_CORPUS['india'];
  
  const scored = countryCorpus.map(section => {
    let score = 0;
    if (section.category.toLowerCase().includes(caseType.toLowerCase())) score += 5;
    section.keywords.forEach(keyword => {
      if (queryLower.includes(keyword.toLowerCase())) score += 3;
    });
    queryWords.forEach(word => {
      if (section.content.toLowerCase().includes(word)) score += 1;
      if (section.title.toLowerCase().includes(word)) score += 2;
    });
    return { ...section, score, source: 'local' };
  });
  
  return scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score).slice(0, topK);
}

async function searchSupabaseDatabase(supabase: any, query: string, caseType: string, country: string, topK: number = 5): Promise<LegalSection[]> {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 3);
  if (queryWords.length === 0) return [];
  
  try {
    let query_builder = supabase
      .from('legal_sections')
      .select('*')
      .eq('country', country);
    
    if (queryWords.length > 0) {
      query_builder = query_builder.or(queryWords.map(w => `content.ilike.%${w}%`).join(','));
    }
    
    const { data, error } = await query_builder.limit(topK * 2);
    if (error) { console.error('Supabase search error:', error); return []; }
    if (!data || data.length === 0) return [];
    
    const scored = data.map((section: any) => {
      let score = 0;
      if (section.category?.toLowerCase().includes(caseType.toLowerCase())) score += 5;
      (section.keywords || []).forEach((keyword: string) => {
        if (queryLower.includes(keyword.toLowerCase())) score += 3;
      });
      queryWords.forEach(word => {
        if (section.content?.toLowerCase().includes(word)) score += 1;
        if (section.title?.toLowerCase().includes(word)) score += 2;
      });
      return { ...section, score, source: 'database' };
    });
    
    return scored.filter((s: any) => s.score > 0).sort((a: any, b: any) => b.score - a.score).slice(0, topK);
  } catch (error) {
    console.error('Database search error:', error);
    return [];
  }
}

// Indian Kanoon API search (official Indian legal portal)
async function searchIndianKanoon(query: string, topK: number = 5): Promise<LegalSection[]> {
  try {
    console.log('Step 3: Searching Indian Kanoon for:', query);
    
    // Use Indian Kanoon's search page and parse results
    const searchUrl = `https://api.indiankanoon.org/search/?formInput=${encodeURIComponent(query)}&pagenum=0`;
    
    // Try the public search endpoint
    const resp = await fetch(`https://indiankanoon.org/search/?formInput=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'LawBoard-Legal-AI/1.0',
        'Accept': 'text/html',
      },
    });
    
    if (!resp.ok) {
      console.log('Indian Kanoon returned status:', resp.status);
      return [];
    }
    
    const html = await resp.text();
    const results: LegalSection[] = [];
    
    // Parse search results from HTML - extract case titles and snippets
    const resultBlocks = html.split('<div class="result_title">');
    
    for (let i = 1; i < Math.min(resultBlocks.length, topK + 1); i++) {
      const block = resultBlocks[i];
      
      // Extract title
      const titleMatch = block.match(/<a[^>]*>([^<]+)<\/a>/);
      const title = titleMatch ? titleMatch[1].trim().replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>') : `Indian Kanoon Result ${i}`;
      
      // Extract snippet/content  
      const snippetMatch = block.match(/<div class="result_text">([^]*?)<\/div>/);
      let content = snippetMatch ? snippetMatch[1].replace(/<[^>]+>/g, '').trim().slice(0, 500) : '';
      
      if (!content) {
        // Try alternate snippet pattern
        const altSnippet = block.match(/<div[^>]*class="[^"]*snippet[^"]*"[^>]*>([^]*?)<\/div>/);
        content = altSnippet ? altSnippet[1].replace(/<[^>]+>/g, '').trim().slice(0, 500) : 'See Indian Kanoon for full text.';
      }
      
      if (title && title.length > 3) {
        results.push({
          section: `Indian Kanoon: ${title.slice(0, 100)}`,
          title: title.slice(0, 150),
          content: content || 'Refer to Indian Kanoon portal for full judgment text.',
          keywords: query.toLowerCase().split(/\s+/).filter(w => w.length > 3),
          category: 'Case Law',
          source: 'indian_kanoon',
        });
      }
    }
    
    console.log(`Indian Kanoon returned ${results.length} results`);
    return results;
  } catch (error) {
    console.error('Indian Kanoon search error:', error);
    return [];
  }
}

// Main cascading search function
async function cascadingLegalSearch(
  supabase: any,
  query: string,
  caseType: string,
  country: string,
  minResults: number = 3,
  deepSearch: boolean = false
): Promise<{ sections: LegalSection[], sources: string[], searchLevels: number }> {
  const sources: string[] = [];
  let allSections: LegalSection[] = [];
  let searchLevels = 0;
  
  // Step 1: Search local corpus (always)
  console.log(`Step 1: Searching local corpus for ${country}...`);
  const localResults = retrieveFromLocalCorpus(query, caseType, country, deepSearch ? 10 : 6);
  if (localResults.length > 0) {
    sources.push('local_corpus');
    allSections = [...allSections, ...localResults];
  }
  searchLevels++;
  
  // Step 2: Search Supabase database (always in deep, or if not enough)
  if (deepSearch || allSections.length < minResults) {
    console.log('Step 2: Searching database...');
    const dbResults = await searchSupabaseDatabase(supabase, query, caseType, country, deepSearch ? 10 : 5);
    if (dbResults.length > 0) {
      sources.push('database');
      const existingSections = new Set(allSections.map(s => s.section));
      const uniqueDbResults = dbResults.filter(s => !existingSections.has(s.section));
      allSections = [...allSections, ...uniqueDbResults];
    }
    searchLevels++;
  }
  
  // Step 3: Indian Kanoon (for India) - always in deep search, or if insufficient results
  if (country === 'india' && (deepSearch || allSections.length < minResults)) {
    console.log('Step 3: Searching Indian Kanoon...');
    const kanoonResults = await searchIndianKanoon(query, deepSearch ? 8 : 5);
    if (kanoonResults.length > 0) {
      sources.push('indian_kanoon');
      const existingSections = new Set(allSections.map(s => s.section));
      const uniqueResults = kanoonResults.filter(s => !existingSections.has(s.section));
      allSections = [...allSections, ...uniqueResults];
    }
    searchLevels++;
  }
  
  return {
    sections: allSections.slice(0, deepSearch ? 20 : 10),
    sources,
    searchLevels,
  };
}

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
    
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error('Supabase credentials not configured');

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const body = await req.json();
    
    const VALID_COUNTRIES = ['india', 'usa', 'russia', 'china', 'japan', 'uk'];
    const VALID_ROLES = ['user', 'lawyer'];
    const MAX_MESSAGE_LENGTH = 5000;
    const MAX_MESSAGES = 50;
    const MAX_CASE_TYPE_LENGTH = 100;

    const messages = body.messages;
    if (!messages || !Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
      return new Response(JSON.stringify({ error: 'Invalid messages: must be an array of 1-50 messages' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const MAX_ASSISTANT_MESSAGE_LENGTH = 50000;
    for (const msg of messages) {
      if (!msg || typeof msg.content !== 'string' || msg.content.length === 0) {
        return new Response(JSON.stringify({ error: 'Invalid message content' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (!['user', 'assistant'].includes(msg.role)) {
        return new Response(JSON.stringify({ error: 'Invalid message role' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const maxLen = msg.role === 'user' ? MAX_MESSAGE_LENGTH : MAX_ASSISTANT_MESSAGE_LENGTH;
      if (msg.content.length > maxLen) {
        return new Response(JSON.stringify({ error: `Message exceeds ${maxLen} char limit` }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const country = VALID_COUNTRIES.includes(body.country) ? body.country : 'india';
    const userRole = VALID_ROLES.includes(body.userRole) ? body.userRole : 'user';
    const caseType = typeof body.caseType === 'string' ? body.caseType.slice(0, MAX_CASE_TYPE_LENGTH) : 'Criminal';
    const conversationId = typeof body.conversationId === 'string' ? body.conversationId.slice(0, 100) : undefined;
    const deepSearch = body.deepSearch === true;

    // Handle document attachment
    const documentAttachment = body.documentAttachment;
    let documentContext = '';
    if (documentAttachment && typeof documentAttachment.text === 'string') {
      const docText = documentAttachment.text.slice(0, 30000);
      const docName = typeof documentAttachment.name === 'string' ? documentAttachment.name.slice(0, 200) : 'unknown';
      const docType = typeof documentAttachment.type === 'string' ? documentAttachment.type.slice(0, 100) : 'unknown';
      documentContext = `\n\n---\n📎 **ATTACHED DOCUMENT: "${docName}"** (Type: ${docType})\n\n${docText}\n---\n`;
    }

    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop();
    const userQuery = lastUserMessage?.content || '';

    // Perform cascading search with deep search flag
    console.log(`Starting ${deepSearch ? 'DEEP' : 'standard'} legal search for ${country}:`, userQuery);
    const { sections: relevantSections, sources, searchLevels } = await cascadingLegalSearch(
      supabase, userQuery, caseType || 'Criminal', country, 3, deepSearch
    );
    
    console.log(`Found ${relevantSections.length} sections from ${searchLevels} levels: ${sources.join(', ')}`);

    const legalContext = relevantSections.length > 0
      ? relevantSections
          .map(s => `**${s.section}: ${s.title}** [Source: ${s.source}]\n${s.content}`)
          .join('\n\n')
      : 'No specific legal provisions found. Please provide more details about your case.';

    const sourcesNote = sources.length > 0
      ? `\n\n*Data retrieved from: ${sources.map(s => s.replace('_', ' ')).join(', ')} (${searchLevels} database levels searched)*`
      : '';

    const countryInfo = COUNTRY_INFO[country] || COUNTRY_INFO['india'];

    const deepSearchInstruction = deepSearch ? `\n\n**⚡ DEEP SEARCH MODE ACTIVE:**
You have been given results from ALL available database levels (${searchLevels} levels searched: ${sources.join(', ')}).
- Provide an EXHAUSTIVE legal analysis with every applicable section, precedent, and provision.
- After listing all found laws, ASK the user: "Do you have any other leads, keywords, or specific legal areas you'd like me to investigate further?"
- Be thorough and leave no stone unturned. This is a deep investigation.
- Organize results by source and relevance.
- If Indian Kanoon results are included, cite the case names and relevant holdings.` : '';

    let systemPrompt: string;
    
    if (userRole === 'user') {
      systemPrompt = `You are a compassionate legal support assistant helping someone in ${countryInfo.name}.

**YOUR PRIORITY ORDER:**
1. 🚨 SAFETY FIRST - If the user seems to be in danger, tell them to get to safety and call emergency services.
2. 💙 BE EMOTIONALLY SUPPORTIVE - Use warm, reassuring language.
3. 🛡️ REASSURE ABOUT LEGAL PROTECTIONS

**Communication Style:**
- Simple, clear language (avoid jargon)
- Warm and human - use empathetic phrases
- Break down steps with numbers or bullets
- Include relevant emojis for visual comfort
- Ask ONE question at a time
- Always end with reassurance

**Relevant Legal Provisions for ${countryInfo.name}:**
${legalContext}${sourcesNote}${deepSearchInstruction}

**Case Type:** ${caseType || 'Emergency'}
**Jurisdiction:** ${countryInfo.name}
${documentContext ? `\n**DOCUMENT ANALYSIS:**\nAnalyze the attached document thoroughly - identify type, check accuracy, highlight issues, explain implications simply.\n${documentContext}` : ''}

Remember: Safety and emotional wellbeing first, legal details second.`;
    } else {
      systemPrompt = `You are a highly experienced criminal lawyer and legal strategist in ${countryInfo.name}, specializing in ${countryInfo.lawSystem}.

**RULES:** Be serious, professional, logical, evidence-driven. No false hope. Think in terms of law, proof, admissibility, strategy.

**CASE ANALYSIS FLOW:**
1. CASE UNDERSTANDING - Identify victim, client, relationship, facts, timeline, sections of law
2. EVIDENCE COLLECTION - Ask for medical/forensic/fingerprint reports, documents, recordings. Evaluate authenticity, admissibility.
3. MEDIA ANALYSIS - Check for manipulation/deepfake signs if media provided
4. OPPONENT HANDLING - Identify flaws, weaknesses, evidentiary gaps in opposing arguments
5. GUILT ASSESSMENT - Honest assessment, shift strategy accordingly
6. LEGAL STRATEGY - Build arguments, anticipate counterarguments, prepare for trial

**Relevant Legal Provisions (${countryInfo.name}):**
${legalContext}${sourcesNote}${deepSearchInstruction}

**Case Type:** ${caseType || 'Not specified'}
**Jurisdiction:** ${countryInfo.name}
${documentContext ? `\n**DOCUMENT ANALYSIS:**\nAnalyze with extreme legal scrutiny - verify citations, assess authenticity, identify weaknesses, evaluate strategic value.\n${documentContext}` : ''}

All citations should be verified by the practitioner.`;
    }

    const requestBody: any = {
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ],
      stream: true,
      temperature: deepSearch ? 0.5 : 0.7,
      max_tokens: deepSearch ? 4000 : 2000
    };

    if (messages.length <= 6) {
      requestBody.tools = [NER_TOOL];
      requestBody.tool_choice = "auto";
    }

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
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

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
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
