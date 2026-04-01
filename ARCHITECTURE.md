# System Architecture

## 1. Technology Stack & Rationale
- **Python (Pandas & PyArrow):** Used strictly as a preprocessor. Raw telemetry logs were packed in highly-compressed `.nakama-0` Parquet files. Python cleanly tears these apart, applies math formatting, and spits out digestible web-ready format.
- **React 18 + Vite:** Selected for its state-driven DOM updates and extremely fast Hot Module Replacement during development.
- **Material UI (MUI) & Tailwind:** MUI provided professional, ready-to-use structural components (Slider, Select, DatePicker), while Tailwind handled rapid layout flexing and utility padding.
- **React-Konva:** A React wrapper for the HTML5 Canvas API. Chosen because rendering thousands of player paths and dots using standard DOM `<div>` loops immediately chokes browsers. Canvas provides a 60 FPS hardware-accelerated experience.
- **Heatmap.js:** A lightweight, pure JS library exclusively for drawing radial density gradients to spot spatial clusters without manual WebGL coding.
- **Google Gemini API:** Native browser-executed function calling allows us to use an LLM directly on the frontend. It seamlessly scrapes our processed telemetry files exactly when asked to analyze combat statistics without requiring an expensive intermediate Python server.

## 2. Data Flow
1. **Extraction:** Python crawls the `/player data/` folders, targeting all `.nakama-0` parquet chunks.
2. **Transformation:** Pandas decodes internal byte arrays, flags bots vs humans, calculates precise screen (pixel) plotting points from 3D coordinates, and shifts Unix timestamps into predictable relative match durations.
3. **Loading (JSON Generation):** The script dynamically groups all rows and writes flat, optimized `[Map]_[Date].json` files into the React `/public/data` directory, alongside a master `index.json` dictionary.
4. **Client Consumption:** React's `App.jsx` reads `index.json` to configure the UI dropdowns. When you select a date and map, `fetch()` downloads that exact JSON file, filters the rows strictly by your slider timestamp, and pipes it directly into the `MapCanvas.jsx`.

## 3. Coordinate Mapping (The Tricky Part)
Mapping raw game metrics (`x, z`) onto a flat 2D minimap (`pixel_x, pixel_y`) requires specific translation math. 
1. **The Origin Point:** Maps have an internal configuration (`originX`, `originZ`). We first deduct the origin from the raw coordinates to find how far the player is from the corner of the map bounding box.
2. **World Scale:** We then divide that distance by the exact size of the map (`scale`) so our result safely falls between `0.0` and `1.0` (a percentage layout string).
3. **Inverting Coordinates:** 3D engines generally treat the "Z-axis" as pushing "forward/up", meaning higher numbers go North. However, web DOM and Canvas geometries treat the Y-axis top as `0` and "down" as positive numbers. We must invert the resulting Z float (`1 - (engine_z)`) to flip the spatial matrix correctly for the screen.
4. **Resolution Fit:** Finally, we multiply our `<0.0 - 1.0>` scales by the internal generic sizing boundary (1024), scaling it precisely alongside the visual Map images so it remains accurate regardless of monitor sizes.

## 4. Assumptions & Edge Cases
- **Bot vs Human Signatures:** The raw parquet logs masked player identification. We assumed that traditional UUID strings (e.g., `f4e072fa-...`) represented humans, whilst short numeric flags (e.g., `382`) belonged to testing bots.
- **Timeline Synchronization:** Stacking "All Matches" concurrently on one map originally connected dots across radically different matches, drawing massive "straight lines" as players respawned. We aggressively forced Konva lines to break mapping keys by aggregating `[match_id] + [user_id]` uniquely.
- **Timestamp Absolutes:** The exported Unix timestamps initially spanned wildly. Assuming users care about scrubbing *through* a match, we reset the baseline visual component to `time elapsed from start` by dynamically deducting `min(ts)` from all active streams per dataset.

## 5. Major Tradeoffs

| Decision | Alternative Considered | Why we chose the current path |
|----------|------------------------|-------------------------------|
| **Statically Generated JSON** | Full Python Backend Data API | Pre-building JSON chunks guarantees instant load times, extreme caching, completely zero server infrastructure costs, and Vercel hosting capability out of the box. |
| **Canvas API Rendering** | SVG or HTML DOM Lines | Plotting 10,000+ points utilizing SVG wrappers inherently tanks CSS engines. Canvas wipes and redraws the UI without blocking main thread interactions. |
| **Frontend LLM Calling** | Langchain Agent Server | By wiring Google's Gemini functions *directly* into the React Client mapping to Local host `fetch()` routines, we entirely deleted the need for an orchestration backend server, drastically lowering infrastructure overhead. |
| **Date/Map Sharding Strategy**| Huge Unified Target Blob | Generating one mega-JSON file of all game telemetry instantly crashes Chrome memory limits upon fetching. Loading strict subsets via sharding buffers performance flawlessly. |
