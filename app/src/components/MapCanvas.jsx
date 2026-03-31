import React, { useMemo, useState, useCallback } from 'react';
import { Stage, Layer, Image as KImage, Line, Circle, Text, Rect, Group } from 'react-konva';
import useImage from './useImage';

const EVENT_COLORS = {
  Kill: '#ff9800',
  Killed: '#b91c1c',
  BotKill: '#facc15',
  BotKilled: '#ec4899',
  KilledByStorm: '#a855f7',
  Loot: '#10b981',
};

const MINIMAP_FILES = {
  AmbroseValley: '/minimaps/AmbroseValley_Minimap.png',
  GrandRift: '/minimaps/GrandRift_Minimap.png',
  Lockdown: '/minimaps/Lockdown_Minimap.jpg',
};

export default function MapCanvas({
  mapId,
  events,
  enabledEvents,
  showHumans,
  showBots,
  canvasSize,
}) {
  const [image] = useImage(MINIMAP_FILES[mapId] || '');
  const [tooltip, setTooltip] = useState(null);
  const scale = canvasSize / 1024;

  // Build paths grouped by user
  const paths = useMemo(() => {
    if (!events || events.length === 0) return [];

    const positionEvents = events.filter(
      e => (e.event === 'Position' || e.event === 'BotPosition') &&
           e.pixel_x != null && e.pixel_y != null
    );

    const grouped = {};
    for (const ev of positionEvents) {
      const key = ev.match_id ? `${ev.match_id}_${ev.user_id}` : ev.user_id;
      if (!grouped[key]) grouped[key] = { isBot: ev.is_bot, points: [] };
      grouped[key].points.push({ x: ev.pixel_x, y: ev.pixel_y, ts: ev.ts });
    }

    return Object.entries(grouped)
      .filter(([, v]) => {
        if (v.isBot && !showBots) return false;
        if (!v.isBot && !showHumans) return false;
        return true;
      })
      .map(([uid, v]) => {
        v.points.sort((a, b) => a.ts - b.ts);
        const flatPoints = v.points.flatMap(p => [p.x * scale, p.y * scale]);
        return {
          uid,
          isBot: v.isBot,
          points: flatPoints,
        };
      })
      .filter(p => p.points.length >= 4);
  }, [events, showHumans, showBots, scale]);

  // Build event markers
  const markers = useMemo(() => {
    if (!events || events.length === 0) return [];

    const actionEvents = ['Kill', 'Killed', 'BotKill', 'BotKilled', 'KilledByStorm', 'Loot'];
    return events
      .filter(e => {
        if (!actionEvents.includes(e.event)) return false;
        if (!enabledEvents[e.event]) return false;
        if (e.pixel_x == null || e.pixel_y == null) return false;
        if (e.is_bot && !showBots) return false;
        if (!e.is_bot && !showHumans) return false;
        return true;
      })
      .map((e, i) => ({
        key: `${e.user_id}-${e.ts}-${i}`,
        x: e.pixel_x * scale,
        y: e.pixel_y * scale,
        color: EVENT_COLORS[e.event] || '#fff',
        event: e.event,
        userId: e.user_id,
        ts: e.ts,
        isBot: e.is_bot,
      }));
  }, [events, enabledEvents, showHumans, showBots, scale]);

  const handleMarkerEnter = useCallback((marker, e) => {
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    setTooltip({
      x: pos.x,
      y: pos.y,
      event: marker.event,
      userId: marker.userId,
      ts: marker.ts,
      isBot: marker.isBot,
    });
  }, []);

  const handleMarkerLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  return (
    <Stage width={canvasSize} height={canvasSize}>
      {/* Map background */}
      <Layer>
        {image && (
          <KImage image={image} width={canvasSize} height={canvasSize} />
        )}
      </Layer>

      {/* Paths */}
      <Layer listening={false}>
        {paths.map(path => (
          <Line
            key={path.uid}
            points={path.points}
            stroke={path.isBot ? 'rgba(239,68,68,0.25)' : 'rgba(59,130,246,0.35)'}
            strokeWidth={path.isBot ? 1 : 1.2}
            tension={0.3}
            lineCap="round"
            lineJoin="round"
          />
        ))}
      </Layer>

      {/* Event markers */}
      <Layer>
        {markers.map(m => (
          <Circle
            key={m.key}
            x={m.x}
            y={m.y}
            radius={5}
            fill={m.color}
            opacity={0.85}
            shadowColor={m.color}
            shadowBlur={6}
            shadowOpacity={0.4}
            onMouseEnter={e => handleMarkerEnter(m, e)}
            onMouseLeave={handleMarkerLeave}
          />
        ))}
      </Layer>

      {/* Tooltip */}
      {tooltip && (
        <Layer>
          <Group x={tooltip.x + 12} y={tooltip.y - 40}>
            <Rect
              width={180}
              height={56}
              fill="rgba(17,24,39,0.95)"
              cornerRadius={6}
              stroke="rgba(99,102,241,0.4)"
              strokeWidth={1}
            />
            <Text
              x={8}
              y={6}
              text={`${tooltip.event} ${tooltip.isBot ? '(Bot)' : '(Human)'}`}
              fontSize={11}
              fontFamily="Inter"
              fontStyle="bold"
              fill="#e0e7ff"
            />
            <Text
              x={8}
              y={22}
              text={`ID: ${tooltip.userId.slice(0, 12)}…`}
              fontSize={10}
              fontFamily="JetBrains Mono"
              fill="#9ca3af"
            />
            <Text
              x={8}
              y={37}
              text={`Time: ${tooltip.ts.toFixed(1)}s`}
              fontSize={10}
              fontFamily="JetBrains Mono"
              fill="#9ca3af"
            />
          </Group>
        </Layer>
      )}
    </Stage>
  );
}
