# Starship Network Optimizer
## Dynamic Interactive Route Analysis & Optimization Platform

A comprehensive web-based tool for analyzing and optimizing a global Starship orbital logistics network.

### Features

- **Dynamic City Selection** - Add/remove cities, configure network hubs
- **Real-Time Route Analysis** - Automatically calculate time savings, revenue, strategic value
- **Financial Modeling** - Scenario planning, sensitivity analysis, ROI calculations
- **Network Visualization** - Interactive maps showing routes, hubs, and metrics
- **Phase Planning** - Multi-phase rollout strategy with timeline projections
- **Constraint Analysis** - Time savings → Economic velocity calculations
- **Military Integration** - DoD contract modeling, SPACEFORCE One planning
- **Moon/Mars Planning** - Long-term phase planning (Earth → Moon → Mars → Asteroids)

### Getting Started

1. **Extract all files to a project folder**
2. **Open in Cursor IDE** or your preferred editor
3. **Run local server:** `python3 -m http.server 8000`
4. **Open in browser:** `http://localhost:8000`

### File Structure

```
starship-optimizer/
├── index.html                 # Main application interface
├── styles.css                 # Application styling
├── app.js                      # Main application logic
├── data/
│   ├── cities.json            # City database (30 cities, 14 metrics each)
│   ├── routes.json            # Pre-calculated route matrices
│   └── defaults.json          # Default configuration
├── modules/
│   ├── cityManager.js         # City CRUD operations
│   ├── routeAnalyzer.js       # Route analysis engine
│   ├── networkOptimizer.js    # Network optimization algorithms
│   ├── financialModeler.js    # Financial projections
│   ├── phaseCalculator.js     # Phase planning
│   └── dataFetcher.js         # External data integration
├── utils/
│   ├── geography.js           # Great-circle distance calculations
│   ├── economics.js           # Economic calculations
│   ├── formatting.js          # Number/currency formatting
│   └── storage.js             # LocalStorage management
├── API.md                      # API documentation
├── ARCHITECTURE.md             # System architecture guide
└── README.md                   # This file
```

### How to Use

#### 1. Select Cities
- Choose from 30 pre-loaded cities (NYC, London, Tokyo, Shanghai, etc.)
- Or add custom cities (lat/long, GDP, population, etc.)
- Configure tier (1A/1B/1C) and special properties

#### 2. Analyze Routes
- System automatically calculates:
  - Great-circle distance
  - Orbital flight time (23,800 km/h velocity)
  - Current flight time (with connections)
  - Time savings
  - Demand (population, GDP, business travelers)
  - Revenue potential
  - Strategic value scores

#### 3. Run Optimization
- **Greedy algorithm:** Sequential hub addition maximizing network value
- **Constraint-collapse analysis:** Routes by time savings priority
- **Network effects:** Exponential growth modeling
- **Sensitivity analysis:** What-if scenarios

#### 4. Plan Phases
- **Phase 1 (Earth Orbital):** 2026–2030, 4–20 hubs
- **Phase 2 (Earth-Moon):** 2030–2045, mining logistics
- **Phase 3 (Mars):** 2040–2060, colonization supply chains
- **Phase 4 (Asteroids):** 2050–2080, trillion-dollar economy

#### 5. Model Financials
- Revenue projections (passenger, cargo, military, government)
- Operating costs (fuel, maintenance, personnel)
- Margin analysis (phase-by-phase)
- Military contracts (SPACEFORCE One, C-5 replacement, NATO)
- Break-even analysis

### Key Concepts

#### Economic Velocity
Routes are prioritized by:
1. **Time Savings** (12+ hours = transformational)
2. **Constraint Collapse** (solves existing $B problems)
3. **Repeatable Volume** (daily cargo vs. one-off passengers)
4. **High Margins** (40–50% cargo vs. 8–12% passengers)

#### Constraint Categories
- **Pharma Cold-Chain:** mRNA vaccine/CAR-T degradation (40%+ loss currently)
- **Semiconductor Supply:** Fab downtime ($100K–$1M+/minute)
- **Executive Time Value:** Same-day M&A/deal closings ($200K+/hour)
- **Supply Chain Coordination:** Real-time vs. batching delays

#### Military Revenue Anchor
- **SPACEFORCE One:** Presidential transport ($2B–$5B annually)
- **C-5 Galaxy Replacement:** Strategic airlift ($8B–$12B annually)
- **NATO Airlift:** Coalition logistics ($8B–$12B annually)
- **DoD Rapid Deployment:** Quick response ($4B–$6B annually)
- **Total military floor:** $35B–$50B annually by Year 3

### Example Workflows

#### Workflow 1: Quick Network Analysis
1. Load default 12-hub network (Frankfurt, NYC, Tokyo, London, Shanghai, Singapore, Dubai, Sydney, LA, Zurich, São Paulo, Hong Kong)
2. Run greedy optimization
3. View top 20 routes by revenue
4. See Year 5 projections ($80B–$103B)

#### Workflow 2: First Launch Strategy
1. Load empty network
2. Add Frankfurt, Singapore, NYC, Tokyo, London, Shanghai
3. Run constraint-collapse analysis
4. Sort by time savings (12+ hours first)
5. See Q1–Q4 2026 launch sequence
6. Analyze Year 1 revenue ($3.8B–$6.5B)

#### Workflow 3: Phase 2 Planning
1. Load Phase 1 completion (20 hubs, $100B annually)
2. Add lunar base routing
3. Model mining logistics (helium-3, water ice)
4. See Phase 2 revenue adds ($10B–$20B)
5. Plan moon base infrastructure

#### Workflow 4: Military Contract Modeling
1. Select routes for military validation (NYC-Tokyo long-duration)
2. Model DoD engagement timeline
3. Calculate C-5 replacement revenue impact
4. Forecast SPACEFORCE One costs/benefits
5. See military revenue acceleration

### Data Sources

**Built-in Data (30 cities):**
- Population (UN/World Bank)
- GDP (IMF/World Bank)
- Business travelers (IATA, airport authorities)
- Airport capacity (airport operators)
- Regulatory ease (World Bank Doing Business Index)
- Geopolitical stability (Fragile States Index)

**Real-Time Data Integration:**
- Airport coordinates (OpenStreetMap API)
- Current air fares (Skyscanner API - requires key)
- Population demographics (World Bank API - free)
- GDP data (IMF API - free)
- Trade volumes (UN Comtrade - free)

**Fallback Data:**
- All data is cached locally in JSON files
- Works offline if APIs are unavailable
- CLI tool to refresh data: `python3 refresh_data.py`

### API Integration

The app can pull data from free/open APIs:

```
1. World Bank (Population, GDP, business environment)
   - Free, no API key required
   - https://data.worldbank.org/

2. OpenStreetMap (City coordinates, geocoding)
   - Free, no API key required
   - https://nominatim.openstreetmap.org/

3. UN Comtrade (International trade data)
   - Free, registration required
   - https://comtrade.un.org/

4. IATA (Airline passenger statistics)
   - Limited free access
   - https://www.iata.org/

5. IMF (GDP, economic data)
   - Free API access
   - https://www.imf.org/external/datamapper/
```

### Configuration

**Edit `data/defaults.json` to customize:**
```json
{
  "orbitalVelocity": 23800,        // km/h orbital velocity
  "passengerYield": 15000,          // $/ticket premium travel
  "cargoPrice": 6.50,               // $/kg time-sensitive cargo
  "militaryMargin": 0.22,           // 22% operating margin military
  "cargoMargin": 0.45,              // 45% operating margin cargo
  "passengerMargin": 0.10,          // 10% operating margin passengers
  "phase1TargetYear": 2030,         // $100B target year
  "initialCapex": 28000000000,      // $28B Phase 1 capex
  "breakEvenYear": 3                // Year 3 breakeven (2028)
}
```

### Advanced Features

#### Sensitivity Analysis
- Demand elasticity (±50%)
- Cost structure variations (±20%)
- Technology breakthroughs (speed improvements)
- Geopolitical disruptions
- Competitive threats

#### Scenario Planning
Create and compare scenarios:
- **Base Case:** All assumptions nominal
- **Bull Case:** Higher demand, lower costs
- **Bear Case:** Lower demand, higher costs
- **Military Heavy:** Focus on DoD contracts
- **Cargo Focused:** Maximize time-sensitive logistics
- **Moon Phase:** Include lunar mining (Phase 2)

#### Network Effects Modeling
- Calculate exponential growth from network effects
- Each new hub enables 3–4 new routes
- Cargo + travel synergies (same infrastructure)
- Military + commercial synergies (DoD funds infrastructure)
- Supply chain lock-in (switching costs)

### Development

#### To Modify the App:

1. **Add a new city:**
   - Edit `data/cities.json` or use UI
   - Add to selected cities
   - System auto-calculates routes

2. **Change route logic:**
   - Edit `modules/routeAnalyzer.js`
   - Modify demand function, yield calculations
   - Retest on example cities

3. **Add new financial model:**
   - Edit `modules/financialModeler.js`
   - Add scenario, calculate phases
   - Test with scenario runner

4. **Integrate new data source:**
   - Edit `modules/dataFetcher.js`
   - Add API endpoint
   - Test with `refreshData()` function

### Performance

- Works with 20–30 cities smoothly
- Route matrix calculations (<500ms for full network)
- Network optimization (greedy algorithm) completes in <1s
- Financial projections (5-year) in <100ms
- Browser storage: ~2MB (all 30 cities + routes + scenarios)

### Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- No special plugins required
- Requires ES6 JavaScript support

### License

MIT License - Free for commercial/personal use

### Support

- See `API.md` for detailed API documentation
- See `ARCHITECTURE.md` for system design
- Check console (F12) for detailed logs
- Data validation errors show in console + UI alerts

### Future Enhancements

- [ ] 3D globe visualization (Three.js)
- [ ] Real-time satellite data integration
- [ ] Machine learning demand prediction
- [ ] Collaborative multi-user scenario building
- [ ] Export to PowerPoint/PDF reports
- [ ] Mobile app version
- [ ] Cloud sync (save scenarios to cloud)

---

**Ready for Cursor IDE → Download → Open → Build**

