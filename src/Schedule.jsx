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
    <div className={`rounded-md p-2.5 flex flex-col gap-1 h-full border text-center transition-all duration-150 hover:scale-[1.03] hover:z-10 relative
      ${isLive ? "bg-emerald-900/40 border-emerald-500/50" : ""}
      ${isFinal && won ? "bg-slate-800/60 border-slate-600/40" : ""}
      ${isFinal && lost ? "bg-slate-900/40 border-slate-700/30" : ""}
      ${!hasScore ? "bg-slate-800/50 border-slate-700/40" : ""}`}>
      {isLive && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
      <div className="font-mono text-[10px] text-amber-500 uppercase tracking-widest">{isHome ? "vs" : "@"}{"|"}{formatTime(game.start_time)}</div>
      <img
        src={`/logos/${opponent}.png`}
        alt={opponent}
        className="w-10 h-10 object-contain mx-auto"
        onError={e => { e.target.replaceWith(Object.assign(document.createElement('span'), { textContent: opponent, className: 'font-display text-xl tracking-wider text-slate-100' })) }}
      />
      {hasScore ? (
        <div className={`font-mono text-sm font-medium ${won ? "text-emerald-400" : lost ? "text-red-400/80" : "text-slate-400"}`}>{myScore}–{theirScore}</div>
      ) : (
        <div className="font-mono text-[10px] text-amber-400/70 tracking-wide">{}</div>
      )}
      {isFinal && (
        <div className={`font-mono text-[9px] tracking-widest uppercase ${won ? "text-emerald-500/70" : "text-slate-600"}`}>{won ? "W" : lost ? "L" : "T"}</div>
      )}
    </div>
  );
}
 
function PickupValueCell({ value }) {
  if (value === null || value === undefined) {
    return <div className="h-full w-full flex items-center justify-center font-mono text-[10px] text-slate-700">—</div>;
  }
  
  let color = "text-slate-100";
  let bg = "bg-slate-800/60 border-slate-700/50";
  
  if (value <= 1.2) {
    color = "text-red-600";
    bg = "bg-red-950/60 border-red-900/50";
  } else if (value < 1.8) {
    color = "text-red-400";
    bg = "bg-red-900/30 border-red-800/40";
  } else if (value <= 2.2) {
    // Treat around 2 as neutral/white
    color = "text-slate-100";
    bg = "bg-slate-800/60 border-slate-700/50";
  } else if (value < 3.0) {
    color = "text-emerald-400";
    bg = "bg-emerald-900/30 border-emerald-800/40";
  } else {
    color = "text-emerald-500";
    bg = "bg-emerald-950/50 border-emerald-900/50";
  }

  return (
    <div className={`rounded-md p-2.5 h-full border flex flex-col items-center justify-center gap-0.5 ${bg}`}>
      <div className={`font-mono text-lg font-medium ${color}`}>{value.toFixed(2)}</div>
      <div className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">value</div>
    </div>
  );
}
 
export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [sortOrder, setSortOrder] = useState(null); // 'desc', 'asc', or null
 
  useEffect(() => {
    Promise.all([
      fetch("weekly_games.json").then(r => { if (!r.ok) throw new Error(); return r.json(); }),
      fetch("pickup_values.json").then(r => r.ok ? r.json() : []).catch(() => []),
    ]).then(([games, pickups]) => {
      const dateSet = [...new Set(games.map(g => g.date))].sort();
      const teamSet = new Set();
      games.forEach(g => { teamSet.add(g.away); teamSet.add(g.home); });
      const teams = [...teamSet].sort();
      const lookup = {};
      teams.forEach(t => { lookup[t] = {}; });
      games.forEach(g => { lookup[g.away][g.date] = g; lookup[g.home][g.date] = g; });
 
      const pickupLookup = {};
      pickups.forEach(p => { pickupLookup[p.team] = p.pickup_value; });
 
      setData({ dates: dateSet, teams, lookup, pickupLookup });
    }).catch(() => setError(true));
  }, []);

  const handleSortClick = () => {
    if (sortOrder === null) setSortOrder('desc');
    else if (sortOrder === 'desc') setSortOrder('asc');
    else setSortOrder(null);
  };

  let displayedTeams = [];
  let top3 = [];
  let bottom3 = [];

  if (data) {
    displayedTeams = [...data.teams];
    
    if (sortOrder === 'desc') {
      displayedTeams.sort((a, b) => (data.pickupLookup[b] || 0) - (data.pickupLookup[a] || 0));
    } else if (sortOrder === 'asc') {
      displayedTeams.sort((a, b) => (data.pickupLookup[a] || 0) - (data.pickupLookup[b] || 0));
    }

    const teamsWithPU = data.teams
      .filter(t => data.pickupLookup[t] !== undefined && data.pickupLookup[t] !== null)
      .map(t => ({ team: t, value: data.pickupLookup[t] }))
      .sort((a, b) => b.value - a.value);

    top3 = teamsWithPU.slice(0, 3);
    bottom3 = [...teamsWithPU].reverse().slice(0, 3);
  }
 
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg,#fff,#fff 1px,transparent 1px,transparent 48px),repeating-linear-gradient(90deg,#fff,#fff 1px,transparent 1px,transparent 48px)" }} />
      <div className="relative max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8 pb-4 border-b border-slate-700/80 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h1 className="font-display text-5xl tracking-widest text-white">Weekly Schedule</h1>
            <p className="font-mono text-xs text-slate-500 tracking-widest mt-1 uppercase">Team Schedule · All times Eastern</p>
          </div>
          {data && <p className="font-mono text-xs text-slate-500 tracking-widest uppercase">{data.teams.length} teams · {data.dates.length} days</p>}
        </header>
        <div className="w-full bg-slate-800/40 border-b border-slate-700/60 py-8 mb-8 text-center">
          <h1 className="font-display text-4xl md:text-5xl tracking-widest text-amber-400 drop-shadow-sm">
            Week 8
          </h1>
          <p className="font-mono text-sm text-slate-500 uppercase tracking-widest mt-3">
            2026-27 Fantasy Hockey Season
          </p>
        </div>
 
        {error && (
          <div className="text-center mt-20 font-mono text-sm text-slate-400 leading-8">
            <p className="text-red-400 mb-2">Could not load weekly_games.json</p>
            <p>Run <code className="bg-slate-800 px-2 py-0.5 rounded text-amber-400">python nhl_weekly.py</code> then place the file in <code className="bg-slate-800 px-2 py-0.5 rounded text-amber-400">public/</code></p>
          </div>
        )}
        {!error && !data && <p className="text-center text-slate-500 font-mono text-sm mt-20 animate-pulse tracking-widest">Loading schedule...</p>}
 
        {data && (
          <>
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-md p-5">
                <h3 className="font-display text-lg text-emerald-400 tracking-widest mb-4 uppercase text-center border-b border-emerald-900/50 pb-2">Top 3 PU Teams</h3>
                <div className="flex flex-col gap-3">
                  {top3.map((t, i) => (
                    <div key={t.team} className="flex justify-between items-center bg-slate-800/60 px-4 py-2.5 rounded border border-slate-700/50">
                      <span className="font-mono text-slate-300 flex items-center">
                        <span className="text-slate-500 mr-3">{i + 1}.</span>
                        <img
                          src={`/logos/${t.team}.png`}
                          alt={t.team}
                          className="w-6 h-6 object-contain mr-2"
                          onError={e => { e.target.replaceWith(Object.assign(document.createElement('span'), { textContent: t.team, className: 'font-display text-sm tracking-wider text-slate-100 mr-2' })) }}
                        />
                        {t.team}
                      </span>
                      <span className="font-mono text-emerald-400 font-medium">{t.value.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-md p-5">
                <h3 className="font-display text-lg text-red-400 tracking-widest mb-4 uppercase text-center border-b border-red-900/50 pb-2">Bottom 3 PU Teams</h3>
                <div className="flex flex-col gap-3">
                  {bottom3.map((t, i) => (
                    <div key={t.team} className="flex justify-between items-center bg-slate-800/60 px-4 py-2.5 rounded border border-slate-700/50">
                      <span className="font-mono text-slate-300 flex items-center">
                        <span className="text-slate-500 mr-3">{i + 1}.</span>
                        <img
                          src={`/logos/${t.team}.png`}
                          alt={t.team}
                          className="w-6 h-6 object-contain mr-2"
                          onError={e => { e.target.replaceWith(Object.assign(document.createElement('span'), { textContent: t.team, className: 'font-display text-sm tracking-wider text-slate-100 mr-2' })) }}
                        />
                        {t.team}
                      </span>
                      <span className="font-mono text-red-400 font-medium">{t.value.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse" style={{ minWidth: `${180 + data.dates.length * 110 + 120}px` }}>
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
                    <th 
                      onClick={handleSortClick}
                      className="pb-3 pl-3 text-center min-w-[110px] border-l border-slate-700/50 cursor-pointer group hover:bg-slate-800/40 transition-colors rounded-t-md"
                    >
                      <div className="font-display text-lg tracking-widest text-violet-400 flex items-center justify-center gap-1">
                        PU Val
                        <span className="text-sm w-3">
                          {sortOrder === 'desc' ? '↓' : sortOrder === 'asc' ? '↑' : '↕'}
                        </span>
                      </div>
                      <div className="font-mono text-[10px] text-slate-500 group-hover:text-violet-400/70 transition-colors">Pickup</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayedTeams.map((team, ti) => (
                    <tr key={team} className={ti % 2 === 0 ? "bg-slate-800/10" : ""}>
                      <td className="py-1.5 pr-4 align-middle">
                        <div className="flex items-center gap-2">
                          <div className="w-px h-6 bg-amber-500/40" />
                          <img
                            src={`/logos/${team}.png`}
                            alt={team}
                            className="w-8 h-8 object-contain"
                            onError={e => { e.target.replaceWith(Object.assign(document.createElement('span'), { textContent: team, className: 'font-display text-xl tracking-wider text-slate-100' })) }}
                          />
                          <span className="font-display text-2xl tracking-widest text-slate-100">{team}</span>
                        </div>
                      </td>
                      {data.dates.map(date => (
                        <td key={date} className="py-1.5 px-1.5 align-middle h-20">
                          <GameCell game={data.lookup[team][date] || null} team={team} />
                        </td>
                      ))}
                      <td className="py-1.5 pl-3 px-1.5 align-middle h-20 border-l border-slate-700/50">
                        <PickupValueCell value={data.pickupLookup[team] ?? null} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}