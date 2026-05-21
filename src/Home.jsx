export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg,#fff,#fff 1px,transparent 1px,transparent 48px),repeating-linear-gradient(90deg,#fff,#fff 1px,transparent 1px,transparent 48px)" }} />
 
      <div className="relative max-w-7xl mx-auto px-4 py-8 flex flex-col gap-10">
 
        <header className="pb-4 border-b border-slate-700/80 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h1 className="font-display text-5xl tracking-widest text-white">Lucas' Fantasy Page</h1>
            <p className="font-mono text-xs text-slate-500 tracking-widest mt-1 uppercase">NHL Fantasy Tools</p>
          </div>
        </header>
 
        <section>
          <div className="flex items-center gap-4 mb-4">
            <h2 className="font-display text-2xl tracking-widest text-amber-400">What does this page do?</h2>
            <div className="flex-1 h-px bg-slate-700/60" />
          </div>
          <p className="font-mono text-sm text-slate-400 leading-7">
            This site hosts tools to make you make better decisions on choosing players for your fantasy teams
          </p>
        </section>
 
        <section>
          <div className="flex items-center gap-4 mb-4">
            <h2 className="font-display text-2xl tracking-widest text-amber-400">What are the tools?</h2>
            <div className="flex-1 h-px bg-slate-700/60" />
          </div>
          <p className="font-mono text-sm text-slate-400 leading-7">
            As of now there is only the Weekly schedule that will tell you what teams are the most optimal to pick up players from. 
            Things under construction are player lookup pages that will display projections and dollar values for auction drafts.
          </p>
        </section>
 
        <section>
          <div className="flex items-center gap-4 mb-4">
            <h2 className="font-display text-2xl tracking-widest text-amber-400">How does it work?</h2>
            <div className="flex-1 h-px bg-slate-700/60" />
          </div>
          <p className="font-mono text-sm text-slate-400 leading-7">
            I use statistical methods like binomial distribution percentiles to figure out what the odds are that a free spot on your roster will be filled by this teams players
          </p>
        </section>
 
      </div>
    </div>
  );
}
