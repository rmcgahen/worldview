import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(18);

    if (error) throw new Error(error.message);

    const stories = (data || []).map(function(row) {
      return {
        id: row.id,
        originalTitle: row.original_title,
        headline: row.headline || row.original_title,
        source: row.source,
        relevance: row.relevance,
        url: row.url,
        publishedAt: row.published_at,
        countryFlag: row.country_flag || '🌍',
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