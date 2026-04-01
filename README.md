# LILA Telemetry Analytics Dashboard

A comprehensive, high-performance web dashboard designed to visualize player journeys, combat events, and spatial telemetry across multiple maps. Includes dynamic heatmap tracking, interactive playback timelines, and a built-in AI assistant powered by the Google Gemini API to analyze session statistics in real-time.

## Tech Stack

**Frontend Framework & Tooling**
- **React 18** + **Vite**: Blazing fast rendering and optimized production builds.
- **Material UI (MUI) v5**: Premium, accessible, and customizable interactive UI components.
- **Tailwind CSS v4**: Utility-first styling for layout configurations.
- **React-Konva**: Handles 2D hardware-accelerated canvas rendering for all player paths and icons.
- **Heatmap.js**: Dynamic overlay visualization for heat density maps (Kill/Death distributions).

**Data Processing Pipeline**
- **Python 3**: Native scripting layer for transforming raw telemetry.
- **Pandas & PyArrow**: Used to ingest, normalize, and parse `.nakama-0` parquet game logs into highly optimized `.json` data blobs that the frontend can read natively.

**AI Integration**
- **Google Gemini API**: Native browser `fetch` function-calling to enable "Kaleen Bhaiya", an AI agent that runs structured queries directly on your local `index.json` arrays.

---

## 🚀 Setup & Local Development

### 1. Prerequisites
You will need the following installed:
- **Node.js** (v18+)
- **Python** (3.8+)

### 2. Generate the Data 
LILA relies on static `.json` files to power its timeline and analysis features. If you have raw `.nakama-0` Parquet logs, you must process them first:

```bash
# In the root repository directory
python preprocess.py
```
> **Note:** Ensure paths inside `preprocess.py` match your machine's raw telemetry location. This script will safely generate the optimized JSON chunks into `/app/public/data/`.

### 3. Run the Frontend 

Navigate into the React application directory, install dependencies, and launch the dev server:

```bash
cd app
npm install
npm run dev
```

The graphical client will mount locally at `http://localhost:5173/`.

### 4. API Keys & Environment Variables (Optional)
Currently, the LLM intelligence engine ("Kaleen Bhaiya") is powered by a hardcoded development API key integrated directly inside `src/components/ChatSidebar.jsx`. 

If you are running this extensively or pushing to production, locate line 9 in `ChatSidebar.jsx` and replace the `API_KEY` string with your own Gemini token or configure an `.env` variable securely.
