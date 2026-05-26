# Quick Start Guide - 5 Minutes

## 1. Download & Extract
```bash
# Download the starship-optimizer folder
unzip starship-optimizer.zip
cd starship-optimizer
```

## 2. Open in Cursor IDE
```bash
cursor .
```

## 3. Run Local Server (this repo)
```bash
npm install
npm run dev
```

## 4. Open in Browser
```
http://localhost:5173
```

## 5. Try These Workflows

### Workflow A: Default Network (30 seconds)
1. Select cities: NYC, London, Tokyo, Singapore, Shanghai, Dubai (click checkboxes)
2. Click "▶ Run Network Analysis"
3. See top 20 routes by revenue
4. View 5-year projection ($80B+)

### Workflow B: First Launch Strategy (2 minutes)
1. Clear selection (Reset Network button)
2. Add: Frankfurt, Singapore, NYC, Tokyo, London, Shanghai
3. Run analysis
4. Sort routes by "Time Savings"
5. See Q1-Q4 2026 optimal launch sequence:
   - Q1: Frankfurt → Singapore (Pharma cold-chain)
   - Q2: NYC → Tokyo (Military validation)
   - Q3: London → Shanghai (Supply chain)
   - Q4: NYC → London (Volume capture)
6. Check Year 1 revenue: $3.8B–$6.5B

### Workflow C: Military-Heavy Strategy (2 minutes)
1. Select military-priority cities (focus on high geopolitical stability)
2. Analysis Type: "Military-First Strategy"
3. Run analysis
4. See military revenue anchor ($35B–$50B by Year 3)
5. Check Phase planning for DoD contracts

### Workflow D: Custom City (3 minutes)
1. Click "+ Add Custom City"
2. Enter: Your city name, latitude, longitude
3. Set GDP, population, tier
4. Add to selection
5. Analyze network impact

## Key UI Features

**Left Sidebar:**
- City filter (Tier 1A/1B/1C)
- City list (click checkboxes)
- Selected cities (drag to reorder)
- Analysis options (constraints, network effects)
- Run Analysis button

**Top Tabs:**
- **Overview:** Key metrics + 5-year revenue chart
- **Top Routes:** Highest-revenue routes with details
- **Financial:** Revenue breakdown, margins, sensitivity
- **Phases:** Phase 1–4 planning with timelines
- **Constraints:** Time-savings analysis by constraint

**Right Sidebar:**
- Network statistics
- Top route details
- Financial summary
- Next action items

## Customization

### Change Default Parameters
Edit `data/defaults.json`:
```json
{
  "orbitalVelocity": 23800,
  "passengerYield": 15000,
  "cargoPrice": 6.50,
  "militaryMargin": 0.22,
  "phase1TargetYear": 2030,
  "targetYear5Revenue": 80000000000
}
```

### Add New Cities
Edit `data/cities.json` and add city object with:
- code, name, country, tier
- latitude, longitude
- gdp, population, businessTravelers
- airportCapacity, regulatoryEase, geopoliticalStability

### Modify Route Calculations
Edit `modules/routeAnalyzer.js`:
- `analyzeRoute()` method
- Change demand model, revenue calc

### Adjust Optimization
Edit `modules/networkOptimizer.js`:
- Change greedy algorithm weights
- Modify constraint-collapse logic

## Keyboard Shortcuts

- `Ctrl+F` - Filter routes
- `Ctrl+S` - Save scenario (saves to localStorage)
- `Ctrl+R` - Reset network

## Troubleshooting

**Cities not loading?**
- Check browser console (F12)
- Verify `data/cities.json` exists and is valid JSON

**Routes not calculating?**
- Select at least 2 cities
- Click "▶ Run Network Analysis"
- Check console for errors

**Charts not displaying?**
- Ensure Chart.js loaded (check Network tab in F12)
- Verify canvas elements in index.html

**Want more cities?**
- Edit data/cities.json or use "+ Add Custom City" button
- System supports 30+ cities smoothly

## Next Steps

1. **Experiment with different city combinations**
2. **Test all analysis types** (Greedy, Constraint-Collapse, Military, Cargo)
3. **Run sensitivity analysis** (Financial tab)
4. **Review Phase planning** (Phases tab)
5. **Export results** (Export Analysis button)

## API Reference

Key classes and methods (for developers):

```javascript
// City Management
const cities = await cityManager.loadCities();
cityManager.selectCity('NYC');
const selected = cityManager.getSelectedCities();

// Route Analysis
routeAnalyzer.analyzeNetwork(selectedCities);
const topRoutes = routeAnalyzer.getTopRoutes(20);
const totalRevenue = routeAnalyzer.getTotalNetworkRevenue();

// Optimization
const greedyResult = NetworkOptimizer.greedyOptimization(cities, analyzer);
const constraintResult = NetworkOptimizer.constraintCollapseOptimization(cities, analyzer);

// Financial Modeling
const projection = financialModeler.project5YearRevenue(analyzer, hubCount);
const breakdown = financialModeler.revenueBreakdown(analyzer, 5);

// Formatting
Formatting.currency(1000000000);  // "$1.0B"
Formatting.timeSavings(7.5);      // "7.5h"
Formatting.distance(5570);        // "5570.0 km"
```

## Support

- Full documentation: See README.md
- Architecture guide: See ARCHITECTURE.md
- API reference: See API.md (coming soon)

**Ready to analyze the future of global logistics!** 🚀
