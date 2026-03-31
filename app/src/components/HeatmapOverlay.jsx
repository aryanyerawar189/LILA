import React, { useEffect, useRef } from 'react';

const HEATMAP_CONFIGS = {
  kill: {
    filter: e => e.event === 'Kill' || e.event === 'BotKill',
    color: [255, 100, 0],   // orange-red
    radius: 20,
    maxOpacity: 0.7,
  },
  death: {
    filter: e => e.event === 'Killed' || e.event === 'BotKilled' || e.event === 'KilledByStorm',
    color: [200, 0, 80],    // magenta-red
    radius: 20,
    maxOpacity: 0.7,
  },
  traffic: {
    filter: e => e.event === 'Position' || e.event === 'BotPosition',
    color: [0, 150, 255],   // blue
    radius: 6,
    maxOpacity: 0.6,
  },
};

export default function HeatmapOverlay({ events, heatmapType, canvasSize }) {
  const canvasRef = useRef(null);
  const scale = canvasSize / 1024;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    if (heatmapType === 'none' || !heatmapType || !events || events.length === 0) return;

    const config = HEATMAP_CONFIGS[heatmapType];
    if (!config) return;

    const filtered = events
      .filter(config.filter)
      .filter(e => e.pixel_x != null && e.pixel_y != null);

    if (filtered.length === 0) return;

    const points = filtered.map(e => ({
      x: Math.round(e.pixel_x * scale),
      y: Math.round(e.pixel_y * scale),
    }));

    const offscreen = document.createElement('canvas');
    offscreen.width = canvasSize;
    offscreen.height = canvasSize;
    const octx = offscreen.getContext('2d');

    const r = config.radius;
    for (const pt of points) {
      const gradient = octx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, r);
      gradient.addColorStop(0, 'rgba(0,0,0,0.15)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      octx.fillStyle = gradient;
      octx.fillRect(pt.x - r, pt.y - r, r * 2, r * 2);
    }

    const imageData = octx.getImageData(0, 0, canvasSize, canvasSize);
    const pixels = imageData.data;
    const [cr, cg, cb] = config.color;

    for (let i = 0; i < pixels.length; i += 4) {
      const alpha = pixels[i + 3];
      if (alpha > 0) {
        const t = Math.min(alpha / 180, 1);
        let rr, gg, bb;
        if (t < 0.5) {
          const f = t * 2;
          rr = Math.round(cr * f);
          gg = Math.round(cg * f);
          bb = Math.round(cb * f);
        } else {
          const f = (t - 0.5) * 2;
          rr = Math.round(cr + (255 - cr) * f);
          gg = Math.round(cg + (255 - cg) * f);
          bb = Math.round(cb + (255 - cb) * f);
        }

        pixels[i] = rr;
        pixels[i + 1] = gg;
        pixels[i + 2] = bb;
        pixels[i + 3] = Math.round(t * 255 * config.maxOpacity);
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, [events, heatmapType, canvasSize, scale]);

  if (heatmapType === 'none' || !heatmapType) return null;

  return (
    <canvas
      ref={canvasRef}
      width={canvasSize}
      height={canvasSize}
      className="absolute inset-0 pointer-events-none"
      style={{ width: canvasSize, height: canvasSize }}
    />
  );
}
