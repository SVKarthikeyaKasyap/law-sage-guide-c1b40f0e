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
    { section: "18 U.S.C. § 1111", title: "Murder", content: "Murder is the unlawful killing of a human being with malice aforethought. First degree murder is punishable by death or life imprisonment. Second degree murder is punishable by imprisonment for any term of years or for life.", keywords: ["murder", "homicide", "killing", "death penalty", "life imprisonment"], category: "Criminal" },
    { section: "18 U.S.C. § 113", title: "Assault", content: "Assault with intent to commit murder or serious bodily injury is punishable by imprisonment of up to 20 years. Simple assault is punishable by fine or imprisonment up to 6 months.", keywords: ["assault", "battery", "injury", "violence", "attack"], category: "Criminal" },
    { section: "18 U.S.C. § 2241", title: "Sexual Abuse", content: "Whoever knowingly causes another person to engage in a sexual act by using force against that person shall be fined and imprisoned for any term of years or for life.", keywords: ["sexual", "abuse", "rape", "assault", "force"], category: "Criminal" },
    { section: "18 U.S.C. § 2111", title: "Robbery", content: "Whoever by force and violence, or by intimidation, takes from the person or presence of another anything of value, shall be imprisoned not more than fifteen years.", keywords: ["robbery", "theft", "force", "violence", "stealing"], category: "Criminal" },
    { section: "18 U.S.C. § 1341", title: "Mail Fraud", content: "Whoever devises any scheme to defraud or for obtaining money by means of false pretenses using mail shall be fined or imprisoned not more than 20 years, or both.", keywords: ["fraud", "mail", "scam", "deception", "money"], category: "Criminal" },
    { section: "8 U.S.C. § 1227", title: "Deportable Aliens", content: "Any alien who at the time of entry was within one or more classes of deportable aliens, or who has violated immigration law, is deportable.", keywords: ["deportation", "visa", "immigration", "alien", "removal"], category: "Immigration" },
    { section: "8 U.S.C. § 1182", title: "Inadmissible Aliens", content: "Aliens who are unlawfully present for more than 180 days but less than 1 year face a 3-year bar from admission. Those unlawfully present for 1 year or more face a 10-year bar.", keywords: ["overstay", "visa", "unlawful", "bar", "admission"], category: "Immigration" },
    { section: "8 U.S.C. § 1324c", title: "Document Fraud", content: "It is unlawful to forge, counterfeit, alter, or falsely make any immigration document. Penalties include fines and imprisonment.", keywords: ["document", "fraud", "passport", "forgery", "immigration"], category: "Immigration" },
    { section: "Miranda v. Arizona", title: "Right to Remain Silent", content: "Before custodial interrogation, police must inform suspects of their right to remain silent, that anything said can be used against them, right to an attorney, and if unable to afford one, an attorney will be appointed.", keywords: ["miranda", "rights", "silence", "attorney", "interrogation", "arrest"], category: "Constitutional" },
    { section: "Fourth Amendment", title: "Protection Against Unreasonable Searches", content: "The right of the people to be secure in their persons, houses, papers, and effects, against unreasonable searches and seizures, shall not be violated.", keywords: ["search", "seizure", "warrant", "privacy", "police"], category: "Constitutional" },
    { section: "Fifth Amendment", title: "Right Against Self-Incrimination", content: "No person shall be compelled in any criminal case to be a witness against himself, nor be deprived of life, liberty, or property, without due process of law.", keywords: ["self-incrimination", "due process", "rights", "testimony"], category: "Constitutional" },
    { section: "Sixth Amendment", title: "Right to Speedy Trial and Counsel", content: "In all criminal prosecutions, the accused shall enjoy the right to a speedy and public trial, to be informed of the accusations, to confront witnesses, and to have the assistance of counsel.", keywords: ["trial", "counsel", "attorney", "speedy", "jury"], category: "Constitutional" },
  ],
  russia: [
    { section: "Article 105 Criminal Code RF", title: "Murder", content: "Murder, that is, the intentional causing of death to another person, shall be punishable by deprivation of liberty for a term of six to fifteen years. Aggravated murder is punishable by imprisonment from eight to twenty years or life imprisonment.", keywords: ["murder", "убийство", "death", "killing", "homicide"], category: "Criminal" },
    { section: "Article 111 Criminal Code RF", title: "Intentional Infliction of Grave Bodily Harm", content: "Intentional infliction of grave bodily harm dangerous to human life shall be punishable by deprivation of liberty for a term of up to eight years.", keywords: ["bodily harm", "injury", "assault", "violence"], category: "Criminal" },
    { section: "Article 131 Criminal Code RF", title: "Rape", content: "Rape, that is, sexual intercourse with the use of violence or threats, or using the helpless state of the victim, shall be punishable by deprivation of liberty for a term of three to six years.", keywords: ["rape", "sexual", "violence", "assault"], category: "Criminal" },
    { section: "Article 158 Criminal Code RF", title: "Theft", content: "Theft, that is, the secret stealing of another's property, shall be punishable by a fine, or by compulsory works, or by deprivation of liberty for up to two years.", keywords: ["theft", "stealing", "property", "кража"], category: "Criminal" },
    { section: "Article 159 Criminal Code RF", title: "Fraud", content: "Fraud, that is, the stealing of another's property or the acquisition of rights to another's property by deceit or abuse of trust, shall be punishable by a fine or imprisonment.", keywords: ["fraud", "deceit", "мошенничество", "scam"], category: "Criminal" },
    { section: "Federal Law No. 115-FZ", title: "Legal Status of Foreign Citizens", content: "Foreign citizens must have valid visa and migration card. Overstaying visa results in fines from 2,000 to 5,000 rubles and possible deportation with re-entry ban.", keywords: ["visa", "foreigner", "migration", "виза", "deportation"], category: "Immigration" },
    { section: "Article 18.8 Administrative Code", title: "Violation of Stay Rules", content: "Violation of rules of entry or stay by a foreign citizen in Russia entails a fine from 2,000 to 5,000 rubles with administrative deportation.", keywords: ["overstay", "violation", "fine", "deportation"], category: "Immigration" },
    { section: "Article 322 Criminal Code RF", title: "Illegal Border Crossing", content: "Illegal crossing of the State Border of the Russian Federation shall be punishable by a fine or imprisonment for up to two years.", keywords: ["border", "illegal", "crossing", "граница"], category: "Immigration" },
  ],
  china: [
    { section: "Article 232 Criminal Law PRC", title: "Intentional Homicide", content: "Whoever intentionally kills another person shall be sentenced to death, life imprisonment or fixed-term imprisonment of not less than 10 years. If circumstances are relatively minor, shall be sentenced to fixed-term imprisonment of 3 to 10 years.", keywords: ["murder", "homicide", "killing", "death", "故意杀人"], category: "Criminal" },
    { section: "Article 234 Criminal Law PRC", title: "Intentional Injury", content: "Whoever intentionally injures another person shall be sentenced to fixed-term imprisonment of not more than 3 years or criminal detention. If serious injury caused, imprisonment of 3 to 10 years.", keywords: ["injury", "assault", "harm", "故意伤害"], category: "Criminal" },
    { section: "Article 236 Criminal Law PRC", title: "Rape", content: "Whoever rapes a woman by violence, coercion or other means shall be sentenced to fixed-term imprisonment of 3 to 10 years. Aggravated cases may result in more than 10 years, life imprisonment, or death.", keywords: ["rape", "sexual", "violence", "强奸"], category: "Criminal" },
    { section: "Article 264 Criminal Law PRC", title: "Theft", content: "Whoever steals a relatively large amount of public or private property or commits theft repeatedly shall be sentenced to fixed-term imprisonment of not more than 3 years, criminal detention or surveillance.", keywords: ["theft", "stealing", "property", "盗窃"], category: "Criminal" },
    { section: "Article 266 Criminal Law PRC", title: "Fraud", content: "Whoever defrauds public or private property of a relatively large amount shall be sentenced to fixed-term imprisonment of not more than 3 years.", keywords: ["fraud", "scam", "deception", "诈骗"], category: "Criminal" },
    { section: "Exit-Entry Administration Law Art. 78", title: "Illegal Stay", content: "Foreigners who illegally stay in China shall be given a warning and may be fined up to 10,000 yuan per day (maximum 50,000 yuan), or detained for 5 to 15 days. May also be deported.", keywords: ["visa", "overstay", "foreigner", "illegal", "签证"], category: "Immigration" },
    { section: "Exit-Entry Administration Law Art. 81", title: "Deportation", content: "Foreigners who violate this Law may be deported. Those deported shall not be allowed to enter China for 1 to 5 years from the date of deportation.", keywords: ["deportation", "ban", "violation", "遣返"], category: "Immigration" },
    { section: "Regulations on Foreigners Art. 42", title: "Visa Extension", content: "Foreigners who need to extend their stay shall apply to the local exit-entry administration authority 7 days before the expiry of their visa.", keywords: ["visa", "extension", "application", "延期"], category: "Immigration" },
  ],
  japan: [
    { section: "Penal Code Article 199", title: "Homicide", content: "A person who kills another shall be punished by the death penalty or imprisonment with work for life or for a definite term of not less than 5 years.", keywords: ["murder", "homicide", "killing", "殺人"], category: "Criminal" },
    { section: "Penal Code Article 204", title: "Injury", content: "A person who injures the body of another shall be punished by imprisonment with work for not more than 15 years or a fine of not more than 500,000 yen.", keywords: ["injury", "assault", "harm", "傷害"], category: "Criminal" },
    { section: "Penal Code Article 177", title: "Forcible Sexual Intercourse", content: "A person who, through assault or intimidation, has sexual intercourse with a person of 13 years of age or above shall be punished by imprisonment for a definite term of not less than 5 years.", keywords: ["rape", "sexual", "assault", "強制性交"], category: "Criminal" },
    { section: "Penal Code Article 235", title: "Theft", content: "A person who steals the property of another commits the crime of theft and shall be punished by imprisonment with work for not more than 10 years or a fine of not more than 500,000 yen.", keywords: ["theft", "stealing", "property", "窃盗"], category: "Criminal" },
    { section: "Penal Code Article 246", title: "Fraud", content: "A person who defrauds another of property shall be punished by imprisonment with work for not more than 10 years.", keywords: ["fraud", "scam", "deception", "詐欺"], category: "Criminal" },
    { section: "Immigration Control Act Art. 70", title: "Illegal Stay", content: "A foreign national who stays in Japan beyond their period of stay without permission shall be punished by imprisonment with work for not more than 3 years or a fine of not more than 3 million yen.", keywords: ["visa", "overstay", "illegal", "在留"], category: "Immigration" },
    { section: "Immigration Control Act Art. 24", title: "Deportation", content: "Foreign nationals who have violated immigration laws may be subject to deportation proceedings. Those deported may be banned from re-entry for 5 years, or 10 years for repeat offenders.", keywords: ["deportation", "ban", "violation", "退去強制"], category: "Immigration" },
    { section: "Immigration Control Act Art. 22-4", title: "Status of Residence", content: "Foreign nationals must maintain valid status of residence. Those who lose their status must leave Japan or apply for a different status within the prescribed period.", keywords: ["visa", "status", "residence", "在留資格"], category: "Immigration" },
  ],
  uk: [
    { section: "Murder (Common Law)", title: "Murder", content: "Murder is the unlawful killing of a human being under the Queen's Peace with malice aforethought. The mandatory sentence for murder is life imprisonment.", keywords: ["murder", "homicide", "killing", "life imprisonment"], category: "Criminal" },
    { section: "Offences Against the Person Act 1861 s.18", title: "Wounding with Intent", content: "Whosoever shall unlawfully and maliciously wound or cause grievous bodily harm to any person with intent to do grievous bodily harm shall be liable to imprisonment for life.", keywords: ["wounding", "gbh", "injury", "assault"], category: "Criminal" },
    { section: "Sexual Offences Act 2003 s.1", title: "Rape", content: "A person commits rape if he intentionally penetrates the vagina, anus or mouth of another person with his penis, and that person does not consent, and he does not reasonably believe that person consents. Maximum sentence is life imprisonment.", keywords: ["rape", "sexual", "assault", "consent"], category: "Criminal" },
    { section: "Theft Act 1968 s.1", title: "Theft", content: "A person is guilty of theft if he dishonestly appropriates property belonging to another with the intention of permanently depriving the other of it. Maximum sentence is 7 years imprisonment.", keywords: ["theft", "stealing", "property", "dishonest"], category: "Criminal" },
    { section: "Fraud Act 2006 s.2", title: "Fraud by False Representation", content: "A person is guilty of fraud if he dishonestly makes a false representation with intent to make a gain for himself or cause loss to another. Maximum sentence is 10 years imprisonment.", keywords: ["fraud", "false", "representation", "scam"], category: "Criminal" },
    { section: "Immigration Act 1971 s.24", title: "Illegal Entry and Overstaying", content: "A person who knowingly enters the UK without leave, or overstays their leave, is guilty of an offence. Penalties include up to 6 months imprisonment or a fine.", keywords: ["visa", "overstay", "illegal", "immigration"], category: "Immigration" },
    { section: "Immigration Act 1971 s.3", title: "Deportation", content: "The Secretary of State may deport a person if deemed conducive to the public good, if the person has been convicted of an offence punishable with imprisonment and recommended for deportation by the court.", keywords: ["deportation", "removal", "public good"], category: "Immigration" },
    { section: "UK Borders Act 2007 s.32", title: "Automatic Deportation", content: "A foreign criminal who is sentenced to imprisonment for 12 months or more shall be automatically deported unless exceptions apply.", keywords: ["deportation", "criminal", "automatic", "sentence"], category: "Immigration" },
    { section: "Police and Criminal Evidence Act 1984", title: "Rights on Arrest", content: "Upon arrest, you have the right to remain silent, to have someone informed of your arrest, to consult a solicitor privately, and to read the Codes of Practice.", keywords: ["arrest", "rights", "solicitor", "police", "caution"], category: "Criminal Procedure" },
    { section: "Human Rights Act 1998 Art. 6", title: "Right to Fair Trial", content: "Everyone is entitled to a fair and public hearing within a reasonable time by an independent and impartial tribunal. Everyone charged with a criminal offence shall be presumed innocent until proved guilty.", keywords: ["fair trial", "rights", "innocent", "hearing"], category: "Constitutional" },
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

// Country info for system prompts
const COUNTRY_INFO: Record<string, { name: string; lawSystem: string }> = {
  india: { name: "India", lawSystem: "Indian Penal Code (IPC), CrPC, and Constitution" },
  usa: { name: "United States", lawSystem: "US Code, State Laws, and Constitutional Rights" },
  russia: { name: "Russia", lawSystem: "Criminal Code of the Russian Federation" },
  china: { name: "China", lawSystem: "Criminal Law of the People's Republic of China" },
  japan: { name: "Japan", lawSystem: "Japanese Penal Code and Immigration Control Act" },
  uk: { name: "United Kingdom", lawSystem: "Common Law, Statutory Law, and Human Rights Act" }
};

// Simple keyword-based retrieval function for local corpus
function retrieveFromLocalCorpus(query: string, caseType: string, country: string, topK: number = 5): LegalSection[] {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 3);
  
  const countryCorpus = LEGAL_CORPUS[country] || LEGAL_CORPUS['india'];
  
  const scored = countryCorpus.map(section => {
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
async function searchSupabaseDatabase(supabase: any, query: string, caseType: string, country: string, topK: number = 5): Promise<LegalSection[]> {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 3);
  
  try {
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

// Main cascading search function
async function cascadingLegalSearch(
  supabase: any,
  query: string,
  caseType: string,
  country: string,
  minResults: number = 3
): Promise<{ sections: LegalSection[], sources: string[] }> {
  const sources: string[] = [];
  let allSections: LegalSection[] = [];
  
  // Step 1: Search local corpus
  console.log(`Step 1: Searching local corpus for ${country}...`);
  const localResults = retrieveFromLocalCorpus(query, caseType, country, 6);
  if (localResults.length > 0) {
    sources.push('local_corpus');
    allSections = [...allSections, ...localResults];
    console.log(`Found ${localResults.length} results in local corpus`);
  }
  
  // Step 2: Search Supabase database
  if (allSections.length < minResults) {
    console.log('Step 2: Searching database...');
    const dbResults = await searchSupabaseDatabase(supabase, query, caseType, country, 5);
    if (dbResults.length > 0) {
      sources.push('database');
      const existingSections = new Set(allSections.map(s => s.section));
      const uniqueDbResults = dbResults.filter(s => !existingSections.has(s.section));
      allSections = [...allSections, ...uniqueDbResults];
      console.log(`Found ${dbResults.length} results in database (${uniqueDbResults.length} unique)`);
    }
  }
  
  return {
    sections: allSections.slice(0, 10),
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

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { messages, conversationId, caseType, country = 'india' } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      throw new Error('Messages array is required');
    }

    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop();
    const userQuery = lastUserMessage?.content || '';

    // Perform cascading search
    console.log(`Starting cascading legal search for ${country}:`, userQuery);
    const { sections: relevantSections, sources } = await cascadingLegalSearch(
      supabase,
      userQuery,
      caseType || 'Criminal',
      country,
      3
    );
    
    console.log(`Found ${relevantSections.length} relevant sections from sources: ${sources.join(', ')}`);
    
    const legalContext = relevantSections.length > 0
      ? relevantSections
          .map(s => `**${s.section}: ${s.title}** [Source: ${s.source}]\n${s.content}`)
          .join('\n\n')
      : 'No specific legal provisions found. Please provide more details about your case.';

    const sourcesNote = sources.length > 0
      ? `\n\n*Data retrieved from: ${sources.map(s => s.replace('_', ' ')).join(', ')}*`
      : '';

    const countryInfo = COUNTRY_INFO[country] || COUNTRY_INFO['india'];

    // System prompt with legal expertise
    const systemPrompt = `You are an expert legal assistant specializing in ${countryInfo.lawSystem} for ${countryInfo.name}.

**Your Responsibilities:**
1. Analyze case facts and identify applicable legal provisions for ${countryInfo.name}
2. Cite specific section numbers and law names
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
- Reference ${countryInfo.name} law specifically

**Relevant Legal Provisions for this Case (${countryInfo.name}):**
${legalContext}${sourcesNote}

**Case Type:** ${caseType || 'Not specified'}
**Jurisdiction:** ${countryInfo.name}

Remember: This is informational guidance only. Always advise users to consult with a qualified lawyer in ${countryInfo.name} for legal advice.`;

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

    if (messages.length <= 6) {
      requestBody.tools = [NER_TOOL];
      requestBody.tool_choice = "auto";
    }

    console.log('Sending request to Lovable AI with context:', {
      messageCount: messages.length,
      relevantSectionsCount: relevantSections.length,
      sources,
      caseType,
      country
    });

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
