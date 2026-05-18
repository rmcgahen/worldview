"use client";

import { useState, useEffect } from "react";

const FALLBACK_STORIES = [
  {
    id: 1,
    originalTitle: "Germany passes sweeping AI regulation framework",
    source: "Der Spiegel",
    country: "Germany",
    countryFlag: "🇩🇪",
    category: "Tech",
    originalSummary: "Germany's parliament approved new legislation requiring AI companies to register with federal authorities and submit to quarterly audits.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80",
    publishedAt: "2 hours ago",
    localized: null,
  },
  {
    id: 2,
    originalTitle: "Brazil raises interest rates to fight inflation",
    source: "Folha de S.Paulo",
    country: "Brazil",
    countryFlag: "🇧🇷",
    category: "Economy",
    originalSummary: "Brazil's central bank raised its benchmark rate to fight persistent inflation driven by food and energy prices.",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80",
    publishedAt: "4 hours ago",
    localized: null,
  },
  {
    id: 3,
    originalTitle: "Japan unveils $40 billion semiconductor investment plan",
    source: "Nikkei Asia",
    country: "Japan",
    countryFlag: "🇯🇵",
    category: "Tech",
    originalSummary: "Tokyo announced a new national fund to subsidize domestic chip manufacturing and attract foreign semiconductor investments.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
    publishedAt: "6 hours ago",
    localized: null,
  },
  {
    id: 4,
    originalTitle: "Australia mandates 82% renewable energy by 2030",
    source: "Sydney Morning Herald",
    country: "Australia",
    countryFlag: "🇦🇺",
    category: "Climate",
    originalSummary: "The Australian parliament passed legislation setting a binding renewable electricity target with $20 billion in grid infrastructure funding.",
    image: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=600&q=80",
    publishedAt: "10 hours ago",
    localized: null,
  },
];

function AdPlaceholder({ label, className }) {
  return (
    <div className={`border-2 border-dashed border-yellow-400/30 bg-yellow-400/5 rounded-xl flex items-center justify-center ${className}`}>
      <div className="text-center px-4">
        <div className="text-yellow-400/50 text-xs font-mono uppercase tracking-widest">Advertisement</div>
        <div className="text-yellow-400/30 text-xs mt-1">{label}</div>
      </div>
    </div>
  );
}

function StoryCard({ story }) {
  const loc = story.localized;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-orange-500/40 transition-all duration-300 group flex flex-col">
      <div className="relative overflow-hidden h-48 shrink-0">
        <img
          src={story.image}
          alt={story.originalTitle}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => { e.target.src = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/20 to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2 items-center">
          <span className="text-xl">{story.countryFlag || "🌍"}</span>
          <span className="text-xs px-2 py-1 rounded-full bg-zinc-800/80 text-zinc-300 border border-zinc-700">
            {story.category || "World"}
          </span>
        </div>
        <div className="absolute bottom-3 right-3 text-xs text-zinc-400">{story.publishedAt}</div>
      </div>

      <div className="p-5 flex flex-col flex-1 space-y-3">
        <div className="text-xs text-orange-400 font-semibold uppercase tracking-widest">
          {story.source} · {story.country || "International"}
        </div>

        {loc ? (
          <>
            <h3 className="text-white font-bold text-lg leading-snug">{loc.headline}</h3>
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3">
              <div className="text-orange-400 text-xs font-bold uppercase tracking-widest mb-1">
                🇺🇸 Why It Matters to You
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed">{loc.whyItMatters}</p>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed flex-1">{loc.summary}</p>
            {loc.analogy && (
              <div className="bg-zinc-800 rounded-xl p-3">
                <span className="text-yellow-400 text-xs font-bold">💡 THINK OF IT THIS WAY: </span>
                <span className="text-zinc-300 text-xs">{loc.analogy}</span>
              </div>
            )}
          </>
        ) : (
          <>
            <h3 className="text-white font-bold text-lg leading-snug">{story.originalTitle}</h3>
            <p className="text-zinc-400 text-sm leading-relaxed flex-1">{story.originalSummary}</p>
          </>
        )}

       {story.url && (
  <a href={story.url} target="_blank" rel="noopener noreferrer" className="inline-block text-orange-400 text-sm font-semibold hover:text-orange-300 transition-colors pt-1">
    Read Full Story →
  </a>
        )}
      </div>
    </div>
  );
}

export default function WorldView() {
  const [stories, setStories] = useState(FALLBACK_STORIES);
  const [loading, setLoading] = useState(true);
  const [newsError, setNewsError] = useState(null);
  const [tab, setTab] = useState("feed");

  useEffect(() => {
    fetch("/api/news")
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setNewsError(data.error);
          setStories(FALLBACK_STORIES);
        } else if (data.stories && data.stories.length > 0) {
          setStories(data.stories);
        }
      })
      .catch(() => {
        setNewsError("Could not fetch live news. Showing sample stories.");
        setStories(FALLBACK_STORIES);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ fontFamily: "Georgia, 'Times New Roman', serif" }} className="min-h-screen bg-zinc-950 text-white">

      {/* Top Ad Banner */}
      <div className="bg-zinc-950 border-b border-zinc-800 px-4 py-2">
        <AdPlaceholder label="Top Banner — Google AdSense 728×90" className="h-14 max-w-4xl mx-auto" />
      </div>

      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 style={{ letterSpacing: "-0.03em" }} className="text-3xl font-bold">
The Global <span className="text-orange-500">Record</span>            </h1>
            <p className="text-zinc-500 text-xs mt-0.5 tracking-widest uppercase" style={{ fontFamily: "sans-serif" }}>
              The World — Explained for You
            </p>
          </div>
          <button
            className="bg-orange-500 hover:bg-orange-400 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors"
            style={{ fontFamily: "sans-serif" }}
          >
            Subscribe Free
          </button>
        </div>
      </header>

      {/* Nav */}
      <nav className="border-b border-zinc-800 px-6" style={{ fontFamily: "sans-serif" }}>
        <div className="max-w-6xl mx-auto flex gap-6">
          {[
            { id: "feed", label: "📰 News Feed" },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`py-4 text-sm font-semibold border-b-2 transition-colors ${tab === t.id ? "border-orange-500 text-orange-400" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {tab === "feed" && (
          <div className="flex gap-8">
            {/* Stories */}
            <div className="flex-1 min-w-0">
              {newsError && (
                <div className="mb-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 text-yellow-400 text-sm" style={{ fontFamily: "sans-serif" }}>
                  ⚠️ {newsError}
                </div>
              )}

              {loading ? (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => (
      <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl h-80 animate-pulse">
        <div className="h-48 bg-zinc-800 rounded-t-2xl" />
        <div className="p-5 space-y-3">
          <div className="h-3 bg-zinc-800 rounded w-1/3" />
          <div className="h-5 bg-zinc-800 rounded w-full" />
          <div className="h-5 bg-zinc-800 rounded w-4/5" />
          <div className="h-16 bg-zinc-800 rounded" />
        </div>
      </div>
    ))}
  </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
  {stories.map((story, i) => (
    <StoryCard key={story.id} story={story} />
  ))}
  <div className="md:col-span-2">
    <AdPlaceholder label="Mid-Feed Native Ad — Highest CTR position" className="h-20 w-full" />
  </div>
</div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="w-72 shrink-0 hidden lg:block space-y-5" style={{ fontFamily: "sans-serif" }}>
              <AdPlaceholder label="Sidebar 300×250 — Premium CPM" className="h-64 w-full" />
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <h3 className="text-white font-bold mb-2">📬 Daily Brief</h3>
                <p className="text-zinc-400 text-sm mb-4">The world's top 5 stories explained for Americans — every morning.</p>
                <input
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 mb-3 focus:outline-none focus:border-orange-500"
                  placeholder="your@email.com"
                />
                <button className="w-full bg-orange-500 hover:bg-orange-400 text-white font-bold py-2 rounded-xl text-sm transition-colors">
                  Subscribe Free
                </button>
              </div>
              <AdPlaceholder label="Sidebar 300×600" className="h-96 w-full" />
            </aside>
          </div>
        )}


      </main>

      {/* Footer Ad */}
      <footer className="border-t border-zinc-800 px-6 py-8 mt-8">
        <div className="max-w-6xl mx-auto">
          <AdPlaceholder label="Footer Banner — Google AdSense 728×90" className="h-14 w-full mb-6" />
          <div className="flex items-center justify-between text-zinc-600 text-xs" style={{ fontFamily: "sans-serif" }}>
<span>The Global Record © 2026 — International News for Americans</span>            <span>Powered by Claude AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}