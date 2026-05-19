export async function POST(request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return Response.json({ error: "ANTHROPIC_API_KEY is not set" }, { status: 500 });
    }

    const { title, summary, source } = await request.json();

    if (!title || !summary) {
      return Response.json({ error: "Missing title or summary" }, { status: 400 });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 400,
        system: `You are an international news editor making global stories accessible to American audiences. Return ONLY a valid JSON object, no markdown:
{
  "headline": "Punchy US-friendly headline under 12 words",
  "whyItMatters": "1 sentence on direct US relevance",
  "summary": "2 sentence plain-English summary",
  "analogy": "One-sentence analogy using something familiar to Americans"
}`,
        messages: [{
          role: "user",
          content: `Localize for US readers:\nTitle: ${title}\nSummary: ${summary.slice(0, 200)}\nSource: ${source}`
        }]
      }),
    });

    const data = await response.json();

    if (!data.content || !data.content[0]) {
      return Response.json({ error: `Claude error: ${JSON.stringify(data)}` }, { status: 500 });
    }

    const text = data.content.map(i => i.text || "").join("");
    const clean = text.replace(/```json|```/g, "").trim();
    const localized = JSON.parse(clean);

    return Response.json(localized);

  } catch (error) {
    console.error("Localize error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}