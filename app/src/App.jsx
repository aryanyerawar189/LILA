import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box, Typography, Chip } from '@mui/material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import dayjs from 'dayjs';
import Sidebar from './components/Sidebar';
import MapCanvas from './components/MapCanvas';
import HeatmapOverlay from './components/HeatmapOverlay';
import Timeline from './components/Timeline';
import Legend from './components/Legend';
import DashboardCards from './components/DashboardCards';
import ChatSidebar from './components/ChatSidebar';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#818cf8' },
    background: {
      default: '#0f1117',
      paper: '#18181b',
    },
  },
  typography: {
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { overflow: 'hidden' },
      },
    },
  },
});

const CANVAS_SIZE = 800;

const DEFAULT_EVENTS = {
  Kill: true,
  Killed: true,
  BotKill: true,
  BotKilled: true,
  KilledByStorm: true,
  Loot: true,
};

// Convert dayjs date to our folder-name format
function dateToKey(d) {
  return `February_${d.date()}`;
}

// Get all date keys between start and end (inclusive)
function getDateRange(start, end) {
  if (!start || !end) return [];
  const dates = [];
  let current = start;
  while (current.isBefore(end) || current.isSame(end, 'day')) {
    dates.push(dateToKey(current));
    current = current.add(1, 'day');
  }
  return dates;
}

export default function App() {
  const [index, setIndex] = useState(null);
  const [selectedMap, setSelectedMap] = useState('AmbroseValley');
  const [startDate, setStartDate] = useState(dayjs('2025-02-10'));
  const [endDate, setEndDate] = useState(dayjs('2025-02-10'));
  const [selectedMatch, setSelectedMatch] = useState('__all__');
  const [enabledEvents, setEnabledEvents] = useState(DEFAULT_EVENTS);
  const [showHumans, setShowHumans] = useState(true);
  const [showBots, setShowBots] = useState(true);
  const [heatmapType, setHeatmapType] = useState('none');
  const [rawData, setRawData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);

  // Compute which date keys are selected
  const selectedDateKeys = useMemo(() => {
    return getDateRange(startDate, endDate);
  }, [startDate, endDate]);

  // Load index
  useEffect(() => {
    fetch('/data/index.json')
      .then(r => r.json())
      .then(setIndex)
      .catch(err => console.error('Failed to load index:', err));
  }, []);

  // Load data for all dates in range
  useEffect(() => {
    setLoading(true);
    setRawData(null);
    setSelectedMatch('__all__');
    setCurrentTime(0);
    setPlaying(false);

    if (!selectedMap || selectedDateKeys.length === 0) {
      setRawData([]);
      setLoading(false);
      return;
    }

    const urls = selectedDateKeys.map(dk => `/data/${selectedMap}_${dk}.json`);

    Promise.all(
      urls.map(url =>
        fetch(url)
          .then(r => {
            if (!r.ok) return [];
            return r.json();
          })
          .catch(() => [])
      )
    )
      .then(results => {
        const merged = results.flat();
        setRawData(merged);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load data:', err);
        setRawData([]);
        setLoading(false);
      });
  }, [selectedMap, selectedDateKeys]);

  // Format date range for display
  const dateRangeLabel = useMemo(() => {
    if (!startDate || !endDate) return 'Select Date Range';
    const s = startDate.format('MMM D');
    const e = endDate.format('MMM D');
    return s === e ? s : `${s} – ${e}`;
  }, [startDate, endDate]);

  // Available matches
  const availableMatches = useMemo(() => {
    if (!index?.matches) return [];
    return Object.entries(index.matches)
      .filter(([, v]) => v.map === selectedMap && selectedDateKeys.includes(v.date))
      .map(([k]) => k)
      .sort();
  }, [index, selectedMap, selectedDateKeys]);

  // Process events with relative time
  const processedEvents = useMemo(() => {
    if (!rawData) return [];
    let subset = rawData;
    if (selectedMatch !== '__all__') {
      subset = rawData.filter(e => e.match_id === selectedMatch);
    }
    if (subset.length === 0) return [];
    const minTs = Math.min(...subset.map(e => e.ts));
    return subset.map(e => ({ ...e, relativeTime: e.ts - minTs }));
  }, [rawData, selectedMatch]);

  // Max time
  const maxTime = useMemo(() => {
    if (processedEvents.length === 0) return 0;
    return Math.max(...processedEvents.map(e => e.relativeTime));
  }, [processedEvents]);

  useEffect(() => {
    if (selectedMatch !== '__all__') {
      setCurrentTime(maxTime);
    } else {
      setCurrentTime(0);
    }
    setPlaying(false);
  }, [selectedMatch, maxTime]);

  // Visible events
  const visibleEvents = useMemo(() => {
    if (selectedMatch === '__all__') return processedEvents;
    return processedEvents.filter(e => e.relativeTime <= currentTime);
  }, [processedEvents, currentTime, selectedMatch]);

  // Callbacks
  const handleToggleEvent = useCallback((key) => {
    setEnabledEvents(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);
  
  const handleSelectAllEvents = useCallback(() => {
    const all = {};
    Object.keys(DEFAULT_EVENTS).forEach(k => all[k] = true);
    setEnabledEvents(all);
  }, []);

  const handleDeselectAllEvents = useCallback(() => {
    const none = {};
    Object.keys(DEFAULT_EVENTS).forEach(k => none[k] = false);
    setEnabledEvents(none);
  }, []);

  const handleResetAll = useCallback(() => {
    setSelectedMap('');
    setStartDate(null);
    setEndDate(null);
    setSelectedMatch('__all__');
    const none = {};
    Object.keys(DEFAULT_EVENTS).forEach(k => none[k] = false);
    setEnabledEvents(none);
    setShowHumans(false);
    setShowBots(false);
    setHeatmapType('none');
  }, []);

  const handlePlayPause = useCallback(() => setPlaying(p => !p), []);
  const handleTimeChange = useCallback((valOrFn) => {
    if (typeof valOrFn === 'function') setCurrentTime(valOrFn);
    else setCurrentTime(valOrFn);
  }, []);

  const handleStartDateChange = useCallback((newDate) => {
    if (!newDate || !newDate.isValid()) return;
    setStartDate(newDate);
    if (newDate.isAfter(endDate)) setEndDate(newDate);
  }, [endDate]);

  const handleEndDateChange = useCallback((newDate) => {
    if (!newDate || !newDate.isValid()) return;
    setEndDate(newDate);
    if (newDate.isBefore(startDate)) setStartDate(newDate);
  }, [startDate]);

  const isPlaybackDisabled = selectedMatch === '__all__';

  useEffect(() => {
    if (selectedMatch === '__all__' && maxTime > 0) setCurrentTime(maxTime);
  }, [selectedMatch, maxTime]);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
        {/* Sidebar */}
        <Sidebar
          selectedMap={selectedMap}
          onMapChange={e => setSelectedMap(e.target.value)}
          startDate={startDate}
          onStartDateChange={handleStartDateChange}
          endDate={endDate}
          onEndDateChange={handleEndDateChange}
          selectedMatch={selectedMatch}
          onMatchChange={e => setSelectedMatch(e.target.value)}
          matches={availableMatches}
          enabledEvents={enabledEvents}
          onToggleEvent={handleToggleEvent}
          onSelectAllEvents={handleSelectAllEvents}
          onDeselectAllEvents={handleDeselectAllEvents}
          showHumans={showHumans}
          onToggleHumans={() => setShowHumans(p => !p)}
          showBots={showBots}
          onToggleBots={() => setShowBots(p => !p)}
          heatmapType={heatmapType}
          onHeatmapChange={setHeatmapType}
          loading={loading}
          onResetAll={handleResetAll}
        />

        {/* Main content */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Top bar */}
          <Box sx={{
            height: 48, borderBottom: 1, borderColor: 'divider',
            display: 'flex', alignItems: 'center', px: 3, gap: 2,
            bgcolor: 'rgba(24,24,27,0.6)', backdropFilter: 'blur(8px)',
          }}>
            <FiberManualRecordIcon sx={{ fontSize: 10, color: '#22c55e' }} />
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.8rem' }}>
              {selectedMap ? selectedMap.replace(/([A-Z])/g, ' $1').trim() : 'No Map Selected'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.disabled' }}>·</Typography>
            <Typography variant="body2" sx={{ color: 'text.disabled', fontSize: '0.8rem' }}>
              {dateRangeLabel}
            </Typography>
            {selectedDateKeys.length > 1 && (
              <Chip
                label={`${selectedDateKeys.length} days`}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.65rem', height: 20, color: 'text.secondary', borderColor: 'divider' }}
              />
            )}
            {selectedMatch !== '__all__' && (
              <Chip
                label={`Match ${selectedMatch.slice(0, 8)}…`}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontFamily: 'monospace', fontSize: '0.7rem', height: 24 }}
              />
            )}
            <Box sx={{ flex: 1 }} />
            {rawData && (
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                {rawData.length.toLocaleString()} total events loaded
              </Typography>
            )}
          </Box>

          {/* Map area */}
          <Box sx={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden',
          }}>
            {loading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 40, height: 40, border: 2, borderColor: 'primary.main',
                  borderTopColor: 'transparent', borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  '@keyframes spin': { to: { transform: 'rotate(360deg)' } },
                }} />
                <Typography variant="body2" color="text.secondary">Loading map data…</Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ position: 'relative', width: CANVAS_SIZE, height: CANVAS_SIZE }}>
                  <MapCanvas
                    mapId={selectedMap}
                    events={visibleEvents}
                    enabledEvents={enabledEvents}
                    showHumans={showHumans}
                    showBots={showBots}
                    canvasSize={CANVAS_SIZE}
                  />
                  <HeatmapOverlay
                    events={visibleEvents}
                    heatmapType={heatmapType}
                    canvasSize={CANVAS_SIZE}
                  />
                </Box>
                <Legend />
              </>
            )}
          </Box>

          {/* Timeline */}
          <Timeline
            currentTime={currentTime}
            maxTime={maxTime}
            playing={playing}
            onTimeChange={handleTimeChange}
            onPlayPause={handlePlayPause}
            disabled={isPlaybackDisabled}
          />

          {/* Dashboard Cards */}
          <DashboardCards events={visibleEvents} />
        </Box>

        <ChatSidebar />
      </Box>
    </ThemeProvider>
  );
}
