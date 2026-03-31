import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const ITEMS = [
  { label: 'Human Path', color: '#3b82f6', type: 'line' },
  { label: 'Bot Path', color: '#ef4444', type: 'line' },
  { label: 'Kill', color: '#ff9800', type: 'circle' },
  { label: 'Killed', color: '#b91c1c', type: 'circle' },
  { label: 'Bot Kill', color: '#facc15', type: 'circle' },
  { label: 'Bot Killed', color: '#ec4899', type: 'circle' },
  { label: 'Storm Kill', color: '#a855f7', type: 'circle' },
  { label: 'Loot', color: '#10b981', type: 'circle' },
];

export default function Legend() {
  return (
    <Paper
      elevation={8}
      sx={{
        position: 'absolute',
        top: 16,
        right: 16,
        bgcolor: '#18181b',
        borderRadius: 2,
        px: 2,
        py: 1.5,
        zIndex: 10,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: '0.6rem', letterSpacing: 1.5, mb: 1, display: 'block', lineHeight: 1.2 }}>
        Legend
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        {ITEMS.map(item => (
          <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {item.type === 'line' ? (
              <Box sx={{ width: 16, height: 2, borderRadius: 1, bgcolor: item.color, flexShrink: 0 }} />
            ) : (
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color, flexShrink: 0 }} />
            )}
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
