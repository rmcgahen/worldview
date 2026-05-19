export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const newsKey = process.env.NEWS_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    if (!newsKey) throw new Error("NEWS_API_KEY is not set");
    if (!anthropicKey) throw new Error("ANTHROPIC_API_KEY is not set");

    // Force no caching at all on the news fetch
    const res = await fetch(
      `https://newsapi.org/v2/top-headlines?sources=bbc-news,al-jazeera-english,the-guardian-uk&pageSize=12&apiKey=${newsKey}`,
      { cache: 'no-store' }
    );

    const data = await res.json();
    if (data.status !== "ok" || !data.articles) {
      throw new Error(data.message || "Failed to fetch news");
    }

const rawStories = data.articles
  .filter(a => a.title && a.description && a.urlToImage)
  .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    const localizedStories = await Promise.all(
      rawStories.map(async (article, index) => {
        try {
          const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            cache: 'no-store',
            headers: {
              "Content-Type": "application/json",
              "x-api-key": anthropicKey,
              "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
              model: "claude-sonnet-4-6",
              max_tokens: 1000,
              system: `You are an international news editor making global stories accessible to American audiences. Return ONLY a valid JSON object, no markdown:
{
  "headline": "Punchy US-friendly headline under 12 words",
  "whyItMatters": "1-2 sentences on direct US relevance",
  "summary": "2-3 sentence plain-English summary",
  "analogy": "One-sentence analogy using something familiar to Americans"
}`,
              messages: [{
                role: "user",
                content: `Localize for US readers:\nTitle: ${article.title}\nSummary: ${article.description}\nSource: ${article.source.name}`
              }]
            }),
          });

          const aiData = await aiRes.json();
          const text = aiData.content.map(i => i.text || "").join("");
          const clean = text.replace(/```json|```/g, "").trim();
          const localized = JSON.parse(clean);

          return {
            id: index + 1,
            originalTitle: article.title.replace(/\s*-\s*\w[\w\s]*$/, ""),
            source: article.source.name,
            originalSummary: article.description,
            url: article.url,
            image: article.urlToImage,
            publishedAt: new Date(article.publishedAt).toLocaleDateString("en-US", {
              month: "short", day: "numeric",
              hour: "2-digit", minute: "2-digit",
            }),
            country: "International",
            countryFlag: "🌍",
            category: "World",
            localized: {
              headline: localized.headline,
              whyItMatters: localized.whyItMatters,
              summary: localized.summary,
              analogy: localized.analogy,
            },
          };

        } catch (err) {
          console.log("Claude failed for:", article.title, err.message);
          return {
            id: index + 1,
            originalTitle: article.title.replace(/\s*-\s*\w[\w\s]*$/, ""),
            source: article.source.name,
            originalSummary: article.description,
            url: article.url,
            image: article.urlToImage,
            publishedAt: new Date(article.publishedAt).toLocaleDateString("en-US", {
              month: "short", day: "numeric",
              hour: "2-digit", minute: "2-digit",
            }),
            country: "International",
            countryFlag: "🌍",
            category: "World",
            localized: null,
          };
        }
      })
    );

    return new Response(JSON.stringify({ stories: localizedStories }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });

  } catch (error) {
    console.error("News API error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}