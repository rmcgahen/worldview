export default function About() {
  return (
    <div style={{ fontFamily: "Georgia, serif" }} className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-2">
          About The Global <span className="text-orange-500">Record</span>
        </h1>
        <p className="text-zinc-500 text-sm uppercase tracking-widest mb-10" style={{ fontFamily: "sans-serif" }}>
          Our Mission
        </p>

        <div className="space-y-6 text-zinc-300 leading-relaxed">
          <p>
            The Global Record exists because most Americans have little access to what is 
            happening outside the United States — not because they don't care, but because 
            international news is rarely presented in a way that feels relevant to daily life.
          </p>
          <p>
            We pull stories from the world's most trusted international outlets — BBC News, 
            Al Jazeera, The Guardian, France 24, and Deutsche Welle — and use AI to explain 
            why each story matters to American readers. Every article includes plain-English 
            context, a "Why It Matters to You" section, and an analogy to make unfamiliar 
            situations feel understandable.
          </p>
          <p>
            Our goal is simple: help Americans understand the world they live in, one story 
            at a time.
          </p>
        </div>

        <div className="mt-12 border-t border-zinc-800 pt-8">
          <h2 className="text-white font-bold text-xl mb-4">Our Sources</h2>
          <ul className="space-y-2 text-zinc-400" style={{ fontFamily: "sans-serif" }}>
            {["BBC News", "Al Jazeera", "The Guardian", "France 24", "Deutsche Welle"].map(source => (
              <li key={source} className="flex items-center gap-2">
                <span className="text-orange-500">→</span> {source}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8">
          <a href="/" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">
            ← Back to News Feed
          </a>
        </div>
      </div>
    </div>
  );
}