import Parser from 'rss-parser';

export const dynamic = 'force-dynamic'
export const revalidate = 0

const RSS_FEEDS = [
  { url: 'http://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC News', flag: '🇬🇧' },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera', flag: '🌍' },
  { url: 'https://www.theguardian.com/world/rss', source: 'The Guardian', flag: '🇬🇧' },
  { url: 'https://feeds.france24.com/rss/en/news', source: 'France 24', flag: '🇫🇷' },
  { url: 'https://rss.dw.com/rdf/rss-en-all', source: 'Deutsche Welle', flag: '🇩🇪' },
];

function extractImage(item) {
  if (item.mediaContent && item.mediaContent.$ && item.mediaContent.$.url) {
    return item.mediaContent.$.url;
  }
  if (item.mediaThumbnail && item.mediaThumbnail.$ && item.mediaThumbnail.$.url) {
    return item.mediaThumbnail.$.url;
  }
  if (item.enclosure && item.enclosure.url) {
    return item.enclosure.url;
  }
  if (item.content || item.summary) {
    const html = item.content || item.summary;
    const match = html.match(/<img[^>]+src="([^">]+)"/);
    if (match) return match[1];
  }
  return 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80';
}

export async function GET() {
  try {
    const parser = new Parser({
      customFields: {
        item: [
          ['media:content', 'mediaContent'],
          ['media:thumbnail', 'mediaThumbnail'],
        ],
      },
    });

    const feedResults = await Promise.allSettled(
      RSS_FEEDS.map(async (feed) => {
        const parsed = await parser.parseURL(feed.url);
        return parsed.items.map(item => ({
          title: item.title,
          description: item.contentSnippet || item.summary || '',
          url: item.link,
          image: extractImage(item),
          publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
          source: feed.source,
          flag: feed.flag,
        }));
      })
    );

    let allStories = [];
    feedResults.forEach(result => {
      if (result.status === 'fulfilled') {
        allStories = allStories.concat(result.value);
      }
    });

    const stories = allStories
      .filter(s => s.title && s.description && s.description.length > 30)
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      .slice(0, 9)
      .map((story, index) => ({
        id: index + 1,
        originalTitle: story.title,
        source: story.source,
        originalSummary: story.description,
        url: story.url,
        image: story.image,
publishedAt: story.publishedAt,
        }),
        countryFlag: story.flag,
        category: "World",
        localized: null,
      }));

    if (stories.length === 0) throw new Error("No stories found");

    return new Response(JSON.stringify({ stories }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });

  } catch (error) {
    console.error("RSS feed error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}