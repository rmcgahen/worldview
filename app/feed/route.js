import Parser from 'rss-parser';

export const dynamic = 'force-dynamic'

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
  if (item.enclosure && item.enclosure.url) {
    return item.enclosure.url;
  }
  return null;
}

// Strips emoji and special characters that break XML
function cleanText(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/[\u{1F300}-\u{1FFFF}]/gu, '')
    .replace(/[\u{2700}-\u{27BF}]/gu, '')
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\uD7FF\uE000-\uFFFD]/gu, '')
    .trim();
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
          };
        });
      })
    );

    var allStories = [];
    feedResults.forEach(function(result) {
      if (result.status === 'fulfilled') {
        allStories = allStories.concat(result.value);
      }
    });

    var stories = allStories
      .filter(function(s) {
        return s.title && s.description && s.description.length > 30 && s.url;
      })
      .sort(function(a, b) {
        return new Date(b.publishedAt) - new Date(a.publishedAt);
      })
      .slice(0, 20);

    var baseUrl = 'https://theglobalrecord.com';
    var today = new Date().toUTCString();

    var items = stories.map(function(story) {
      var imageTag = '';
      if (story.image) {
        var cleanUrl = story.image.replace(/&/g, '&amp;');
        imageTag = '<enclosure url="' + cleanUrl + '" length="0" type="image/jpeg" />';
      }

      return [
        '<item>',
        '<title><![CDATA[' + (story.title || '') + ' via ' + story.source + ']]></title>',
        '<description><![CDATA[' + (story.description || '') + ']]></description>',
        '<link>' + cleanText(story.url) + '</link>',
        '<guid isPermaLink="true">' + cleanText(story.url) + '</guid>',
        '<pubDate>' + new Date(story.publishedAt).toUTCString() + '</pubDate>',
        '<source url="' + cleanText(story.url) + '">' + cleanText(story.source) + '</source>',
        imageTag,
        '</item>',
      ].join('');
    }).join('\n');

    var rss = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">',
      '<channel>',
      '<title>The Global Record</title>',
      '<link>' + baseUrl + '</link>',
      '<description>International news explained for American readers</description>',
      '<language>en-us</language>',
      '<lastBuildDate>' + today + '</lastBuildDate>',
      '<atom:link href="' + baseUrl + '/feed" rel="self" type="application/rss+xml" />',
      items,
      '</channel>',
      '</rss>',
    ].join('\n');

    return new Response(rss, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });

  } catch (error) {
    console.error("RSS feed error:", error.message);
    return new Response('Error generating feed', { status: 500 });
  }
}