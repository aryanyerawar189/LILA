import React from 'react';
import {
  Box, Typography, Select, MenuItem, FormControl,
  Checkbox, FormControlLabel, FormGroup, Switch, Radio, RadioGroup,
  Paper, CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import MapIcon from '@mui/icons-material/Map';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import PeopleIcon from '@mui/icons-material/People';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import BarChartIcon from '@mui/icons-material/BarChart';

const MIN_DATE = dayjs('2025-02-10');
const MAX_DATE = dayjs('2025-02-14');

// Only allow Feb 10-14
function shouldDisableDate(date) {
  if (!date) return false;
  const d = date.date();
  const m = date.month(); // 0-indexed, so Feb = 1
  return m !== 1 || d < 10 || d > 14;
}

const MAPS = ['AmbroseValley', 'GrandRift', 'Lockdown'];

const EVENT_TYPES = [
  { key: 'Kill', label: 'Kill', color: '#ff9800' },
  { key: 'Killed', label: 'Killed', color: '#b91c1c' },
  { key: 'BotKill', label: 'Bot Kill', color: '#facc15' },
  { key: 'BotKilled', label: 'Bot Killed', color: '#ec4899' },
  { key: 'KilledByStorm', label: 'Storm Kill', color: '#a855f7' },
  { key: 'Loot', label: 'Loot', color: '#10b981' },
];

const HEATMAP_TYPES = [
  { key: 'none', label: 'None' },
  { key: 'kill', label: 'Kill Heatmap' },
  { key: 'death', label: 'Death Heatmap' },
  { key: 'traffic', label: 'Traffic Heatmap' },
];

function formatMap(m) {
  return m.replace(/([A-Z])/g, ' $1').trim();
}

export default function Sidebar({
  selectedMap, onMapChange,
  startDate, onStartDateChange,
  endDate, onEndDateChange,
  selectedMatch, onMatchChange,
  matches,
  enabledEvents, onToggleEvent,
  onSelectAllEvents, onDeselectAllEvents,
  showHumans, onToggleHumans,
  showBots, onToggleBots,
  heatmapType, onHeatmapChange,
  loading, onResetAll,
}) {
  return (
    <Box
      sx={{
        width: 360, minWidth: 360, height: '100vh',
        bgcolor: 'background.paper',
        borderRight: 1, borderColor: 'divider',
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <Box sx={{ px: 2.5, py: 1.5, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, background: 'linear-gradient(90deg, #818cf8, #a78bfa, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            LILA Analytics
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', letterSpacing: 1.5, textTransform: 'uppercase', fontSize: '0.65rem' }}>
            Player Journey Visualizer
          </Typography>
        </Box>
        <Typography 
          component="button" 
          onClick={onResetAll} 
          sx={{ cursor: 'pointer', background: 'none', border: 'none', color: 'text.secondary', fontSize: '0.65rem', textTransform: 'uppercase', p: 0, '&:hover': { color: 'primary.light', textDecoration: 'underline' } }}
        >
          Reset All
        </Typography>
      </Box>

      {/* Map Selector */}
      <SectionBlock icon={<MapIcon fontSize="small" />} title="Map">
        <FormControl fullWidth size="small">
          <Select value={selectedMap || ''} onChange={onMapChange} displayEmpty
            sx={{ bgcolor: 'action.hover', fontSize: '0.85rem' }}>
            <MenuItem value="" disabled><em>No Map Selected</em></MenuItem>
            {MAPS.map(m => <MenuItem key={m} value={m}>{formatMap(m)}</MenuItem>)}
          </Select>
        </FormControl>
      </SectionBlock>

      {/* Date Range Selector */}
      <SectionBlock icon={<CalendarMonthIcon fontSize="small" />} title="Date Range">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
            <DatePicker
              label="From"
              value={startDate}
              onChange={onStartDateChange}
              minDate={MIN_DATE}
              maxDate={endDate || MAX_DATE}
              shouldDisableDate={shouldDisableDate}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  sx: { bgcolor: 'action.hover', '& .MuiInputBase-input': { fontSize: '0.85rem' } },
                },
              }}
            />
            <DatePicker
              label="To"
              value={endDate}
              onChange={onEndDateChange}
              minDate={startDate || MIN_DATE}
              maxDate={MAX_DATE}
              shouldDisableDate={shouldDisableDate}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  sx: { bgcolor: 'action.hover', '& .MuiInputBase-input': { fontSize: '0.85rem' } },
                },
              }}
            />
          </Box>
        </LocalizationProvider>
      </SectionBlock>

      {/* Match Selector */}
      <SectionBlock icon={<SportsEsportsIcon fontSize="small" />} title="Match">
        <FormControl fullWidth size="small">
          <Select value={selectedMatch} onChange={onMatchChange}
            sx={{ bgcolor: 'action.hover', fontSize: '0.85rem' }}>
            <MenuItem value="__all__">All Matches</MenuItem>
            {matches.map(m => (
              <MenuItem key={m} value={m} sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                {m.slice(0, 8)}…
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <CircularProgress size={14} />
            <Typography variant="caption" color="text.secondary">Loading data…</Typography>
          </Box>
        )}
      </SectionBlock>

      {/* Event Toggles */}
      <SectionBlock 
        icon={<FilterAltIcon fontSize="small" />} 
        title="Event Filters"
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Typography 
              component="button" 
              onClick={onSelectAllEvents} 
              sx={{ cursor: 'pointer', background: 'none', border: 'none', color: 'primary.main', fontSize: '0.65rem', textTransform: 'uppercase', p: 0, '&:hover': { textDecoration: 'underline' } }}
            >
              All
            </Typography>
            <Typography 
              component="button" 
              onClick={onDeselectAllEvents} 
              sx={{ cursor: 'pointer', background: 'none', border: 'none', color: 'text.secondary', fontSize: '0.65rem', textTransform: 'uppercase', p: 0, '&:hover': { textDecoration: 'underline' } }}
            >
              None
            </Typography>
          </Box>
        }
      >
        <FormGroup sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5 }}>
          {EVENT_TYPES.map(et => (
            <FormControlLabel
              key={et.key}
              control={
                <Checkbox
                  checked={enabledEvents[et.key] ?? true}
                  onChange={() => onToggleEvent(et.key)}
                  size="small"
                  sx={{
                    color: et.color,
                    '&.Mui-checked': { color: et.color },
                    p: 0.5,
                  }}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: et.color, flexShrink: 0 }} />
                  <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{et.label}</Typography>
                </Box>
              }
              sx={{ ml: 0, mb: 0 }}
            />
          ))}
        </FormGroup>
      </SectionBlock>

      {/* Player Toggles */}
      <SectionBlock icon={<PeopleIcon fontSize="small" />} title="Players">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#3b82f6' }} />
              <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>Humans</Typography>
            </Box>
            <Switch checked={showHumans} onChange={onToggleHumans} size="small" color="primary" />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ef4444' }} />
              <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>Bots</Typography>
            </Box>
            <Switch checked={showBots} onChange={onToggleBots} size="small" color="error" />
          </Box>
        </Box>
      </SectionBlock>

      {/* Heatmap Selector */}
      <SectionBlock icon={<WhatshotIcon fontSize="small" />} title="Heatmap Overlay">
        <RadioGroup value={heatmapType} onChange={(e) => onHeatmapChange(e.target.value)} sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5 }}>
          {HEATMAP_TYPES.map(ht => (
            <FormControlLabel
              key={ht.key}
              value={ht.key}
              control={<Radio size="small" sx={{ p: 0.5 }} />}
              label={<Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{ht.label}</Typography>}
              sx={{ ml: 0, mb: 0 }}
            />
          ))}
        </RadioGroup>
      </SectionBlock>

      <Box sx={{ flex: 1 }} />

      {/* Footer */}
      <Box sx={{ px: 2.5, py: 1.5, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', textAlign: 'center', fontSize: '0.6rem' }}>
          LILA · Level Intelligence & Layout Analytics
        </Typography>
      </Box>
    </Box>
  );
}

function SectionBlock({ icon, title, action, children }) {
  return (
    <Box sx={{ px: 2.5, py: 3, borderBottom: 1, borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box sx={{ color: 'text.secondary' }}>{icon}</Box>
          <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: '0.6rem', letterSpacing: 1.5, lineHeight: 1 }}>
            {title}
          </Typography>
        </Box>
        {action && <Box>{action}</Box>}
      </Box>
      {children}
    </Box>
  );
}

function StatCard({ label, value }) {
  return (
    <Paper variant="outlined" sx={{ px: 1.5, py: 1, borderRadius: 1.5 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.55rem', letterSpacing: 1 }}>
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.9rem' }}>
        {typeof value === 'number' ? value.toLocaleString() : value ?? '—'}
      </Typography>
    </Paper>
  );
}
