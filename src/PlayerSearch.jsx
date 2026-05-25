import PlayerSearcher from "./components/PlayerSearcher"
export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg,#fff,#fff 1px,transparent 1px,transparent 48px),repeating-linear-gradient(90deg,#fff,#fff 1px,transparent 1px,transparent 48px)" }} />
 
      <div className="relative max-w-7xl mx-auto px-4 py-8 flex flex-col gap-10">
 
        <header className="pb-4 border-b border-slate-700/80 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h1 className="font-display text-5xl tracking-widest text-white">Player Search</h1>
            <p className="font-mono text-xs text-slate-500 tracking-widest mt-1 uppercase">Find players stats</p>
          </div>
        </header>
        <PlayerSearcher />
        
    </div>
    </div>
  );
}
