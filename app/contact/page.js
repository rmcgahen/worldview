export default function Contact() {
  return (
    <div style={{ fontFamily: "Georgia, serif" }} className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-2">
          Contact <span className="text-orange-500">Us</span>
        </h1>
        <p className="text-zinc-500 text-sm uppercase tracking-widest mb-10" style={{ fontFamily: "sans-serif" }}>
          Get In Touch
        </p>

        <div className="space-y-6 text-zinc-300 leading-relaxed">
          <p>
            Have a story tip, feedback, or partnership inquiry? We would love to hear from you.
          </p>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4" style={{ fontFamily: "sans-serif" }}>
            <div>
              <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">General Inquiries</div>
              <div className="text-orange-400 font-semibold">hello@theglobalrecord.com</div>
            </div>
            <div>
              <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Advertising</div>
              <div className="text-orange-400 font-semibold">ads@theglobalrecord.com</div>
            </div>
            <div>
              <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Newsletter</div>
              <div className="text-orange-400 font-semibold">newsletter@theglobalrecord.com</div>
            </div>
          </div>

          <p className="text-zinc-500 text-sm">
            We typically respond within 1-2 business days.
          </p>
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