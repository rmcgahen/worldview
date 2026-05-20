export default function Privacy() {
  return (
    <div style={{ fontFamily: "Georgia, serif" }} className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-2">
          Privacy <span className="text-orange-500">Policy</span>
        </h1>
        <p className="text-zinc-500 text-sm uppercase tracking-widest mb-10" style={{ fontFamily: "sans-serif" }}>
          Last updated: May 2026
        </p>

        <div className="space-y-8 text-zinc-300 leading-relaxed" style={{ fontFamily: "sans-serif" }}>
          <div>
            <h2 className="text-white font-bold text-lg mb-3">1. Information We Collect</h2>
            <p>The Global Record does not collect personal information unless you voluntarily subscribe to our newsletter. If you subscribe, we collect your email address solely for the purpose of sending you our daily news digest.</p>
          </div>

          <div>
            <h2 className="text-white font-bold text-lg mb-3">2. Cookies and Advertising</h2>
            <p>This site uses Google AdSense to display advertisements. Google AdSense may use cookies to serve ads based on your prior visits to this website or other websites. You may opt out of personalized advertising by visiting Google Ads Settings at google.com/settings/ads.</p>
          </div>

          <div>
            <h2 className="text-white font-bold text-lg mb-3">3. Third Party Services</h2>
            <p>We aggregate news content from BBC News, Al Jazeera, The Guardian, France 24, and Deutsche Welle. We use Anthropic Claude AI to summarize and contextualize news stories for American readers. We do not share your personal data with these services.</p>
          </div>

          <div>
            <h2 className="text-white font-bold text-lg mb-3">4. Analytics</h2>
            <p>We may use analytics tools to understand how visitors use our site. This data is aggregated and anonymous and is used solely to improve the site experience.</p>
          </div>

          <div>
            <h2 className="text-white font-bold text-lg mb-3">5. Contact</h2>
            <p>If you have questions about this privacy policy please contact us at hello@theglobalrecord.com.</p>
          </div>
        </div>

        <div className="mt-8">
          <a href="/" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">
            Back to News Feed
          </a>
        </div>
      </div>
    </div>
  );
}