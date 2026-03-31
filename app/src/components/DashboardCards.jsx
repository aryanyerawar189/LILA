import React, { useMemo } from 'react';
import { Box, Typography, Paper } from '@mui/material';

function formatDuration(ms) {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default function DashboardCards({ events }) {
  const stats = useMemo(() => {
    if (!events || events.length === 0) {
      return null;
    }

    const humanIds = new Set();
    const botIds = new Set();
    let pvpKills = 0, pvpDeaths = 0, stormDeaths = 0, lootPickups = 0, botKills = 0, killedByBot = 0;

    for (const e of events) {
      // Count unique players
      if (e.is_bot) botIds.add(e.user_id);
      else humanIds.add(e.user_id);

      // Count events
      switch (e.event) {
        case 'Kill': pvpKills++; break;
        case 'Killed': pvpDeaths++; break;
        case 'KilledByStorm': stormDeaths++; break;
        case 'Loot': lootPickups++; break;
        case 'BotKill': botKills++; break;
        case 'BotKilled': killedByBot++; break;
      }
    }

    return [
      { label: 'Human Players', value: humanIds.size },
      { label: 'Bots', value: botIds.size },
      { label: 'PvP Kills', value: pvpKills },
      { label: 'PvP Deaths', value: pvpDeaths },
      { label: 'Storm Deaths', value: stormDeaths },
      { label: 'Loot Pickups', value: lootPickups },
      { label: 'Bot Kills', value: botKills },
      { label: 'Killed by Bot', value: killedByBot },
    ];
  }, [events]);

  if (!stats) return null;

  return (
    <Box
      sx={{
        bgcolor: '#0f1117',
        borderTop: '1px solid',
        borderColor: 'divider',
        px: 2,
        py: 1.5,
        display: 'flex',
        gap: 1.5,
        overflowX: 'auto',
      }}
    >
      {stats.map((card) => (
        <Paper
          key={card.label}
          elevation={0}
          sx={{
            flex: '1 1 0',
            minWidth: 100,
            bgcolor: '#18181b',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            px: 2,
            py: 1.5,
            textAlign: 'center',
          }}
        >
          <Typography
            sx={{
              color: '#00ff88',
              fontWeight: 700,
              fontSize: '1.15rem',
              fontFamily: 'monospace',
              lineHeight: 1.2,
            }}
          >
            {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
          </Typography>
          <Typography
            sx={{
              color: '#9ca3af',
              fontSize: '0.65rem',
              mt: 0.5,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              lineHeight: 1,
            }}
          >
            {card.label}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
}
