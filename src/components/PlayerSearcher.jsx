import React, { useState, useEffect } from 'react';
import Papa from "papaparse";
 
const PlayerSearcher = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [rankSearchTerm, setRankSearchTerm] = useState('');
  const [players, setPlayers] = useState([]);
  const [result, setResult] = useState(undefined);
  const [rankResults, setRankResults] = useState([]);
  const [playerID, setPlayerID] = useState(null);
  const [activeCsv, setActiveCsv] = useState('/players.csv');
 
  const filteredData = players.filter((item) =>
    item.NAME.toLowerCase().includes(searchTerm.toLowerCase())
  );
 
  // Re-fetch data whenever the activeCsv changes
  useEffect(() => {
    fetch(activeCsv)
      .then(r => r.text())
      .then(text => {
        const { data } = Papa.parse(text, { header: true, skipEmptyLines: true });
        setPlayers(data);
        // Reset search states when switching datasets
        setSearchTerm('');
        setRankSearchTerm('');
        setResult(undefined);
        setRankResults([]);
        setPlayerID(null);
      });
  }, [activeCsv]);
 
  // Helper to safely get the rank from Column A (falls back to first object key if header is empty)
  const getPlayerRank = (p) => {
    if (!p) return null;
    return parseInt(p.Rank || p[Object.keys(p)[0]], 10);
  };

  function findExactMatch(name) {
    const target = name.toLowerCase().trim();
    return players.find(player => player.NAME.toLowerCase() === target) || null;
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
      const exact = data.find(p => p.name.toLowerCase() === target);
      setPlayerID(exact?.playerId ?? null);
      
      // Total Stats 
      try {
        const turl = `/api-nhl/player/${exact.playerId}/landing`;
        const response = await fetch(turl);
        if (!response.ok) throw new Error('Failed to fetch player stats');
        
        const statsData = await response.json();
        
        // This gives you the comprehensive array of their yearly career stats
        const careerSeasonStats = statsData.seasonTotals || [];
        
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
    setRankSearchTerm('');
    setRankResults([]);
    const id = await IDSearch(name); 
    setResult(findExactMatch(name));
  }
 
  const handleNameSubmit = (e) => {
    e.preventDefault();
    runSearch(searchTerm);
  };
 
  const handleAuto = (e) => {
    runSearch(e.target.innerText);
  };

  const handleRankSubmit = (e) => {
    e.preventDefault();
    const term = rankSearchTerm.trim();
    if (!term) return;

    let matches = [];
    if (term.includes('-')) {
      const [startStr, endStr] = term.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      
      if (!isNaN(start) && !isNaN(end)) {
        matches = players.filter(p => {
          const r = getPlayerRank(p);
          return r >= start && r <= end;
        }).sort((a, b) => getPlayerRank(a) - getPlayerRank(b));
      }
    } else {
      const rank = parseInt(term, 10);
      if (!isNaN(rank)) {
        matches = players.filter(p => getPlayerRank(p) === rank);
      }
    }

    setRankResults(matches);
    setResult(undefined);
    setSearchTerm('');
  };
 
  // ii) reset result to undefined when user focuses inputs so lists reappear
  const handleFocusName = () => {
    setResult(undefined);
    setRankResults([]);
  };

  const handleFocusRank = () => {
    setResult(undefined);
  };
 
  return (
    <div className="flex flex-col items-center justify-center p-6 w-full mx-auto">
      
      {/* Dataset Selection Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        {[
          { label: 'Dataset 1', file: '/players.csv' },
          { label: 'Dataset 2', file: '/players2.csv' },
          { label: 'Dataset 3', file: '/players3.csv' },
          { label: 'Dataset 4', file: '/players4.csv' }
        ].map((dataset) => (
          <button
            key={dataset.file}
            type="button"
            onClick={() => setActiveCsv(dataset.file)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors border ${
              activeCsv === dataset.file
                ? 'bg-blue-500 text-white border-blue-600 shadow-sm'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {dataset.label}
          </button>
        ))}
      </div>

      <div className="w-full max-w-lg space-y-4">
        {/* Name Search Form */}
        <form onSubmit={handleNameSubmit}>
          <input
            type="text"
            placeholder="Search by player name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={handleFocusName}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </form>

        {/* Rank Search Form */}
        <form onSubmit={handleRankSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Search by Rank (e.g., 5 or 10-20)"
            value={rankSearchTerm}
            onChange={(e) => setRankSearchTerm(e.target.value)}
            onFocus={handleFocusRank}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <button 
            type="submit"
            className="px-6 py-2 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors"
          >
            Search Rank
          </button>
        </form>
      </div>
 
      {/* Name Autofill Dropdown */}
      {searchTerm && result === undefined && rankResults.length === 0 && (
        <ul className="w-full mt-4 bg-white border border-gray-200 rounded-lg divide-y divide-gray-100 shadow-sm max-w-lg max-h-60 overflow-y-auto">
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

      {/* Rank Search Results List */}
      {rankResults.length > 0 && result === undefined && (
        <div className="w-full mt-4 bg-white border border-gray-200 rounded-lg shadow-sm max-w-lg overflow-hidden">
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-600">
            Rank Results ({rankResults.length} found)
          </div>
          <ul className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
            {rankResults.map((p, i) => (
              <li 
                key={i} 
                className="px-4 py-3 hover:bg-blue-50 transition-colors cursor-pointer flex justify-between items-center" 
                onClick={() => runSearch(p.NAME)}
              >
                <span className="font-medium text-gray-800">{p.NAME}</span>
                <span className="text-gray-500 font-mono text-sm bg-gray-100 px-2 py-1 rounded">Rank: #{getPlayerRank(p)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
 
      {/* Single Player Result Card */}
      {result && (
        <div className="bg-slate-800/40 border border-slate-700/60 rounded-lg p-10 mt-6 w-full">
          <div className="flex items-center gap-4 mb-4">
            {/* Displaying Rank as a visual badge */}
            {getPlayerRank(result) && (
               <div className="bg-amber-400 text-slate-900 font-display text-2xl px-3 py-1 rounded-md shadow-sm">
                 #{getPlayerRank(result)}
               </div>
            )}
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

      {rankResults.length === 0 && rankSearchTerm && result === undefined && !searchTerm && (
        <p className="font-mono text-sm text-slate-500 mt-6 tracking-widest">No players found for rank "{rankSearchTerm}"</p>
      )}
    </div>
  );
};
 
export default PlayerSearcher;