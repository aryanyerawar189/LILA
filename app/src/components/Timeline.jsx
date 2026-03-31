import React, { useEffect, useRef, useCallback } from 'react';
import { Box, IconButton, Typography, Slider } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

export default function Timeline({
  currentTime, maxTime, playing, onTimeChange, onPlayPause, disabled,
}) {
  const intervalRef = useRef(null);

  // Playback: advance time in small increments
  useEffect(() => {
    if (playing && !disabled && maxTime > 0) {
      // Complete playback in ~10 seconds regardless of match duration
      const increment = maxTime / 200;
      intervalRef.current = setInterval(() => {
        onTimeChange(prev => {
          const next = prev + increment;
          return next >= maxTime ? maxTime : next;
        });
      }, 50);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing, maxTime, disabled, onTimeChange]);

  // Auto-stop at end
  useEffect(() => {
    if (currentTime >= maxTime && maxTime > 0 && playing) {
      onPlayPause();
    }
  }, [currentTime, maxTime, playing, onPlayPause]);

  // Format time: values are in seconds
  const formatTime = useCallback((seconds) => {
    if (seconds == null || isNaN(seconds)) return '0.0s';
    if (seconds < 1) return `${(seconds * 1000).toFixed(0)}ms`;
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const m = Math.floor(seconds / 60);
    const s = (seconds % 60).toFixed(1);
    return `${m}:${s.padStart(4, '0')}`;
  }, []);

  // Slider step: make it fine enough for the data range
  const sliderStep = maxTime > 0 ? Math.max(0.01, maxTime / 1000) : 0.1;

  return (
    <Box
      sx={{
        height: 64,
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        px: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
      }}
    >
      {/* Play / Pause */}
      <IconButton
        onClick={onPlayPause}
        disabled={disabled}
        size="small"
        sx={{
          bgcolor: disabled ? 'action.disabledBackground' : 'primary.main',
          color: 'white',
          '&:hover': { bgcolor: 'primary.dark' },
          '&.Mui-disabled': { bgcolor: 'action.disabledBackground', color: 'text.disabled' },
          width: 36, height: 36,
        }}
      >
        {playing ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
      </IconButton>

      {/* Slider */}
      <Slider
        min={0}
        max={maxTime || 1}
        step={sliderStep}
        value={currentTime}
        onChange={(e, v) => onTimeChange(v)}
        disabled={disabled}
        size="small"
        valueLabelDisplay="auto"
        valueLabelFormat={formatTime}
        sx={{
          flex: 1,
          '& .MuiSlider-thumb': { width: 14, height: 14 },
          '& .MuiSlider-track': { height: 4 },
          '& .MuiSlider-rail': { height: 4, opacity: 0.2 },
        }}
      />

      {/* Hint */}
      {disabled && (
        <Typography variant="caption" sx={{ color: 'text.disabled', fontStyle: 'italic', whiteSpace: 'nowrap' }}>
          Select a match for playback
        </Typography>
      )}
    </Box>
  );
}
