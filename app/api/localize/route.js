export async function GET() {
  try {
    const newsKey = process.env.NEWS_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    if (!newsKey) throw new Error("NEWS_API_KEY is not set");
    if (!anthropicKey) throw new Error("ANTHROPIC_API_KEY is not set");

    // Step 1 — Fetch the raw international stories
    const res = await fetch(
      `https://newsapi.org/v2/top-headlines?sources=bbc-news,al-jazeera-english,the-guardian-uk&pageSize=8&apiKey=${newsKey}`,
      { next: { revalidate: 900 } } // re-fetch every 15 minutes
    );

    const data = await res.json();
    if (data.status !== "ok" || !data.articles) {
      throw new Error(data.message || "Failed to fetch news");
    }

    const rawStories = data.articles.filter(
      a => a.title && a.description && a.urlToImage
    );

    // Step 2 — Localize every story with Claude automatically
    const localizedStories = await Promise.all(
      rawStories.map(async (article, index) => {
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
            // Original fields (kept in background)
            originalTitle: article.title,
            source: article.source.name,
            originalSummary: article.description,
            url: article.url,
            image: article.urlToImage,
            publishedAt: new Date(article.publishedAt).toLocaleDateString("en-US", {
              month: "short", day: "numeric",
              hour: "2-digit", minute: "2-digit"
            }),
            country: "International",
            countryFlag: "🌍",
            category: "World",
            // AI localized fields (shown automatically)
            localized: {
              headline: localized.headline,
              whyItMatters: localized.whyItMatters,
              summary: localized.summary,
              analogy: localized.analogy,
            }
          };

        } catch {
          // If AI fails for one story, fall back to original text
          return {
            id: index + 1,
            originalTitle: article.title.replace(/\s*-\s*\w[\w\s]*$/, ""),
            source: article.source.name,
            originalSummary: article.description,
            url: article.url,
            image: article.urlToImage,
            publishedAt: new Date(article.publishedAt).toLocaleDateString("en-US", {
              month: "short", day: "numeric",
              hour: "2-digit", minute: "2-digit"
            }),
            country: "International",
            countryFlag: "🌍",
            category: "World",
            localized: null,
          };
        }
      })
    );

    return Response.json({ stories: localizedStories });

  } catch (error) {
    console.error("News API error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}