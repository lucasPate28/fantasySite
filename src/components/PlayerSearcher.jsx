import React, { useState, useEffect } from 'react';
import Papa from "papaparse";
 
const PlayerSearcher = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [players, setPlayers] = useState([]);
  const [result, setResult] = useState(undefined);
  const [playerID, setPlayerID] = useState(null);
 
  const filteredData = players.filter((item) =>
    item.NAME.toLowerCase().includes(searchTerm.toLowerCase())
  );
 
  useEffect(() => {
    fetch("/players.csv")
      .then(r => r.text())
      .then(text => {
        const { data } = Papa.parse(text, { header: true, skipEmptyLines: true });
        setPlayers(data);
      });
  }, []);
 
  function binarySearch(name) {
    let lo = 0, hi = players.length - 1;
    const target = name.toLowerCase().trim();
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      const val = players[mid].NAME.toLowerCase();
      if (val === target) return players[mid];
      if (val < target) lo = mid + 1;
      else hi = mid - 1;
    }
    return null;
  }
 
  async function IDSearch(name) {
    console.log(`Searching for player ID with name: "${name}"`);
    const encodedQuery = encodeURIComponent(name.trim());
      const url = `/api-search/search/player?culture=en-us&limit=20&q=${encodedQuery}&active=true`;
      
      try {
        const response = await fetch(url);
        
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        console.log(data);
        const target = name.toLowerCase().trim();
        const exact = data.find(p =>
          p.name.toLowerCase() === target
        );
        setPlayerID(exact?.playerId ?? null);
        //Total Stats 
        
          try {
          const turl = `/api-nhl/player/${exact.playerId}/landing`;
          const response = await fetch(turl);
          if (!response.ok) throw new Error('Failed to fetch player stats');
          
          const data = await response.json();
          
          // This gives you the comprehensive array of their yearly career stats
          const careerSeasonStats = data.seasonTotals || [];
          
          // Filter to only look at regular season NHL data if needed
          const nhlRegularSeasons = careerSeasonStats.filter(
            (year) => year.leagueAbbrev === 'NHL' && year.gameTypeId === 2
          );
          console.log("NHL Regular Season Stats:", nhlRegularSeasons);
          return nhlRegularSeasons;
        } catch (error) {
          console.error("Error loading season stats:", error);
          return [];
        }
          } catch (err) {
            console.error(err);
            setPlayerID(null);
          }
  }
  
  // i) shared function called by both submit and autocomplete click
  async function runSearch(name) {
    setSearchTerm(name);
    const id = await IDSearch(name);  // wait for the real ID
         // pass it directly, not stale state
    setResult(binarySearch(name));
  }
 
  const handleSubmit = (e) => {
    e.preventDefault();
    runSearch(searchTerm);
  };
 
  const handleAuto = (e) => {
    runSearch(e.target.innerText);
  };
 
  // ii) reset result to undefined when user focuses input so list reappears
  const handleFocus = () => {
    setResult(undefined);
  };
 
  return (
    <div className="flex flex-col items-center justify-center p-6 w-full mx-auto">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Search for a player"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={handleFocus}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all max-w-lg"
        />
      </form>
 
      {searchTerm && result === undefined && (
        <ul className="w-full mt-4 bg-white border border-gray-200 rounded-lg divide-y divide-gray-100 shadow-sm max-w-lg">
          {filteredData.length > 0 ? (
            filteredData.map((item, index) => (
              <li key={index} className="px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer" onClick={handleAuto}>
                {item.NAME}
              </li>
            ))
          ) : (
            <li className="px-4 py-2.5 text-gray-400 text-center italic">No results found</li>
          )}
        </ul>
      )}
 
      {result && (
        <div className="bg-slate-800/40 border border-slate-700/60 rounded-lg p-10 mt-6 w-full">
          <div className="flex items-center gap-4 mb-4">
            <h2 className="font-display text-3xl tracking-widest text-amber-400">{result.NAME}</h2>
            <span className="font-mono text-s text-slate-500 uppercase tracking-widest border border-slate-700 rounded px-2 py-0.5">{result.POS}</span>
            <span className="font-mono text-md text-slate-500 uppercase tracking-widest">{result.TEAM}</span>
            <img
              src={`/logos/${result.TEAM}.png`}
              className="w-10 h-10 object-contain mx-auto"
              onError={e => { e.target.replaceWith(Object.assign(document.createElement('span'), { textContent: result.TEAM, className: 'font-display text-xl tracking-wider text-slate-100' })) }}
            />
            <div className="flex-1 h-px bg-slate-700/60" />
          </div>
          <div className="font-mono text-sm text-slate-500 uppercase tracking-widest mb-6">
            <span className="inline-flex items-center gap-1 text-red-400">Last Season's Stats (2025-26)&nbsp;</span>
            <span className="inline-flex items-center gap-1">G: {parseFloat(result.G)} &nbsp;</span>
            <span className="inline-flex items-center gap-1">A: {parseFloat(result.A).toFixed(1)} &nbsp;</span>
            <span className="inline-flex items-center gap-1">P: {parseFloat(result.PTS).toFixed(1)} &nbsp;</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-900/50 border border-slate-700/40 rounded-md p-4 flex flex-col gap-1">
              <span className="font-mono text-[18px] text-slate-500 uppercase tracking-widest">Fantasy Points</span>
              <span className="font-display text-3xl tracking-widest text-slate-100">{result.FP}</span>
            </div>
            <div className="bg-slate-900/50 border border-slate-700/40 rounded-md p-4 flex flex-col gap-1">
              <span className="font-mono text-[18px] text-slate-500 uppercase tracking-widest">Fair Market Value</span>
              <p className="font-mono text-[12px] text-slate-500 uppercase tracking-widest">How much an average performing manager would pay in Auction Draft</p>
              <span className="font-display text-3xl tracking-widest text-amber-400">{"$" + result["/$"]}</span>
            </div>
            <div className="bg-slate-900/50 border border-slate-700/40 rounded-md p-4 flex flex-col gap-1">
              <span className="font-mono text-[18px] text-slate-500 uppercase tracking-widest">VORP</span>
              <span className={`font-display text-3xl tracking-widest ${parseFloat(result.VORP) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {result.VORP}
              </span>
              {/* iii) Player ID label */}
              <span className="font-mono text-[12px] text-slate-500 uppercase tracking-widest mt-2">
                Player ID: <span className="text-slate-300">{playerID ?? "loading..."}</span>
              </span>
            </div>
          </div>
        </div>
      )}
 
      {result === null && searchTerm && (
        <p className="font-mono text-sm text-slate-500 mt-6 tracking-widest">No player found for "{searchTerm}"</p>
      )}
    </div>
  );
};
 
export default PlayerSearcher;
 
