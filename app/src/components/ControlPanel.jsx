import React, { useState } from 'react';

/*
  ControlPanel — right-side, tab-based panel
  Tabs: Layers | Analyze | Info
  Keeps controls organized by analytical workflow, not dumped all at once.
*/

const EVENT_TYPES = [
  { key: 'Kill', label: 'Kill', color: '#f97316', desc: 'Player killed another player' },
  { key: 'Killed', label: 'Death', color: '#ef4444', desc: 'Player was killed' },
  { key: 'BotKill', label: 'Bot Kill', color: '#eab308', desc: 'Bot killed by player' },
  { key: 'BotKilled', label: 'Bot Death', color: '#7f1d1d', desc: 'Bot was killed' },
  { key: 'KilledByStorm', label: 'Storm Kill', color: '#a855f7', desc: 'Killed by storm zone' },
  { key: 'Loot', label: 'Loot', color: '#22c55e', desc: 'Item pickup' },
];

const HEATMAP_TYPES = [
  { key: 'none', label: 'Off', icon: '○' },
  { key: 'kill', label: 'Kills', icon: '🔥' },
  { key: 'death', label: 'Deaths', icon: '💀' },
  { key: 'traffic', label: 'Traffic', icon: '🗺️' },
];

export default function ControlPanel({
  enabledEvents, onToggleEvent,
  showHumans, onToggleHumans,
  showBots, onToggleBots,
  showPaths, onTogglePaths,
  heatmapType, onHeatmapChange,
  stats,
  selectedMatch,
}) {
  const [activeTab, setActiveTab] = useState('layers');

  const tabs = [
    { id: 'layers', label: 'Layers' },
    { id: 'analyze', label: 'Analyze' },
    { id: 'info', label: 'Info' },
  ];

  return (
    <aside className="w-[280px] min-w-[280px] h-full flex flex-col bg-zinc-950/60 border-l border-white/[0.06]">
      {/* Tabs */}
      <div className="flex border-b border-white/[0.06]">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-3 text-[11px] font-semibold uppercase tracking-widest transition-all border-b-2
              ${activeTab === t.id
                ? 'text-white border-indigo-500'
                : 'text-zinc-600 border-transparent hover:text-zinc-400'
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {activeTab === 'layers' && (
          <LayersTab
            enabledEvents={enabledEvents}
            onToggleEvent={onToggleEvent}
            showHumans={showHumans}
            onToggleHumans={onToggleHumans}
            showBots={showBots}
            onToggleBots={onToggleBots}
            showPaths={showPaths}
            onTogglePaths={onTogglePaths}
          />
        )}
        {activeTab === 'analyze' && (
          <AnalyzeTab
            heatmapType={heatmapType}
            onHeatmapChange={onHeatmapChange}
          />
        )}
        {activeTab === 'info' && (
          <InfoTab stats={stats} selectedMatch={selectedMatch} />
        )}
      </div>
    </aside>
  );
}

/* ─── LAYERS TAB ─── */
function LayersTab({ enabledEvents, onToggleEvent, showHumans, onToggleHumans, showBots, onToggleBots, showPaths, onTogglePaths }) {
  return (
    <>
      {/* Movement paths toggle */}
      <div>
        <SectionHeader>Movement Paths</SectionHeader>
        <div className="space-y-2 mt-2">
          <LayerToggle
            label="Show Paths"
            sublabel="Player movement trails"
            checked={showPaths}
            onChange={onTogglePaths}
            color="#818cf8"
          />
        </div>
      </div>

      {/* Player types */}
      <div>
        <SectionHeader>Player Type</SectionHeader>
        <div className="space-y-2 mt-2">
          <LayerToggle
            label="Humans"
            sublabel="Real player events"
            checked={showHumans}
            onChange={onToggleHumans}
            color="#3b82f6"
          />
          <LayerToggle
            label="Bots"
            sublabel="AI-controlled players"
            checked={showBots}
            onChange={onToggleBots}
            color="#ef4444"
          />
        </div>
      </div>

      {/* Event markers */}
      <div>
        <SectionHeader>Event Markers</SectionHeader>
        <div className="space-y-1 mt-2">
          {EVENT_TYPES.map(et => (
            <EventToggle
              key={et.key}
              label={et.label}
              desc={et.desc}
              color={et.color}
              checked={enabledEvents[et.key] ?? true}
              onChange={() => onToggleEvent(et.key)}
            />
          ))}
        </div>
      </div>
    </>
  );
}

/* ─── ANALYZE TAB ─── */
function AnalyzeTab({ heatmapType, onHeatmapChange }) {
  return (
    <>
      <div>
        <SectionHeader>Heatmap Overlay</SectionHeader>
        <p className="text-[11px] text-zinc-500 mt-1 mb-3">
          Overlay density visualization on the map to identify hotspots and problem areas.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {HEATMAP_TYPES.map(ht => (
            <button
              key={ht.key}
              onClick={() => onHeatmapChange(ht.key)}
              className={`p-3 rounded-xl border text-center transition-all
                ${heatmapType === ht.key
                  ? 'bg-indigo-500/10 border-indigo-500/40 ring-1 ring-indigo-500/20'
                  : 'bg-zinc-900/50 border-white/[0.06] hover:border-white/[0.12]'
                }`}
            >
              <span className="text-lg block mb-1">{ht.icon}</span>
              <span className={`text-[11px] font-medium block
                ${heatmapType === ht.key ? 'text-indigo-300' : 'text-zinc-400'}`}>
                {ht.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <SectionHeader>Quick Insights</SectionHeader>
        <div className="space-y-2 mt-2">
          <InsightCard
            icon="💡"
            title="Kill Zones"
            desc="Enable Kill heatmap to see high-lethality areas where players cluster and fight."
          />
          <InsightCard
            icon="🛤️"
            title="Dead Zones"
            desc="Use Traffic heatmap to find map regions players never visit — potential design issues."
          />
          <InsightCard
            icon="⚡"
            title="Storm Deaths"
            desc="Toggle only Storm Kill events to see where players get caught by the zone."
          />
        </div>
      </div>
    </>
  );
}

/* ─── INFO TAB ─── */
function InfoTab({ stats, selectedMatch }) {
  return (
    <>
      <div>
        <SectionHeader>Session Stats</SectionHeader>
        {stats ? (
          <div className="grid grid-cols-2 gap-2 mt-2">
            <StatCard label="Total Events" value={stats.totalEvents} />
            <StatCard label="Unique Players" value={stats.uniquePlayers} />
            <StatCard label="Kills" value={stats.kills} accent="text-orange-400" />
            <StatCard label="Deaths" value={stats.deaths} accent="text-red-400" />
          </div>
        ) : (
          <p className="text-xs text-zinc-500 mt-2">No data loaded</p>
        )}
      </div>

      <div>
        <SectionHeader>Legend</SectionHeader>
        <div className="space-y-2 mt-2">
          <LegendRow type="line" color="#3b82f6" label="Human movement path" />
          <LegendRow type="line" color="#ef4444" label="Bot movement path" />
          <div className="h-px bg-white/[0.04] my-2" />
          {EVENT_TYPES.map(et => (
            <LegendRow key={et.key} type="dot" color={et.color} label={et.label} />
          ))}
        </div>
      </div>

      {selectedMatch !== '__all__' && (
        <div>
          <SectionHeader>Selected Match</SectionHeader>
          <p className="text-[11px] font-mono text-zinc-400 mt-1 break-all">{selectedMatch}</p>
        </div>
      )}
    </>
  );
}

/* ─── Shared sub-components ─── */

function SectionHeader({ children }) {
  return (
    <h3 className="text-[10px] font-semibold tracking-[0.12em] uppercase text-zinc-500">
      {children}
    </h3>
  );
}

function LayerToggle({ label, sublabel, checked, onChange, color }) {
  return (
    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.02] cursor-pointer transition-colors group">
      <Switch checked={checked} onChange={onChange} color={color} />
      <div className="flex-1 min-w-0">
        <span className="text-xs font-medium text-zinc-300 group-hover:text-white transition-colors block">
          {label}
        </span>
        {sublabel && (
          <span className="text-[10px] text-zinc-600 block">{sublabel}</span>
        )}
      </div>
    </label>
  );
}

function EventToggle({ label, desc, color, checked, onChange }) {
  return (
    <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/[0.02] cursor-pointer transition-colors group">
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
      <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all
        ${checked ? 'border-transparent' : 'border-zinc-700'}`}
        style={{ backgroundColor: checked ? color : 'transparent' }}
      >
        {checked && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="white">
            <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-xs text-zinc-300 group-hover:text-white transition-colors">{label}</span>
      </div>
    </label>
  );
}

function Switch({ checked, onChange, color }) {
  return (
    <div className="relative flex-shrink-0" onClick={(e) => { e.preventDefault(); onChange(); }}>
      <div
        className="w-8 h-[18px] rounded-full transition-colors"
        style={{ backgroundColor: checked ? color : 'rgba(63,63,70,0.8)' }}
      />
      <div
        className={`absolute top-[3px] w-3 h-3 rounded-full bg-white transition-all shadow-sm
          ${checked ? 'left-[17px]' : 'left-[3px]'}`}
      />
    </div>
  );
}

function StatCard({ label, value, accent = 'text-white' }) {
  return (
    <div className="bg-zinc-900/60 rounded-xl p-3 border border-white/[0.04]">
      <p className="text-[9px] uppercase tracking-wider text-zinc-600 font-medium">{label}</p>
      <p className={`text-lg font-semibold ${accent} font-mono mt-0.5 leading-none`}>
        {typeof value === 'number' ? value.toLocaleString() : '—'}
      </p>
    </div>
  );
}

function InsightCard({ icon, title, desc }) {
  return (
    <div className="p-3 rounded-xl bg-zinc-900/40 border border-white/[0.04]">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm">{icon}</span>
        <span className="text-xs font-medium text-zinc-300">{title}</span>
      </div>
      <p className="text-[11px] text-zinc-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function LegendRow({ type, color, label }) {
  return (
    <div className="flex items-center gap-2.5">
      {type === 'line' ? (
        <div className="w-5 h-[2px] rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      ) : (
        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      )}
      <span className="text-[11px] text-zinc-500">{label}</span>
    </div>
  );
}
