import os
import glob
import pandas as pd
import pyarrow.parquet as pq
import json
import logging
import numpy as np

logging.basicConfig(level=logging.INFO)

MAP_CONFIGS = {
    'AmbroseValley': {'scale': 900, 'originX': -370, 'originZ': -473},
    'GrandRift': {'scale': 581, 'originX': -290, 'originZ': -290},
    'Lockdown': {'scale': 1000, 'originX': -500, 'originZ': -500}
}

def get_map_config(map_id):
    if not isinstance(map_id, str): return None
    for k, v in MAP_CONFIGS.items():
        if k.lower() == map_id.lower():
            return v
    return None

def process_data():
    base_dir = r"D:\NEW\LILA\player data"
    out_dir = r"D:\NEW\LILA\app\public\data"
    os.makedirs(out_dir, exist_ok=True)

    all_data = []

    match_index = {}   # match_id -> {"map": map_id, "date": date}
    unique_dates = set()
    unique_maps = set()

    search_path = os.path.join(base_dir, "February_*", "*.nakama-0")
    files = glob.glob(search_path)

    logging.info(f"Found {len(files)} files to process.")

    for file in files:
        if not os.path.isfile(file):
            continue
        filename = os.path.basename(file)

        # Parse user_id and match_id from filename
        base_name = filename[:-len('.nakama-0')]
        parts = base_name.split('_', 1)
        if len(parts) != 2:
            continue
        user_id, match_id = parts

        is_bot = user_id.isdigit()
        date = os.path.basename(os.path.dirname(file))
        unique_dates.add(date)

        try:
            df = pd.read_parquet(file, engine='pyarrow')
        except Exception as e:
            logging.error(f"Failed to read {file}: {e}")
            continue

        df['is_bot'] = is_bot
        df['date'] = date
        df['user_id'] = user_id
        df['match_id'] = match_id

        # Decode event column from bytes to string
        if 'event' in df.columns:
            first_valid = df['event'].dropna().iloc[0] if not df['event'].dropna().empty else None
            if isinstance(first_valid, bytes):
                df['event'] = df['event'].apply(lambda x: x.decode('utf-8') if isinstance(x, bytes) else x)

        # TS conversion:
        # datetime64[ms] -> int64 gives milliseconds since epoch
        # divide by 1000 to get seconds (float)
        # This gives usable values for timeline slider and duration calculations
        if 'ts' in df.columns:
            df['ts'] = pd.to_datetime(df['ts']).astype('int64') / 1000.0

        # Coordinate mapping
        map_col = 'map_id' if 'map_id' in df.columns else ('map' if 'map' in df.columns else None)
        if map_col:
            df.rename(columns={map_col: 'map_id'}, inplace=True)
            map_ids_in_file = df['map_id'].dropna().unique()

            for m_id in map_ids_in_file:
                unique_maps.add(m_id)
                if match_id not in match_index:
                    match_index[match_id] = {'map': m_id, 'date': date}

            df['pixel_x'] = None
            df['pixel_y'] = None

            if 'x' in df.columns and 'z' in df.columns:
                for m_id in map_ids_in_file:
                    cfg = get_map_config(m_id)
                    if cfg:
                        mask = df['map_id'] == m_id
                        df.loc[mask, 'pixel_x'] = (df.loc[mask, 'x'] - cfg['originX']) / cfg['scale'] * 1024
                        df.loc[mask, 'pixel_y'] = (1 - (df.loc[mask, 'z'] - cfg['originZ']) / cfg['scale']) * 1024

        all_data.append(df)

    if not all_data:
        logging.warning("No data found or loaded.")
        return

    final_df = pd.concat(all_data, ignore_index=True)

    if 'map_id' not in final_df.columns:
        final_df['map_id'] = 'Unknown'

    # Compute per-match duration stats and store in match_index
    # This lets the frontend show avg match duration when "All Matches" is selected
    for match_id_key, match_events in final_df.groupby('match_id'):
        ts_vals = match_events['ts'].dropna()
        if len(ts_vals) >= 2:
            duration_sec = float(ts_vals.max() - ts_vals.min())
        else:
            duration_sec = 0.0
        if match_id_key in match_index:
            match_index[match_id_key]['duration_sec'] = round(duration_sec, 2)

    # Write one JSON per map+date
    grouped = final_df.groupby(['map_id', 'date'])
    for (m_id, d), group in grouped:
        out_filename = os.path.join(out_dir, f"{m_id}_{d}.json")
        group.to_json(out_filename, orient='records', force_ascii=False)
        logging.info(f"Wrote {out_filename} with {len(group)} events")

    # Write index.json with match durations included
    index_data = {
        'matches': match_index,
        'dates': sorted(list(unique_dates)),
        'maps': sorted(list(unique_maps))
    }
    with open(os.path.join(out_dir, "index.json"), "w", encoding='utf-8') as f:
        json.dump(index_data, f, indent=2)
    logging.info("Finished writing index.json.")

if __name__ == "__main__":
    process_data()