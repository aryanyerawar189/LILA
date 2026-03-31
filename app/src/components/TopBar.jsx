import React from 'react';

const MAPS = [
  { id: 'AmbroseValley', label: 'Ambrose Valley' },
  { id: 'GrandRift', label: 'Grand Rift' },
  { id: 'Lockdown', label: 'Lockdown' },
];

const DATES = [
  'February_10', 'February_11', 'February_12', 'February_13', 'February_14',
];

function formatDate(d) {
  return d.replace('_', ' ');
}

export default function TopBar({
  selectedMap, onMapChange,
  selectedDate, onDateChange,
  selectedMatch, onMatchChange,
  matches,
  loading,
  totalEvents,
}) {
  return (
    <header className="h-14 border-b border-white/[0.06] flex items-center px-5 gap-1 bg-zinc-950/80 backdrop-blur-md z-20 relative">
      {/* Brand */}
      <div className="flex items-center gap-3 mr-6">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div>
          <h1 className="text-sm font-semibold text-white leading-none">LILA</h1>
          <p className="text-[10px] text-zinc-500 leading-none mt-0.5">Level Analytics</p>
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-white/[0.06] mr-4" />

      {/* Map selector — pill buttons */}
      <div className="flex items-center bg-zinc-900 rounded-lg p-0.5 gap-0.5">
        {MAPS.map(m => (
          <button
            key={m.id}
            onClick={() => onMapChange(m.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all
              ${selectedMap === m.id
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300'
              }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-white/[0.06] mx-3" />

      {/* Date selector — compact pills */}
      <div className="flex items-center bg-zinc-900 rounded-lg p-0.5 gap-0.5">
        {DATES.map(d => {
          const day = d.split('_')[1];
          return (
            <button
              key={d}
              onClick={() => onDateChange(d)}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all
                ${selectedDate === d
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
                }`}
              title={formatDate(d)}
            >
              Feb {day}
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-white/[0.06] mx-3" />

      {/* Match selector */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Match</span>
        <select
          value={selectedMatch}
          onChange={e => onMatchChange(e.target.value)}
          className="bg-zinc-900 border border-white/[0.06] rounded-lg px-3 py-1.5 text-xs text-zinc-300
                     focus:outline-none focus:ring-1 focus:ring-indigo-500/50 appearance-none cursor-pointer
                     min-w-[140px]"
          style={{
            colorScheme: 'dark',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' fill='%2371717a' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 8px center',
          }}
        >
          <option value="__all__">All Matches</option>
          {matches.map(m => (
            <option key={m} value={m}>{m.slice(0, 8)}…</option>
          ))}
        </select>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Loading & event count */}
      <div className="flex items-center gap-3">
        {loading && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[11px] text-zinc-500">Loading…</span>
          </div>
        )}
        {totalEvents > 0 && (
          <div className="text-right">
            <span className="text-xs font-mono font-medium text-zinc-400">
              {totalEvents.toLocaleString()}
            </span>
            <span className="text-[10px] text-zinc-600 ml-1">events</span>
          </div>
        )}
      </div>
    </header>
  );
}
