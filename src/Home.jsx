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
            <h2 className="font-display text-2xl tracking-widest text-amber-400">Welcome!</h2>
            <div className="flex-1 h-px bg-slate-700/60" />
          </div>
          <p className="font-mono text-sm text-slate-400 leading-7">
            This site has some tools for you to use for fantasy hockey. Below are Descriptions of the tools and how they work.
          </p>
        </section>
 
        <section>
          <div className="flex items-center gap-4 mb-4">
            <h2 className="font-display text-2xl tracking-widest text-amber-400">Weekly Schedule</h2>
            <div className="flex-1 h-px bg-slate-700/60" />
          </div>
          <p className="font-mono text-sm text-slate-400 leading-7">
            The weekly schedule page shows you what teams are playing each day of the week and how many games they have. This is useful for figuring out what players to pick up for your fantasy team. The Pickup Value column gives a number that represents how many games a player from that team is expected to play on an average fantasy roster (fills up a missing slot) during that week.
          </p>
        </section>
                <section>
          <div className="flex items-center gap-4 mb-4">
            <h2 className="font-display text-2xl tracking-widest text-amber-400">Player Search</h2>
            <div className="flex-1 h-px bg-slate-700/60" />
          </div>
          <p className="font-mono text-sm text-slate-400 leading-7">
            The player search page allows you to search for a player and see stats about them. These include this and last seasons point totals, and their projected fantasy points for the current season. It also shows you their Fair Market Value, which is how much an average performing manager would pay in an auction draft for that player. The VORP (Value Over Replacement Player) is a measure of how much better a player is than a replacement level player at the same position. A positive VORP means the player is better than a replacement level player, while a negative VORP means the player is worse than a replacement level player.
          </p>
        </section>
        <section>
          <div className="flex items-center gap-4 mb-4">
            <h2 className="font-display text-2xl tracking-widest text-amber-400">How does it work?</h2>
            <div className="flex-1 h-px bg-slate-700/60" />
          </div>
          <p className="font-mono text-sm text-slate-400 leading-7">
            I use statistical methods like binomial distribution percentiles to figure out what the odds are that a free spot on your roster will be filled by this teams players. For the auction value part I made a custom function to determine the player value.
          </p>
        </section>
 
      </div>
    </div>
  );
}
