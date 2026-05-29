import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  console.log("MARKER_SUPABASE_V2");
  console.log("NEWS ROUTE VERSION: supabase-v2");
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SECRET_KEY
    );

    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(12);

    if (error) throw new Error(error.message);

    const stories = (data || []).map(function(row) {
      return {
        id: row.id,
        originalTitle: row.original_title,
        source: row.source,
        originalSummary: row.summary,
        url: row.url,
        image: row.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80',
        publishedAt: row.published_at,
        countryFlag: row.country_flag || '🌍',
        category: 'World',
        slug: row.slug,
        localized: row.why_it_matters ? {
          headline: row.headline,
          whyItMatters: row.why_it_matters,
          summary: row.summary,
          analogy: row.analogy,
        } : null,
      };
    });

    return new Response(JSON.stringify({ stories: stories }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });

  } catch (error) {
    console.error("News route error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}