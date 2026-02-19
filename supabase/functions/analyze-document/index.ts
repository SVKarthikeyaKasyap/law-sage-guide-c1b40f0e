import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ─────────────────────────────────────────────────────────────────────────────
// INDIAN LEGAL DOCUMENT TEMPLATES & GENERATION PROMPTS
// Based on: CrPC (now BNSS 2023), IPC (now BNS 2023), CPC, Legal Services
//           Authority Act, Bar Council of India Rules, Supreme Court Guidelines
// ─────────────────────────────────────────────────────────────────────────────

const INDIA_FIR_SYSTEM_PROMPT = `You are a senior Indian legal expert and police procedural specialist with 20+ years experience. 
Generate a LEGALLY ACCURATE First Information Report (FIR) following the EXACT official format prescribed by:
- Bharatiya Nagarik Suraksha Sanhita (BNSS) 2023, Section 173 (formerly Section 154 CrPC)
- National Crime Records Bureau (NCRB) Crime Head Classification
- Standard FIR Form (Form No. 1) as used by State Police Forces

MANDATORY FIR STRUCTURE — Follow this EXACTLY:

1. **HEADER SECTION**: Police Station name/District/State/Zone, FIR No., Date & Time of FIR registration, DD Entry No.

2. **TYPE OF INFORMATION**: Written/Oral (under BNSS Section 173(1))

3. **COMPLAINANT DETAILS**: 
   - Name, Father's/Husband's Name, Date of Birth, Nationality
   - Occupation, Complete Address with Pin Code
   - Contact Number, Email (if available)
   - Aadhaar No. (optional but modern practice)

4. **ACCUSED DETAILS** (if known):
   - Name(s), Address, Description (if unknown: "Unidentified Person(s)")
   - Relationship with complainant (if any)

5. **OFFENCE SECTION** (CRITICAL — Must cite correct law):
   - Date, Time, and Place of Occurrence  
   - Under Sections of BNS 2023 (Bharatiya Nyaya Sanhita) OR IPC 1860 as applicable
   - If cyber crime: IT Act 2000 sections
   - If domestic violence: Protection of Women from Domestic Violence Act 2005
   - POCSO Act 2012 if child victim
   - Relevant IPC/BNS sections with CORRECT section numbers and descriptions

6. **FACTS OF THE CASE** (Detailed narrative):
   - Chronological account in first person
   - Specific dates, times, locations
   - Names of witnesses (if any)
   - Evidence available (documents, CCTV, call records, etc.)
   - Injury description if applicable (MLC reference)

7. **LIST OF WITNESSES** (with addresses)

8. **PROPERTY INVOLVED** (if any): Description, value, serial numbers

9. **MEDICAL EXAMINATION** (if applicable): Hospital name, MLC No., Doctor's name

10. **COMPLAINANT'S DECLARATION**: 
    "I hereby declare that the contents of this FIR are true and correct to the best of my knowledge and belief, and nothing has been concealed."

11. **SIGNATURES**: 
    - Complainant's signature/thumb impression + date
    - Reporting Officer name, rank, badge number, station seal
    - Station House Officer (SHO) acknowledgment

12. **FORWARDING SECTION**: Sent to Magistrate under BNSS Section 173(2)

IMPORTANT LEGAL NOTES TO INCLUDE:
- Cite BOTH old IPC section AND new BNS 2023 equivalent where applicable
- Example: "Section 302 IPC (now Section 103 BNS 2023) — Punishment for Murder"
- Example: "Section 420 IPC (now Section 318 BNS 2023) — Cheating"
- Example: "Section 376 IPC (now Section 64 BNS 2023) — Rape"
- Include "Zero FIR" note if offense occurred outside jurisdiction
- Add NCRB crime head classification code

Use [COMPLAINANT_NAME], [ACCUSED_NAME], [POLICE_STATION], [DATE_OF_INCIDENT], [TIME_OF_INCIDENT], [PLACE_OF_INCIDENT], [DISTRICT] as placeholders for details not provided in context.

Generate the complete FIR document. Make it professional, legally precise, and ready for filing.`;

const INDIA_LEGAL_NOTICE_SYSTEM_PROMPT = `You are a Senior Advocate enrolled with the Bar Council of India with expertise in civil and criminal litigation.
Generate a LEGALLY ACCURATE and PROFESSIONALLY FORMATTED Legal Notice following:
- Bar Council of India Rules 1975 (Chapter II — Standards of Professional Conduct)  
- Code of Civil Procedure (CPC) 1908
- Specific Relief Act 1963
- Consumer Protection Act 2019 (if consumer dispute)
- Negotiable Instruments Act 1881, Section 138 (if cheque bounce)
- Indian Contract Act 1872 (if contractual dispute)
- Transfer of Property Act 1882 (if property dispute)
- Legal Services Authorities Act 1987

MANDATORY LEGAL NOTICE STRUCTURE:

═══════════════════════════════════════════════
**ADVOCATE'S LETTERHEAD FORMAT**
[Advocate Name], B.A., LL.B. (Hons.)
Advocate, [High Court / District Court]
Enrolment No.: [BAR COUNCIL ENROLLMENT NUMBER]
Chamber No.: [ADDRESS]
Mobile: [MOBILE], Email: [EMAIL]
═══════════════════════════════════════════════

NOTICE NO.: [NOTICE_NO]/[YEAR]
DATE: [DATE]

By Registered Post A.D. / Speed Post / WhatsApp (with read receipt)

TO,
[Name of Noticee/Opposite Party]
[Designation, if applicable]
[Complete Address with Pin Code]

SUBJECT: LEGAL NOTICE UNDER [APPLICABLE SECTIONS AND ACTS]

**Sir/Madam,**

**Para 1 — AUTHORITY**: "Under instructions from and on behalf of my client, [CLIENT_NAME], resident of [CLIENT_ADDRESS], I hereby serve you with this Legal Notice as follows:"

**Para 2 — BACKGROUND**: [Relationship between parties, nature of dispute, dates]

**Para 3 — FACTS**: [Chronological statement of facts with specific dates, amounts, agreements]

**Para 4 — LEGAL VIOLATION**: 
"Your aforesaid acts/omissions constitute:
(i) Breach of [specific contract/agreement dated ___]
(ii) Violation of [specific sections of applicable Acts]
(iii) [Additional violations]"

**Para 5 — DEMAND/RELIEF SOUGHT**:
"You are hereby called upon to:
1. [Specific demand 1 — e.g., Pay Rs. [AMOUNT] (Rupees [AMOUNT IN WORDS] only)]
2. [Specific demand 2]
3. [Specific demand 3]
within **15 (fifteen) days** from the receipt of this notice."

**Para 6 — CONSEQUENCES**:
"In the event of your failure to comply with the aforesaid demands within the stipulated period, my client shall be constrained to initiate appropriate legal proceedings against you before the competent Court/Forum/Authority, seeking:
(a) [Civil/Criminal remedy 1]
(b) Damages of Rs. [AMOUNT] 
(c) Cost of litigation
All at your risk and cost, as to which take notice."

**Para 7 — PRESERVATION**:
"You are further advised to preserve all documents, records, communications, and evidence related to this matter."

Yours faithfully,

[ADVOCATE_NAME]
Advocate
Enrolment No.: [ENROLLMENT_NUMBER]

**ENCLOSURES:**
1. [List of documents enclosed]

**NOTE**: This notice is issued without prejudice to all other rights and remedies available to my client under law.

─────────────────────────────
**ACKNOWLEDGMENT / PROOF OF SERVICE**
Sent via: Registered Post (AD) | Speed Post | Email | WhatsApp
Date of dispatch: [DATE]
Tracking No.: [TRACKING_NUMBER]
─────────────────────────────

For notices under specific laws, INCLUDE:
- NI Act Section 138: 30-day demand period; cite Section 138, 139, 141, 142 NI Act 1881
- Consumer: Include District Consumer Disputes Redressal Commission reference; cite Sections 2, 35, 47 Consumer Protection Act 2019
- Property: Cite specific sections of Transfer of Property Act 1882
- Employment: Cite Industrial Disputes Act 1947, Sections 2(k), 10, 11A; or relevant labour laws

Use [CLIENT_NAME], [NOTICEE_NAME], [ADVOCATE_NAME], [ENROLLMENT_NO], [AMOUNT], [AGREEMENT_DATE] as placeholders.`;

const INDIA_COMPLAINT_SYSTEM_PROMPT = `You are a Senior Advocate specializing in criminal law and court pleadings in India.
Generate a LEGALLY ACCURATE Criminal Complaint/Petition following:
- Bharatiya Nagarik Suraksha Sanhita (BNSS) 2023, Sections 223, 224, 235 (formerly CrPC Sections 190, 200, 202)
- Bharatiya Nyaya Sanhita (BNS) 2023 (formerly IPC 1860) — with BOTH old and new section references
- Supreme Court Guidelines on filing of complaints (Arnesh Kumar v. State of Bihar, 2014)
- Code of Criminal Procedure (CrPC) 1973 where BNSS 2023 not yet notified

MANDATORY CRIMINAL COMPLAINT STRUCTURE:

IN THE COURT OF THE [METROPOLITAN MAGISTRATE / JUDICIAL MAGISTRATE FIRST CLASS / CHIEF JUDICIAL MAGISTRATE]
AT [CITY]
[STATE], INDIA

COMPLAINT CASE NO. _____ OF [YEAR]

COMPLAINANT:
[Full Name], [Age] years
S/o / D/o / W/o [Father's/Husband's Name]
Occupation: [Occupation]
Resident of: [Complete Address with Pin Code]
Mobile: [MOBILE_NUMBER]
Email: [EMAIL]
                                                        ...Complainant

VERSUS

ACCUSED:
1. [Accused Full Name], [Age] years (if known)
   S/o [Father's Name]
   Occupation: [Occupation]
   Resident of: [Address]
   
2. [Additional accused if any]
                                                        ...Accused / Opposite Party

COMPLAINT UNDER SECTIONS [LIST ALL BNS/IPC SECTIONS] OF THE BHARATIYA NYAYA SANHITA, 2023 READ WITH SECTIONS [BNSS SECTIONS] OF THE BHARATIYA NAGARIK SURAKSHA SANHITA, 2023

═══════════════════════════════════════════
COMPLAINT / PETITION
═══════════════════════════════════════════

**MOST RESPECTFULLY SHOWETH:**

**1. BRIEF FACTS:**
That the complainant, [Client Name], most respectfully submits the following facts before this Hon'ble Court:

**a)** [Opening: Who the complainant is and their relationship to the accused if any]

**b)** [Incident 1: Date, Time, Place — detailed narration]

**c)** [Incident 2 if applicable]

**d)** [Evidence available: Documents, witnesses, CCTV footage, call records, medical reports etc.]

**2. COMMISSION OF OFFENCE:**
That the acts and conduct of the accused persons as detailed above prima facie constitute the following offences:

(i) Section [X] of Bharatiya Nyaya Sanhita, 2023 [formerly Section [Y] IPC 1860] — [Offence Name]
    "Which provides: [Quote the relevant provision]"
    
(ii) Section [X] BNS 2023 [formerly Section [Y] IPC] — [Offence Name]

(iii) [Add all applicable sections — cyber crimes under IT Act 2000; domestic violence under PWDVA 2005; POCSO 2012 if applicable]

**3. FIR STATUS / POLICE ACTION:**
(a) That the complainant lodged/attempted to lodge an FIR at [Police Station] on [Date].
(b) [If police refused]: "That despite written requests, the concerned police station refused to register the FIR, necessitating this complaint under Section 223 BNSS 2023 [Section 190 CrPC]."
OR
(b) [If FIR lodged but police inactive]: "That despite FIR No. [XXX/YYYY] dated [DATE] at [Police Station], no meaningful investigation has been conducted."

**4. JURISDICTION:**
That this Hon'ble Court has jurisdiction to entertain this complaint as:
(a) The offence was committed within the territorial jurisdiction of this Court.
(b) The accused resides/has office within this jurisdiction.
[Cite BNSS Section 201 / CrPC Section 177 for territorial jurisdiction]

**5. LIMITATION:**
That this complaint is being filed within the period of limitation as prescribed under BNSS 2023 / applicable law, as the offence is a continuing one / was discovered on [DATE].

**6. PREVIOUS PROCEEDINGS:**
[State if any previous complaint/case is pending or was decided — mandatory disclosure]

**7. VERIFICATION:**
I, [Complainant Name], the above-named complainant, do hereby solemnly verify and declare that the contents of paragraphs 1 to 6 above are true and correct to the best of my knowledge and belief, and nothing material has been concealed therefrom.

Verified at [City] on this [Day] day of [Month], [Year].

COMPLAINANT
[Signature]
[Name]
[Date]

═══════════════════════════════════════════
**PRAYER**
═══════════════════════════════════════════

It is therefore most respectfully prayed that this Hon'ble Court may graciously be pleased to:

(a) Take cognizance of the offences under the aforesaid sections against the accused persons;

(b) Issue process/summons/warrant against the accused under Section 224/225 BNSS 2023;

(c) Direct the concerned police to conduct a thorough investigation into the matter under Section 175 BNSS 2023;

(d) Award appropriate compensation to the complainant under Section 395 BNSS 2023;

(e) Pass such other and further order(s) as this Hon'ble Court may deem fit and proper in the facts and circumstances of the case.

AND FOR THIS ACT OF KINDNESS, THE COMPLAINANT SHALL EVER PRAY.

Place: [City]
Date: [Date]

[ADVOCATE NAME]
Advocate for the Complainant
Enrolment No.: [ENROLLMENT_NUMBER]
[Contact Details]

─────────────────────────────────────────
**ANNEXURES / DOCUMENTS FILED:**
A. [List of supporting documents]
B. [FIR Copy, if registered]
C. [Medical Reports, if applicable]
D. [Witness List with addresses]
─────────────────────────────────────────

**AFFIDAVIT IN SUPPORT**
(Sworn before Executive Magistrate/Oath Commissioner/Notary Public)

I, [Complainant Name], aged [Age] years, residing at [Address], being first duly sworn, state on oath that the contents of the above complaint are true and correct.

Deponent: _________________
[Complainant Name]

Sworn before me at [City] on [Date]

_________________
[Oath Commissioner/Notary/Magistrate]
Seal & Signature

Use [COMPLAINANT_NAME], [ACCUSED_NAME], [COURT_NAME], [CITY], [STATE], [BNS_SECTIONS], [IPC_SECTIONS_OLD], [AMOUNT_IF_ANY] as placeholders for details not provided.`;

// ─────────────────────────────────────────────────────────────────────────────
// SCAN SYSTEM PROMPT — Advanced criteria for Indian legal documents
// ─────────────────────────────────────────────────────────────────────────────

const INDIA_SCAN_SYSTEM_PROMPT = `You are a Senior Legal Expert and Document Authenticator with expertise in Indian law.
Analyze the provided legal document with ADVANCED SCRUTINY across ALL the following criteria:

**LEGAL ACCURACY CRITERIA:**
1. Section Citations — Are IPC/BNS sections correct and currently valid? 
   (Note: BNS 2023 replaced IPC 1860; BNSS 2023 replaced CrPC 1973; BSA 2023 replaced Indian Evidence Act 1872)
2. Procedural Compliance — Does it follow the correct filing procedure for this document type?
3. Jurisdictional Correctness — Is the correct court/authority addressed?
4. Limitation Period — Has the applicable limitation period been respected?
5. Mandatory Disclosures — Are all legally required statements present?

**DOCUMENT AUTHENTICITY CHECKS:**
6. Proper verification/affidavit — Is the verification clause present and correctly worded?
7. Stamp duty compliance — Is the document properly stamped as required?
8. Notarization requirement — Does the document type require notarization?
9. Advocate enrollment details — Are bar enrollment numbers present where required?
10. Court fees — For court filings, is court fee mentioned?

**FORMATTING & COMPLETENESS:**
11. Parties correctly named — Full name, age, parentage, address?
12. Cause title — Is the complaint/case title correctly formatted?
13. Prayer clause — Is the prayer specific, legally sound, and complete?
14. Signature requirements — Are all required signatures/thumb impressions mentioned?
15. Annexures — Are all referenced documents listed as annexures?

**LANGUAGE & PRECISION:**
16. Legal terminology — Is the legal language appropriate and precise?
17. Specificity — Are dates, amounts, and facts specific (not vague)?
18. Contradictions — Are there any internal contradictions?
19. Completeness of facts — Are all material facts disclosed?
20. Proportionality of relief — Is the relief sought proportionate and legally available?

**FRAUD/AUTHENTICITY INDICATORS:**
21. Blank/unsigned sections — Are there suspicious blanks?
22. Inconsistent dates — Do the dates in different parts match?
23. Contradictory facts — Are there factual inconsistencies?
24. Forged seals indicators — Does seal/stamp language appear authentic?
25. Template artifacts — Are there unmodified placeholder texts [LIKE THIS] remaining?

RESPONSE FORMAT (you MUST use this exact JSON structure):
{
  "overallScore": <number 1-100>,
  "verdict": "<VALID|NEEDS_CHANGES|INVALID>",
  "summary": "<brief overall assessment in 2-3 sentences>",
  "legalBasis": "<primary law/act this document falls under>",
  "documentType": "<identified document type>",
  "issues": [
    {
      "severity": "<critical|warning|info>",
      "category": "<Legal Accuracy|Authenticity|Formatting|Language|Fraud Risk>",
      "location": "<exact text snippet where issue is found>",
      "issue": "<precise description of the problem>",
      "suggestion": "<specific, actionable fix with correct legal reference>"
    }
  ],
  "strengths": ["<list of things done correctly>"],
  "missingElements": ["<mandatory elements that are absent>"],
  "applicableLaws": ["<all laws/acts that apply to this document>"],
  "recommendedActions": ["<priority-ordered list of next steps>"]
}

Be THOROUGH and PRECISE. Every critical issue MUST cite the relevant law or rule that is violated.`;

// ─────────────────────────────────────────────────────────────────────────────

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

    // Extract chat context for generation
    const contextSummary = chatContext
      .filter((m: any) => m.role === 'user')
      .map((m: any) => m.content)
      .join('\n\n');

    if (action === 'generate') {
      // ── INDIA-SPECIFIC DOCUMENT GENERATION ──────────────────────────────
      if (country === 'india') {
        const docTypeLower = documentType.toLowerCase();
        
        if (docTypeLower === 'fir') {
          systemPrompt = INDIA_FIR_SYSTEM_PROMPT;
          userPrompt = `Generate a complete, legally accurate FIR (First Information Report) based on the following case facts extracted from the conversation:

CASE TYPE: ${caseType}
CASE FACTS FROM CONVERSATION:
${contextSummary || '[No specific facts provided — generate a properly structured template with all mandatory sections]'}

Instructions:
1. Extract ALL relevant details (dates, names, places, amounts, events) from the case facts above
2. Match the correct BNS 2023 / IPC sections to the nature of the offence described
3. Use [PLACEHOLDER] for any information not provided in the case facts
4. Follow the complete official FIR format as instructed
5. Include BOTH old IPC section numbers AND new BNS 2023 equivalents
6. Add a footnote listing all applicable laws cited`;
          
        } else if (docTypeLower === 'notice') {
          systemPrompt = INDIA_LEGAL_NOTICE_SYSTEM_PROMPT;
          userPrompt = `Generate a complete, legally accurate Legal Notice based on the following case facts:

CASE TYPE: ${caseType}
CASE FACTS FROM CONVERSATION:
${contextSummary || '[No specific facts provided — generate a properly structured template with all mandatory sections]'}

Instructions:
1. Extract the nature of dispute from the case facts (contractual, property, consumer, cheque bounce, etc.)
2. Cite the CORRECT sections of applicable laws (Consumer Protection Act 2019, NI Act 1881, Contract Act 1872, etc.)
3. Specify a clear, specific relief/demand with amounts in both numerals and words
4. Include proper timelines (15 days for civil/30 days for NI Act Section 138)
5. Use [PLACEHOLDER] for information not provided
6. Make the consequence clause comprehensive and legally strong`;
          
        } else if (docTypeLower === 'complaint') {
          systemPrompt = INDIA_COMPLAINT_SYSTEM_PROMPT;
          userPrompt = `Generate a complete, legally accurate Criminal Complaint Petition based on the following case facts:

CASE TYPE: ${caseType}
CASE FACTS FROM CONVERSATION:
${contextSummary || '[No specific facts provided — generate a properly structured template with all mandatory sections]'}

Instructions:
1. Identify the correct court (Magistrate/Sessions/High Court) based on the offence severity
2. Cite BOTH BNS 2023 sections AND their old IPC equivalents for each offence
3. Include sections from BNSS 2023 for procedural provisions (formerly CrPC)
4. Draft a strong prayer clause with specific, legally available reliefs
5. Add the mandatory verification and affidavit section
6. Reference landmark judgments if applicable (e.g., Lalita Kumari v. Govt of UP — mandatory FIR registration)
7. Use [PLACEHOLDER] for information not provided`;
          
        } else {
          // Generic Indian legal document
          systemPrompt = `You are an expert legal document drafter specializing in Indian law (BNS 2023, BNSS 2023, BSA 2023, CPC, CrPC, and all major central acts).
Generate a professional, legally accurate ${documentType} document. Follow the official format prescribed for this document type in India.
Use proper legal language, cite correct laws, and include all mandatory sections. Use [PLACEHOLDER] for missing information.`;
          userPrompt = `Generate a ${documentType} based on these facts:\n\nCase Type: ${caseType}\n\nCase Facts:\n${contextSummary}`;
        }
        
      } else {
        // ── NON-INDIA DOCUMENT GENERATION ─────────────────────────────────
        systemPrompt = `You are an expert legal document drafter specializing in ${country.toUpperCase()} law. 
Generate a professional, legally accurate draft document based on the provided case context.

RULES:
- Use proper legal formatting with headers, sections, and appropriate legal language
- Include all necessary legal references and section citations specific to ${country.toUpperCase()} jurisdiction
- Use placeholder brackets [PLACEHOLDER] for information that needs to be filled in
- Make it as complete as possible based on the available context
- Follow the standard format for the document type in ${country.toUpperCase()}`;
        userPrompt = `Generate a ${documentType} draft based on these case facts:\n\n${contextSummary}\n\nCase Type: ${caseType}\nCountry: ${country}`;
      }

    } else if (action === 'scan') {
      // ── DOCUMENT SCANNING ─────────────────────────────────────────────────
      if (country === 'india') {
        systemPrompt = INDIA_SCAN_SYSTEM_PROMPT;
      } else {
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
}`;
      }
      userPrompt = `Analyze this ${documentType || 'legal'} document for correctness and legal validity under ${country.toUpperCase()} law:\n\n${documentText}`;

    } else if (action === 'edit') {
      // ── DOCUMENT EDITING ──────────────────────────────────────────────────
      const editLawContext = country === 'india' 
        ? 'Indian law (BNS 2023, BNSS 2023, BSA 2023, Consumer Protection Act 2019, CPC, and all applicable Central Acts)'
        : `${country.toUpperCase()} law`;
        
      systemPrompt = `You are an expert legal document editor specializing in ${editLawContext}.
You will receive a legal document that may have issues. Fix ALL the issues while:

1. Preserving the original intent and facts of the parties
2. Correcting legal citations — for India: update OLD IPC sections to BNS 2023 equivalents while keeping both references
3. Improving legal language, formatting, and document structure
4. Adding any missing mandatory sections (verification, prayer, jurisdiction statement etc.)
5. Ensuring full compliance with ${editLawContext}
6. Fixing grammatical errors and improving precision of language
7. Ensuring the prayer/demand clause is legally sound and specific

After editing, identify any remaining placeholders like [PLACEHOLDER], [NAME], [DATE], [ADDRESS], or any specific information still missing that the user needs to provide.

Return a JSON response in this EXACT format:
{
  "document": "<the full corrected document text>",
  "missingDetails": ["<specific detail still needed, e.g., 'Full name of the complainant', 'Date of incident', 'Name of Police Station', 'Amount in dispute'>"]
}

If no details are missing, return an empty array for missingDetails.
Return ONLY valid JSON, no markdown code blocks or extra text.`;

      userPrompt = `Fix and improve this ${documentType || 'legal'} document for ${country.toUpperCase()} jurisdiction:\n\n${documentText}`;
    }

    // ── AI API CALL ─────────────────────────────────────────────────────────
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
        temperature: action === 'scan' ? 0.2 : 0.4,
        max_tokens: 8000,
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
      try {
        let jsonStr = content;
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) jsonStr = jsonMatch[1].trim();
        const scanResult = JSON.parse(jsonStr);
        return new Response(JSON.stringify({ success: true, result: scanResult }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch {
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

    if (action === 'edit') {
      try {
        let jsonStr = content;
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) jsonStr = jsonMatch[1].trim();
        const parsed = JSON.parse(jsonStr);
        return new Response(JSON.stringify({ 
          success: true, 
          content: parsed.document || content,
          missingDetails: Array.isArray(parsed.missingDetails) ? parsed.missingDetails : []
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch {
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
