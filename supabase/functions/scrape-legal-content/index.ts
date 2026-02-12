const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScrapedSection {
  section: string;
  title: string;
  content: string;
  keywords: string[];
  category: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Input validation
    const MAX_QUERY_LENGTH = 200;
    const VALID_SEARCH_TYPES = ['sections', 'acts', 'keywords'];
    
    const query = typeof body.query === 'string' ? body.query.trim().slice(0, MAX_QUERY_LENGTH) : '';
    if (!query) {
      return new Response(JSON.stringify({ error: 'Search query is required (max 200 chars)' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const searchType = VALID_SEARCH_TYPES.includes(body.searchType) ? body.searchType : 'sections';

    console.log(`Scraping India Code for: ${query}`);

    // Scrape India Code website
    const searchUrl = `https://www.indiacode.nic.in/search/results.php?query=${encodeURIComponent(query)}&searchtype=${searchType}`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from India Code: ${response.status}`);
    }

    const html = await response.text();
    
    // Parse the HTML to extract legal sections
    const sections = parseIndiaCodeHTML(html);
    
    console.log(`Scraped ${sections.length} sections from India Code`);

    return new Response(
      JSON.stringify({ success: true, sections }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Scraping error:', error);
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

function parseIndiaCodeHTML(html: string): ScrapedSection[] {
  const sections: ScrapedSection[] = [];
  
  // Extract section patterns from HTML
  // Pattern 1: Section XXX - Title
  const sectionPattern = /Section\s+(\d+[A-Z]?)\s*[-–—]\s*([^\n<]+)/gi;
  const matches = html.matchAll(sectionPattern);
  
  for (const match of matches) {
    const sectionNumber = match[1].trim();
    const title = match[2].trim().replace(/<[^>]*>/g, '');
    
    // Extract content near this section
    const startIndex = match.index || 0;
    const contextLength = 500;
    const contextStart = Math.max(0, startIndex - 100);
    const contextEnd = Math.min(html.length, startIndex + contextLength);
    const context = html.substring(contextStart, contextEnd)
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Generate keywords from title
    const keywords = title
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 3)
      .slice(0, 5);
    
    sections.push({
      section: `Section ${sectionNumber}`,
      title,
      content: context,
      keywords,
      category: determineCategoryFromTitle(title),
    });
  }
  
  // Pattern 2: IPC/CrPC Section XXX
  const ipcPattern = /(IPC|CrPC|CPC)\s+Section\s+(\d+[A-Z]?)/gi;
  const ipcMatches = html.matchAll(ipcPattern);
  
  for (const match of ipcMatches) {
    const act = match[1];
    const sectionNumber = match[2].trim();
    
    const startIndex = match.index || 0;
    const contextLength = 500;
    const contextStart = Math.max(0, startIndex);
    const contextEnd = Math.min(html.length, startIndex + contextLength);
    const context = html.substring(contextStart, contextEnd)
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    sections.push({
      section: `${act} Section ${sectionNumber}`,
      title: extractTitleFromContext(context),
      content: context,
      keywords: extractKeywordsFromContext(context),
      category: act === 'CrPC' ? 'Criminal Procedure' : 'Criminal',
    });
  }
  
  return sections;
}

function determineCategoryFromTitle(title: string): string {
  const titleLower = title.toLowerCase();
  if (titleLower.includes('murder') || titleLower.includes('death') || 
      titleLower.includes('homicide') || titleLower.includes('assault')) {
    return 'Criminal';
  }
  if (titleLower.includes('police') || titleLower.includes('arrest') || 
      titleLower.includes('investigation') || titleLower.includes('fir')) {
    return 'Criminal Procedure';
  }
  if (titleLower.includes('property') || titleLower.includes('contract') || 
      titleLower.includes('civil')) {
    return 'Civil';
  }
  return 'Criminal';
}

function extractTitleFromContext(context: string): string {
  // Extract first sentence or first 100 chars as title
  const firstSentence = context.match(/^[^.!?]+[.!?]/);
  if (firstSentence) {
    return firstSentence[0].trim();
  }
  return context.substring(0, 100).trim() + '...';
}

function extractKeywordsFromContext(context: string): string[] {
  const words = context.toLowerCase().split(/\s+/);
  const stopWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'shall']);
  
  const filtered = words.filter(w => w.length > 3 && !stopWords.has(w));
  const wordCounts = new Map<string, number>();
  
  filtered.forEach(word => {
    wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
  });
  
  return Array.from(wordCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
}
