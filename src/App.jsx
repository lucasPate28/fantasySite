import { useState, useEffect } from "react";
 
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
 
function formatDayHeader(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return { short: DAYS[d.getDay()], date: d.toLocaleDateString("en-CA", { month: "short", day: "numeric" }) };
}
 
function formatTime(utc) {
  return new Date(utc).toLocaleTimeString("en-CA", {
    hour: "2-digit", minute: "2-digit",
    timeZone: "America/Toronto", hour12: true,
  });
}
 
function GameCell({ game, team }) {
  if (!game) return <div className="h-full w-full" />;
 
  const isHome = game.home === team;
  const opponent = isHome ? game.away : game.home;
  const isLive = game.state === "LIVE";
  const isFinal = game.state === "FINAL";
  const hasScore = isFinal || isLive;
  const myScore = isHome ? game.home_score : game.away_score;
  const theirScore = isHome ? game.away_score : game.home_score;
  const won = hasScore && myScore > theirScore;
  const lost = hasScore && myScore < theirScore;
 
  return (
    <div className={`
      rounded-md p-2.5 flex flex-col gap-1 h-full border text-center transition-all duration-150
      hover:scale-[1.03] hover:z-10 relative
      ${isLive ? "bg-emerald-900/40 border-emerald-500/50" : ""}
      ${isFinal && won ? "bg-slate-800/60 border-slate-600/40" : ""}
      ${isFinal && lost ? "bg-slate-900/40 border-slate-700/30" : ""}
      ${!hasScore ? "bg-slate-800/50 border-slate-700/40" : ""}
    `}>
      {isLive && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
 
      <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">
        {isHome ? "vs" : "@"}
      </div>
 
      <div className="font-display text-xl tracking-wider leading-none text-slate-100">
        {opponent}
      </div>
 
      {hasScore ? (
        <div className={`font-mono text-sm font-medium ${won ? "text-emerald-400" : lost ? "text-red-400/80" : "text-slate-400"}`}>
          {myScore}–{theirScore}
        </div>
      ) : (
        <div className="font-mono text-[10px] text-amber-400/70 tracking-wide">
          {formatTime(game.start_time)}
        </div>
      )}
 
      {isFinal && (
        <div className={`font-mono text-[9px] tracking-widest uppercase ${won ? "text-emerald-500/70" : "text-slate-600"}`}>
          {won ? "W" : lost ? "L" : "T"}
        </div>
      )}
    </div>
  );
}
 
export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
 
  useEffect(() => {
    fetch("weekly_games.json")
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(games => {
        // Collect all unique dates (sorted)
        const dateSet = [...new Set(games.map(g => g.date))].sort();
 
        // Collect all unique teams
        const teamSet = new Set();
        games.forEach(g => { teamSet.add(g.away); teamSet.add(g.home); });
        const teams = [...teamSet].sort();
 
        // Build lookup: team -> date -> game
        const lookup = {};
        teams.forEach(t => { lookup[t] = {}; });
        games.forEach(g => {
          lookup[g.away][g.date] = g;
          lookup[g.home][g.date] = g;
        });
 
        setData({ dates: dateSet, teams, lookup });
      })
      .catch(() => setError(true));
  }, []);
 
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg,#fff,#fff 1px,transparent 1px,transparent 48px),repeating-linear-gradient(90deg,#fff,#fff 1px,transparent 1px,transparent 48px)" }} />
 
      <div className="relative max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8 pb-4 border-b border-slate-700/80 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h1 className="font-display text-5xl tracking-widest text-white">🏒 NHL Weekly</h1>
            <p className="font-mono text-xs text-slate-500 tracking-widest mt-1 uppercase">Team Schedule · All times Eastern</p>
          </div>
          {data && (
            <p className="font-mono text-xs text-slate-500 tracking-widest uppercase">
              {data.teams.length} teams · {data.dates.length} days
            </p>
          )}
        </header>
 
        {error && (
          <div className="text-center mt-20 font-mono text-sm text-slate-400 leading-8">
            <p className="text-red-400 mb-2">Could not load weekly_games.json</p>
            <p>Run <code className="bg-slate-800 px-2 py-0.5 rounded text-amber-400">python nhl_weekly.py</code> then place the file in <code className="bg-slate-800 px-2 py-0.5 rounded text-amber-400">public/</code></p>
          </div>
        )}
 
        {!error && !data && (
          <p className="text-center text-slate-500 font-mono text-sm mt-20 animate-pulse tracking-widest">Loading schedule...</p>
        )}
 
        {data && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth: `${180 + data.dates.length * 110}px` }}>
              {/* Day headers */}
              <thead>
                <tr>
                  <th className="pb-3 pr-4 text-left w-[140px]">
                    <span className="font-mono text-[10px] text-slate-600 uppercase tracking-widest">Team</span>
                  </th>
                  {data.dates.map(date => {
                    const { short, date: label } = formatDayHeader(date);
                    return (
                      <th key={date} className="pb-3 px-1.5 text-center min-w-[100px]">
                        <div className="font-display text-lg tracking-widest text-amber-400">{short}</div>
                        <div className="font-mono text-[10px] text-slate-500">{label}</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
 
              {/* Team rows */}
              <tbody>
                {data.teams.map((team, ti) => (
                  <tr key={team} className={ti % 2 === 0 ? "bg-slate-800/10" : ""}>
                    {/* Team name */}
                    <td className="py-1.5 pr-4 align-middle">
                      <div className="flex items-center gap-2">
                        <div className="w-px h-6 bg-amber-500/40" />
                        <span className="font-display text-2xl tracking-widest text-slate-100">{team}</span>
                      </div>
                    </td>
 
                    {/* Game cells */}
                    {data.dates.map(date => (
                      <td key={date} className="py-1.5 px-1.5 align-middle h-20">
                        <GameCell game={data.lookup[team][date] || null} team={team} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
