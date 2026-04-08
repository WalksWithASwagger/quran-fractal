import FractalVisualization from "@/components/FractalVisualization";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with Visualization */}
      <section className="h-screen">
        <FractalVisualization showControls={true} />
      </section>

      {/* Info Section */}
      <section className="bg-gradient-to-b from-[#0a0a12] to-[#14121e] py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-amber-400 mb-6 text-center">
            The Discovery
          </h2>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white/5 rounded-xl p-6 border border-amber-500/20">
              <h3 className="text-xl font-semibold text-amber-300 mb-3">The Muqatta&apos;at</h3>
              <p className="text-gray-300 leading-relaxed">
                29 chapters of the Quran begin with mysterious letter combinations known as the Muqatta&apos;at.
                For 1,400 years, their meaning has been debated. This project reveals a mathematical structure
                hidden within these letters.
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-amber-500/20">
              <h3 className="text-xl font-semibold text-amber-300 mb-3">The Pattern</h3>
              <p className="text-gray-300 leading-relaxed">
                When counting specific letters across their designated chapters, organized into 13 groups
                by shared initials, each total is independently divisible by 19 — the number explicitly
                mentioned in Quran 74:30.
              </p>
            </div>
          </div>

          {/* The Equation */}
          <div className="text-center mb-12">
            <div className="inline-block bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 rounded-2xl p-8 border border-amber-500/30">
              <div className="text-5xl font-bold text-amber-400 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                39,349 = 19² × P(29)
              </div>
              <div className="text-gray-400 space-y-1">
                <p><span className="text-amber-300">19²</span> = 361 (the square of the self-declared number)</p>
                <p><span className="text-cyan-300">P(29)</span> = 109 (the 29th prime number)</p>
                <p><span className="text-amber-300">29</span> = the number of Muqatta&apos;at chapters</p>
              </div>
            </div>
          </div>

          {/* Verification CTA */}
          <div className="text-center">
            <p className="text-2xl text-amber-400 font-semibold mb-4">
              &quot;Don&apos;t believe me. Count.&quot;
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="https://github.com/7430project/quran-fractal"
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 rounded-lg text-amber-400 transition-all"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                View Source Code
              </a>
              <a
                href="https://www.7430project.com"
                className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg text-cyan-400 transition-all"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a0a12] border-t border-amber-500/10 py-6 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div>
            © 2026 7430 Project · Open Source (MIT License)
          </div>
          <div>
            Data: <a href="https://tanzil.net" className="text-amber-400 hover:underline" target="_blank" rel="noopener noreferrer">Tanzil.net</a> (CC-BY 3.0)
          </div>
        </div>
      </footer>
    </div>
  );
}
