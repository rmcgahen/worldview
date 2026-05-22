export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    // Security check — only allow calls from our cron job
//    const authHeader = request.headers.get('authorization');
//    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
//      return Response.json({ error: 'Unauthorized' }, { status: 401 });
//    }

    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const beehiivKey = process.env.BEEHIIV_API_KEY;
    const publicationId = process.env.BEEHIIV_PUBLICATION_ID;

    if (!anthropicKey) throw new Error("ANTHROPIC_API_KEY is not set");
    if (!beehiivKey) throw new Error("BEEHIIV_API_KEY is not set");
    if (!publicationId) throw new Error("BEEHIIV_PUBLICATION_ID is not set");

    // Step 1 — Fetch today's top 5 stories
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://theglobalrecord.com';
    const newsRes = await fetch(`${baseUrl}/api/news`, { cache: 'no-store' });
    const newsData = await newsRes.json();

    if (!newsData.stories || newsData.stories.length === 0) {
      throw new Error("No stories found");
    }

    const top5 = newsData.stories.slice(0, 5);

    // Step 2 — Localize each story with Claude
    const localizedStories = await Promise.all(
      top5.map(async (story) => {
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
  "summary": "2-3 sentence plain-English summary"
}`,
              messages: [{
                role: "user",
                content: `Localize for US readers:\nTitle: ${story.originalTitle}\nSummary: ${story.originalSummary}\nSource: ${story.source}`
              }]
            }),
          });

          const aiData = await aiRes.json();
          const text = aiData.content.map(i => i.text || "").join("");
          const clean = text.replace(/```json|```/g, "").trim();
          const localized = JSON.parse(clean);

          return {
            flag: story.countryFlag || "🌍",
            source: story.source,
            headline: localized.headline,
            whyItMatters: localized.whyItMatters,
            summary: localized.summary,
            url: story.url,
          };
        } catch (err) {
          return {
            flag: story.countryFlag || "🌍",
            source: story.source,
            headline: story.originalTitle,
            whyItMatters: "",
            summary: story.originalSummary,
            url: story.url,
          };
        }
      })
    );

    // Step 3 — Build the newsletter HTML
    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const storiesHtml = localizedStories.map((story, i) => `
      <div style="margin-bottom: 32px; padding-bottom: 32px; border-bottom: 1px solid #27272a;">
        <div style="font-size: 12px; color: #f97316; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; font-family: sans-serif;">
          ${story.flag} ${story.source}
        </div>
        <h2 style="font-size: 20px; font-weight: 700; color: #ffffff; margin: 0 0 12px 0; line-height: 1.3; font-family: Georgia, serif;">
          ${story.headline}
        </h2>
        ${story.whyItMatters ? `
        <div style="background: rgba(249, 115, 22, 0.1); border-left: 3px solid #f97316; padding: 12px 16px; margin-bottom: 12px; border-radius: 0 8px 8px 0;">
          <div style="font-size: 11px; color: #f97316; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; font-family: sans-serif;">
            🇺🇸 Why It Matters to You
          </div>
          <p style="font-size: 14px; color: #d4d4d8; margin: 0; line-height: 1.6; font-family: sans-serif;">
            ${story.whyItMatters}
          </p>
        </div>
        ` : ''}
        <p style="font-size: 14px; color: #a1a1aa; margin: 0 0 12px 0; line-height: 1.6; font-family: sans-serif;">
          ${story.summary}
        </p>
        <a href="${story.url}" style="font-size: 13px; color: #f97316; font-weight: 600; text-decoration: none; font-family: sans-serif;">
          Read Full Story →
        </a>
      </div>
    `).join('');

    const newsletterHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="background-color: #09090b; margin: 0; padding: 0; font-family: Georgia, serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 24px;">
          
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 40px; padding-bottom: 32px; border-bottom: 1px solid #27272a;">
            <h1 style="font-size: 32px; font-weight: 700; color: #ffffff; margin: 0 0 4px 0; letter-spacing: -1px;">
              The Global <span style="color: #f97316;">Record</span>
            </h1>
            <p style="font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 3px; margin: 0; font-family: sans-serif;">
              ${today}
            </p>
          </div>

          <!-- Intro -->
          <p style="font-size: 16px; color: #a1a1aa; margin: 0 0 32px 0; line-height: 1.7; font-family: sans-serif;">
            Good morning. Here are today's top international stories explained for American readers — with a clear answer to why each one matters to you.
          </p>

          <!-- Stories -->
          ${storiesHtml}

          <!-- Footer -->
          <div style="text-align: center; padding-top: 32px; border-top: 1px solid #27272a;">
            <a href="https://theglobalrecord.com" style="font-size: 14px; color: #f97316; font-weight: 700; text-decoration: none; font-family: sans-serif;">
              Visit The Global Record
            </a>
            <p style="font-size: 12px; color: #52525b; margin: 16px 0 0 0; font-family: sans-serif;">
              The Global Record · theglobalrecord.com<br>
              International news explained for American readers.
            </p>
          </div>

        </div>
      </body>
      </html>
    `;

    // Step 4 — Send via Beehiiv API
    const subject = `🌍 The Global Record — ${today}`;

    const beehiivRes = await fetch(
      `https://api.beehiiv.com/v2/publications/${publicationId}/posts`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${beehiivKey}`,
        },
        body: JSON.stringify({
  title: subject,
  subject: subject,
  content_html: newsletterHtml,
          status: "confirmed",
          send_at: new Date().toISOString(),
          audience: "all",
          content_tags: ["daily-brief"],
        }),
      }
    );

    const beehiivData = await beehiivRes.json();

    if (!beehiivRes.ok) {
      throw new Error(`Beehiiv API error: ${JSON.stringify(beehiivData)}`);
    }

    return Response.json({
      success: true,
      message: "Newsletter sent successfully",
      storiesCount: localizedStories.length,
      beehiivPostId: beehiivData.data?.id,
    });

  } catch (error) {
    console.error("Newsletter error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}