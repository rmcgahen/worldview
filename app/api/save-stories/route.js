import Parser from 'rss-parser';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic'

const RSS_FEEDS = [
  { url: 'http://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC News', flag: '🇬🇧' },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera', flag: '🌍' },
  { url: 'https://www.theguardian.com/world/rss', source: 'The Guardian', flag: '🇬🇧' },
  { url: 'https://feeds.france24.com/rss/en/news', source: 'France 24', flag: '🇫🇷' },
  { url: 'https://rss.dw.com/rdf/rss-en-all', source: 'Deutsche Welle', flag: '🇩🇪' },
];

const US_KEYWORDS = [
  'trump', 'biden', 'congress', 'senate', 'republican', 'democrat',
  'white house', 'washington dc', 'supreme court', 'nascar', 'nfl',
  'nba', 'mlb', 'los angeles', 'new york', 'california', 'texas',
  'florida', 'chicago', 'houston', 'pentagon', 'cia', 'fbi',
];

function isUSStory(title, description) {
  const text = (title + ' ' + description).toLowerCase();
  const matches = US_KEYWORDS.filter(function(k) { return text.includes(k); });
  return matches.length >= 2;
}

function extractImage(item) {
  if (item.mediaContent && item.mediaContent.$ && item.mediaContent.$.url) return item.mediaContent.$.url;
  if (item.enclosure && item.enclosure.url) return item.enclosure.url;
  return null;
}

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

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SECRET_KEY
    );

    const parser = new Parser({
      customFields: { item: [['media:content', 'mediaContent'], ['media:thumbnail', 'mediaThumbnail']] },
    });

    // Fetch all feeds
    const feedResults = await Promise.allSettled(
      RSS_FEEDS.map(async function(feed) {
        const parsed = await parser.parseURL(feed.url);
        return parsed.items.map(function(item) {
          return {
            title: item.title || '',
            description: item.contentSnippet || item.summary || '',
            url: item.link || '',
            image: extractImage(item),
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
      .filter(function(s) {
        return s.title && s.description && s.description.length > 30 && s.url && !isUSStory(s.title, s.description);
      })
      .sort(function(a, b) { return new Date(b.publishedAt) - new Date(a.publishedAt); })
      .slice(0, 15);

    let savedCount = 0;
    let skippedCount = 0;

    for (const story of candidates) {
      // Check if this story URL already exists
      const existing = await supabase
        .from('stories')
        .select('id')
        .eq('url', story.url)
        .maybeSingle();

      if (existing.data) {
        skippedCount++;
        continue;
      }

      // Localize with Claude
      let localized = null;
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
            max_tokens: 400,
            system: `You are an international news editor making global stories accessible to American audiences. Return ONLY a valid JSON object, no markdown:
{
  "headline": "Punchy US-friendly headline under 12 words",
  "whyItMatters": "1-2 sentences on direct US relevance",
  "summary": "2-3 sentence plain-English summary",
  "analogy": "One-sentence analogy using something familiar to Americans"
}`,
            messages: [{
              role: "user",
              content: `Localize for US readers:\nTitle: ${story.title}\nSummary: ${story.description}\nSource: ${story.source}`
            }]
          }),
        });

        const aiData = await aiRes.json();
        const text = aiData.content.map(function(i) { return i.text || ""; }).join("");
        const clean = text.replace(/```json|```/g, "").trim();
        localized = JSON.parse(clean);
      } catch (err) {
        console.log("Claude failed for:", story.title, err.message);
      }

      // Save to Supabase
      const slug = makeSlug(story.title) + '-' + Date.now().toString().slice(-5);

      const insertResult = await supabase.from('stories').insert({
        original_title: story.title,
        headline: localized ? localized.headline : story.title,
        why_it_matters: localized ? localized.whyItMatters : null,
        summary: localized ? localized.summary : story.description,
        analogy: localized ? localized.analogy : null,
        source: story.source,
        country_flag: story.flag,
        url: story.url,
        image: story.image,
        slug: slug,
        published_at: new Date(story.publishedAt).toISOString(),
      });

      if (insertResult.error) {
        console.log("Insert error:", insertResult.error.message);
      } else {
        savedCount++;
      }
    }

    return Response.json({
      success: true,
      saved: savedCount,
      skipped: skippedCount,
      checked: candidates.length,
    });

  } catch (error) {
    console.error("Save stories error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}