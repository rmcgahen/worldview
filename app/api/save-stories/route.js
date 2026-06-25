import Parser from 'rss-parser';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic'

const RSS_FEEDS = [
  { url: 'http://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC News', flag: '🇬🇧' },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera', flag: '🌍' },
  { url: 'https://www.theguardian.com/world/rss', source: 'The Guardian', flag: '🇬🇧' },
  { url: 'https://feeds.france24.com/rss/en/news', source: 'France 24', flag: '🇫🇷' },
  { url: 'https://rss.dw.com/rdf/rss-en-all', source: 'Deutsche Welle', flag: '🇩🇪' },
  { url: 'https://www3.nhk.or.jp/rj/podcast/rss/english.xml', source: 'NHK World', flag: '🇯🇵' },
  { url: 'https://www.straitstimes.com/news/world/rss.xml', source: 'The Straits Times', flag: '🇸🇬' },
  { url: 'https://www.thehindu.com/news/international/feeder/default.rss', source: 'The Hindu', flag: '🇮🇳' },
  { url: 'https://www.cbc.ca/webfeed/rss/rss-world', source: 'CBC News', flag: '🇨🇦' },
  { url: 'https://www.abc.net.au/news/feed/51120/rss.xml', source: 'ABC Australia', flag: '🇦🇺' },
  { url: 'https://en.mercopress.com/rss/', source: 'MercoPress', flag: '🌎' },
  { url: 'https://www.batimes.com.ar/feed', source: 'Buenos Aires Times', flag: '🇦🇷' },
];

function makeSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) throw new Error("ANTHROPIC_API_KEY is not set");

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

    const parser = new Parser();

    const feedResults = await Promise.allSettled(
      RSS_FEEDS.map(async function(feed) {
        const parsed = await parser.parseURL(feed.url);
        return parsed.items.map(function(item) {
          return {
            title: item.title || '',
            description: item.contentSnippet || item.summary || '',
            url: item.link || '',
            publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
            source: feed.source,
            flag: feed.flag,
          };
        });
      })
    );

    let allStories = [];
    feedResults.forEach(function(result) {
      if (result.status === 'fulfilled') allStories = allStories.concat(result.value);
    });

    const candidates = allStories
      .filter(function(s) { return s.title && s.description && s.description.length > 20 && s.url; })
      .sort(function(a, b) { return new Date(b.publishedAt) - new Date(a.publishedAt); })
      .slice(0, 18);

    let savedCount = 0;
    let skippedCount = 0;

    for (const story of candidates) {
      const existing = await supabase.from('stories').select('id').eq('url', story.url).maybeSingle();
      if (existing.data) { skippedCount++; continue; }

      let headline = story.title;
      let relevance = null;
      try {
        const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": anthropicKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-6",
            max_tokens: 600,
            system: `You are an editor helping American readers understand international news. Return ONLY a valid JSON object, no markdown:
{
  "headline": "A clear, engaging American-friendly headline under 14 words",
  "relevance": "Two short paragraphs separated by \\n\\n explaining why this story matters to Americans (economic impact, security, prices, jobs, travel, or global context). Use original language only and do NOT quote or reproduce the article text. End the final sentence of the second paragraph by attributing the reporting to the source, so that the very last words of the paragraph before the closing period are the exact source name. For example: '...a shift American businesses will be watching closely, according to reporting from BBC News.' The source name must appear as the final words before the last period."
}`,
            messages: [{
              role: "user",
              content: `Headline: ${story.title}\nBrief context: ${story.description.slice(0, 200)}\nSource: ${story.source}\n\nWrite the American-relevance explanation, ending the second paragraph with attribution to ${story.source}.`
            }]
          }),
        });
        const aiData = await aiRes.json();
        const text = aiData.content.map(function(i) { return i.text || ""; }).join("");
        const clean = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);
        headline = parsed.headline || story.title;
        relevance = parsed.relevance || null;
      } catch (err) {
        console.log("Claude failed for:", story.title, err.message);
      }

      const slug = makeSlug(story.title) + '-' + Date.now().toString().slice(-5);

      const insertResult = await supabase.from('stories').insert({
        original_title: story.title,
        headline: headline,
        relevance: relevance,
        summary: null,
        source: story.source,
        country_flag: story.flag,
        url: story.url,
        image: null,
        slug: slug,
        published_at: new Date(story.publishedAt).toISOString(),
      });

      if (insertResult.error) {
        console.log("Insert error:", insertResult.error.message);
      } else {
        savedCount++;
      }
    }

    return Response.json({ success: true, saved: savedCount, skipped: skippedCount, checked: candidates.length });

  } catch (error) {
    console.error("Save stories error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}