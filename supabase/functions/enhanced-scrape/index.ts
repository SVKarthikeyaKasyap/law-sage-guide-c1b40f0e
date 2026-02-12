const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced scraper using Cheerio-like parsing with regex
interface LegalSection {
  section: string;
  title: string;
  content: string;
  keywords: string[];
  category: string;
  source: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Input validation
    const MAX_TERMS = 10;
    const MAX_TERM_LENGTH = 100;
    let searchTerms: string[] = ['murder', 'theft', 'assault', 'rape', 'dowry', 'fraud'];
    
    if (Array.isArray(body.searchTerms)) {
      searchTerms = body.searchTerms
        .filter((t: unknown) => typeof t === 'string' && t.length > 0 && t.length <= MAX_TERM_LENGTH)
        .slice(0, MAX_TERMS);
      if (searchTerms.length === 0) {
        return new Response(JSON.stringify({ error: 'Invalid searchTerms: provide 1-10 valid strings' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }
    
    console.log('Starting comprehensive legal data scraping...');
    
    const allSections: LegalSection[] = [];
    
    // Scrape multiple sources
    for (const term of searchTerms) {
      console.log(`Scraping for term: ${term}`);
      
      // Method 1: Scrape from India Code
      const indiaCodeSections = await scrapeIndiaCode(term);
      allSections.push(...indiaCodeSections);
      
      // Method 2: Scrape from Indian Kanoon
      const indianKanoonSections = await scrapeIndianKanoon(term);
      allSections.push(...indianKanoonSections);
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Deduplicate sections
    const uniqueSections = deduplicateSections(allSections);
    
    console.log(`Total unique sections scraped: ${uniqueSections.length}`);

    return new Response(
      JSON.stringify({ success: true, sections: uniqueSections, count: uniqueSections.length }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Enhanced scraping error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function scrapeIndiaCode(searchTerm: string): Promise<LegalSection[]> {
  try {
    const url = `https://www.indiacode.nic.in/search-result.php?qt=${encodeURIComponent(searchTerm)}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml',
      },
    });

    if (!response.ok) {
      console.warn(`India Code fetch failed: ${response.status}`);
      return [];
    }

    const html = await response.text();
    return parseIndiaCodeHTML(html, 'India Code');
    
  } catch (error) {
    console.error('Error scraping India Code:', error);
    return [];
  }
}

async function scrapeIndianKanoon(searchTerm: string): Promise<LegalSection[]> {
  try {
    const url = `https://indiankanoon.org/search/?formInput=${encodeURIComponent(searchTerm)}+ipc`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml',
      },
    });

    if (!response.ok) {
      console.warn(`Indian Kanoon fetch failed: ${response.status}`);
      return [];
    }

    const html = await response.text();
    return parseIndianKanoonHTML(html, 'Indian Kanoon');
    
  } catch (error) {
    console.error('Error scraping Indian Kanoon:', error);
    return [];
  }
}

function parseIndiaCodeHTML(html: string, source: string): LegalSection[] {
  const sections: LegalSection[] = [];
  
  // Pattern for IPC/CrPC sections
  const sectionRegex = /(IPC|CrPC|CPC|BNS)\s+Section\s+(\d+[A-Z]?)[\s:.\-–—]*([^\n<]{10,200})/gi;
  const matches = html.matchAll(sectionRegex);
  
  for (const match of matches) {
    const act = match[1];
    const sectionNum = match[2].trim();
    const titleOrContent = match[3].trim().replace(/<[^>]*>/g, '').replace(/\s+/g, ' ');
    
    // Extract more context
    const startIdx = match.index || 0;
    const contextHTML = html.substring(startIdx, Math.min(html.length, startIdx + 1000));
    const cleanContext = contextHTML
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    const content = cleanContext.substring(0, 500);
    
    sections.push({
      section: `${act} Section ${sectionNum}`,
      title: titleOrContent.length > 100 ? titleOrContent.substring(0, 97) + '...' : titleOrContent,
      content,
      keywords: extractKeywords(titleOrContent + ' ' + content),
      category: act === 'CrPC' ? 'Criminal Procedure' : 'Criminal',
      source,
    });
  }
  
  return sections;
}

function parseIndianKanoonHTML(html: string, source: string): LegalSection[] {
  const sections: LegalSection[] = [];
  
  // Pattern for section references in judgments
  const sectionRegex = /Section\s+(\d+[A-Z]?)(?:\s+of\s+(?:the\s+)?(IPC|CrPC|CPC|Indian Penal Code|Code of Criminal Procedure))?/gi;
  const matches = html.matchAll(sectionRegex);
  
  const seen = new Set<string>();
  
  for (const match of matches) {
    const sectionNum = match[1].trim();
    const act = match[2] || 'IPC';
    const key = `${act}-${sectionNum}`;
    
    if (seen.has(key)) continue;
    seen.add(key);
    
    // Extract context around the section mention
    const startIdx = Math.max(0, (match.index || 0) - 200);
    const endIdx = Math.min(html.length, (match.index || 0) + 500);
    const contextHTML = html.substring(startIdx, endIdx);
    const cleanContext = contextHTML
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    sections.push({
      section: `${act} Section ${sectionNum}`,
      title: `Reference in case law`,
      content: cleanContext,
      keywords: extractKeywords(cleanContext),
      category: act.includes('CrPC') ? 'Criminal Procedure' : 'Criminal',
      source,
    });
  }
  
  return sections;
}

function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 
    'from', 'as', 'is', 'was', 'are', 'been', 'be', 'have', 'has', 'had', 'do', 
    'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 
    'can', 'shall', 'this', 'that', 'these', 'those', 'which', 'who', 'whom', 
    'whose', 'what', 'when', 'where', 'why', 'how', 'section', 'ipc', 'crpc'
  ]);
  
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w));
  
  const wordCounts = new Map<string, number>();
  words.forEach(word => {
    wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
  });
  
  return Array.from(wordCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word);
}

function deduplicateSections(sections: LegalSection[]): LegalSection[] {
  const seen = new Map<string, LegalSection>();
  
  for (const section of sections) {
    const key = section.section.toLowerCase().replace(/\s+/g, '');
    
    if (!seen.has(key) || section.content.length > (seen.get(key)?.content.length || 0)) {
      seen.set(key, section);
    }
  }
  
  return Array.from(seen.values());
}
