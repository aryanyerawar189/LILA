# LILA Game Analytics: Key Insights

During the development and testing of the LILA Telemetry Dashboard, processing the parquets and running the actual visual canvas layers exposed several critical game patterns. Here are three core insights derived directly from querying the dashboard tools.

---

### Insight 1: Extreme Bot Pathing Rigidity
- **What caught my eye in the data:** The sheer volume of game populations being heavily skewed (often 99% bots) coupled with their incredibly un-organic, perfectly straight movement lines cutting directly across the map geometry. 
- **Back it up:** By looking at the `Traffic Heatmap` on large maps like AmbroseValley, you don't see organic wandering. You see intensely thick, straight laser paths going from spawn nodes directly to the map center. Our Dashboard player toggles confirmed these lines belong almost entirely to bots (numeric IDs) surging relentlessly toward the nearest combat objective.
- **Can you draw something actionable?** Yes. Programmatic pathing makes the game feel artificial to humans.
  - **Actionable Items:** Introduce internal navmesh variation (A* pathing noise) or "explore/loot" behavioral states to bots so they path through side corridors and buildings instead of strictly plotting the shortest distance to combat.
  - **Metrics Affected:** Bot survival duration (increases), Human-to-Bot combat engagements per square meter (more spread out), Player immersion ratings.
- **Why a level designer should care:** Maps are designed with intricate flanking routes, side alleys, and varied elevations. If the primary population (bots) acts as a rigid conveyor belt, the map's complex geometries and pathing loops are effectively wasted. Bottraffic must organically utilize the space you built.

---

### Insight 2: Central Funnel 'Meat Grinders'
- **What caught my eye in the data:** Extremely bright, dense, isolated clusters of death markers occurring entirely at specific map center intersections, rather than a healthy distribution of skirmishes.
- **Back it up:** When switching the overlay to the `Death Heatmap` strictly on maps like GrandRift, 80%+ of the heat activity is clustered in tiny focal points (connective bridges or central plazas). The `Dashboard Cards` consistently displayed massive volume spikes in `Killed` and `BotKilled` metrics in the first few minutes, indicating players die almost immediately upon hitting the center.
- **Can you draw something actionable?** Yes. The map flow currently acts as a fatal funnel forcing unavoidable crossfire too early.
  - **Actionable Items:** Introduce physical line-of-sight blockers (destroyed vehicles, crates, smoke) in these ultra-hot zones, or build additional parallel flanking bridges/tunnels to dilute the combat density.
  - **Metrics Affected:** Average Match Duration (lengthens slightly as survival rises), Kills-per-zone heat distribution (flattens out).
- **Why a level designer should care:** While central "hot drops" are fun, if players *only* die in one 5% radius of a map, the map flow is fundamentally broken. Designers need to craft pacing; ensuring combat encounters feel tactical rather than just throwing players into an unavoidable central meat grinder.

---

### Insight 3: The Edge-Map Loot Desert
- **What caught my eye in the data:** Complete inactivity around the vast outer peripheries of the map geometries, particularly during early-game timeline scrubbing.
- **Back it up:** Toggling off all combat events and leaving only `Loot Pickups` active revealed that the outer 30% ring of the map topologies were effectively dead zones. Both humans and bots spawned and moved inwards, practically ignoring edge-map structures.
- **Can you draw something actionable?** Yes. Players follow incentive loops; currently, there is no incentive to explore the edges.
  - **Actionable Items:** Relocate specific high-tier loot spawns, rare item chests, or powerful vehicles exclusively to the furthest corners of the map. 
  - **Metrics Affected:** Total Map Surface Area Utilization (increases percentage of the map actively traversed). `Loot` event dispersion radius.
- **Why a level designer should care:** Environment artists and level designers spend hundreds of hours creating incredible assets and spaces at the edges of the map. If the risk/reward metric (loot placement) isn't aggressively pulling players out into those corners, thousands of hours of development time will never be seen by the actual player base. Use loot to deliberately drag players through your beautifully crafted spaces.
