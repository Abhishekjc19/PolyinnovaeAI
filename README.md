# REROUTE — Energy Supply Chain Resilience Platform

> Decision support for navigating Strait of Hormuz disruptions

[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](LICENSE)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](package.json)
[![Status: Beta](https://img.shields.io/badge/status-beta-orange)](https://github.com/reroute-energy/platform)

---

## What is REROUTE?

When the Strait of Hormuz closes, **20 million barrels per day** of oil vanish from the global market. Refiners in Tokyo, Mumbai, and Rotterdam scramble for alternatives. Insurance premiums spike 10x. Tankers reroute via the Cape, adding $1M+ per voyage.

**REROUTE** is the operating system for that response.

We combine:
- **Real-time vessel tracking** (AIS data)
- **AI-powered price forecasting** (econometric + ML models)
- **Route optimization** (graph search algorithms)
- **Decision copilot** (LLM-backed scenario analysis)

Into a single platform that answers the question: *What do I do in the next 72 hours?*

---

## Features

### 🔍 Exposure Scanner
Map your entire supply chain against disruption scenarios. Quantify financial impact in real-time.

### 🗺️ Route Intelligence
Find alternative shipping routes with multi-objective optimization:
- **Minimize cost** (freight + insurance + fuel)
- **Respect capacity** (pipeline throughput, port congestion)
- **Manage risk** (geopolitical scoring, war zones)

### 📊 AI Price Engine
Forecast Brent/WTI/Dubai spreads using:
- Vector autoregression (VAR) on historical disruptions
- Monte Carlo simulation (5,000+ iterations)
- Confidence intervals (P5, P25, P75, P95)

### 🤖 Decision Copilot
Natural language interface to your supply chain:
- "What's my exposure to Hormuz?"
- "Find cheapest route to Jamnagar avoiding Red Sea"
- "Model 60-day closure with 70% Hormuz blockage"

---

## Quick Start

### Prerequisites
- **Node.js** 18+ ([download](https://nodejs.org/))
- **npm** or **yarn**
- API keys (optional for full features; see `.env.example`)

### Installation

```bash
# Clone repository
git clone https://github.com/reroute-energy/platform.git
cd platform

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
# Edit .env with your API keys (optional for demo)

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the platform.

---

## Architecture

```
reroute/
├── src/
│   ├── main.js              # Core app initialization
│   ├── style.css            # Design system
│   ├── config/
│   │   └── scenarios.js     # Pre-configured disruption scenarios
│   ├── data/
│   │   └── maritime-routes.js   # Chokepoints, pipelines, shipping lanes
│   ├── analysis/
│   │   └── disruption-models.js # Econometric models
│   └── utils/
│       └── math-helpers.js      # Haversine, Bezier, statistics
├── docs/
│   └── METHODOLOGY.md       # Full technical documentation
└── public/
    ├── icons.svg
    └── favicon.svg
```

---

## Data Sources


| Source | Purpose | Update Frequency |
|--------|---------|------------------|
| [U.S. EIA](https://www.eia.gov/international/analysis/special-topics/World_Oil_Transit_Chokepoints) | Chokepoint flow data | Monthly |
| [IEA Oil Market Report](https://www.iea.org/reports/oil-market-report) | Supply/demand balance | Monthly |
| [S&P Global Platts](https://www.spglobal.com/commodityinsights/) | Real-time pricing | Live (subscription) |
| [Lloyd's List Intelligence](https://lloydslistintelligence.com/) | Vessel tracking (AIS) | Real-time (API) |
| [Clarksons Research](https://www.clarksons.com/services/research/) | Freight rates | Weekly |
| [GPR Index (Fed)](https://www.matteoiacoviello.com/gpr.htm) | Geopolitical risk scoring | Monthly |

See [`docs/METHODOLOGY.md`](docs/METHODOLOGY.md) for full details on modeling approach.

---

## Usage Examples

### Scenario Analysis

```javascript
import { getScenario } from './src/config/scenarios.js';

const scenario = getScenario('hormuz_mining');

console.log(`
  Scenario: ${scenario.name}
  Annual Probability: ${scenario.probability_annual * 100}%
  Expected Duration: ${scenario.expected_duration_days} days
  Supply Disrupted: ${scenario.supply_impact.bpd_disrupted.toLocaleString()} bpd
  Peak Price: $${scenario.price_shock.peak_price_usd}/bbl
`);
```

### Price Forecasting

```javascript
import { PriceShockModel } from './src/analysis/disruption-models.js';

const model = new PriceShockModel();

const forecast = model.forecast(
  17_500_000, // 17.5M bpd disrupted
  35,         // 35-day duration
  {
    spare_capacity_mbpd: 2.1,
    oecd_inventory_days: 62,
    pre_crisis_price: 85,
  }
);

console.log(`
  Peak Price: $${forecast.peak_price}/bbl
  30-Day Avg Premium: $${forecast.avg_premium_30d}/bbl
  Cumulative Cost Impact: $${forecast.cumulative_cost_impact_billion}B
`);
```

### Route Optimization

```javascript
import { calculateFreightCost } from './src/data/maritime-routes.js';

const cost = calculateFreightCost('cape_route', 'VLCC', 2_000_000);

console.log(`
  Base Voyage Cost: $${cost.base_cost_usd.toLocaleString()}
  War Risk Premium: $${cost.war_premium_usd.toLocaleString()}
  Total Cost: $${cost.total_voyage_cost_usd.toLocaleString()}
  Cost per Barrel: $${cost.cost_per_bbl.toFixed(2)}/bbl
`);
```

---

## Roadmap

### ✅ Completed (v1.0 - Aug 2026)
- [x] Hormuz disruption scenarios
- [x] Price forecasting (VAR + Monte Carlo)
- [x] Route optimization (Dijkstra variant)
- [x] Interactive dashboard
- [x] Historical precedent analysis

### 🚧 In Progress (v1.1 - Q4 2026)
- [ ] Real-time AIS integration (Lloyd's API)
- [ ] LNG-specific modeling (JKM, TTF spreads)
- [ ] Email/SMS alert system
- [ ] Multi-user access control
- [ ] PDF report generation

### 🔮 Planned (v2.0 - 2027)
- [ ] Machine learning risk scoring (NLP on news feeds)
- [ ] Blockchain-based contract verification
- [ ] Mobile app (iOS/Android)
- [ ] Integration with ERP systems (SAP, Oracle)
- [ ] Demand-side modeling (refinery optimization)

---

## Contributing

We welcome contributions from energy economists, data scientists, and software engineers!

### Development Setup

```bash
# Install dependencies
npm install

# Run tests (when implemented)
npm test

# Lint code
npm run lint

# Build for production
npm run build
```

### Areas for Contribution
- **Data pipelines**: Integrate additional APIs (MarineTraffic, ICE Futures, etc.)
- **Modeling**: Improve econometric models, add regime-switching models
- **UI/UX**: Enhance visualizations, add accessibility features
- **Documentation**: Expand use cases, add video tutorials
- **Infrastructure**: Docker containers, Kubernetes deployment

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

## Acknowledgments

This project draws on research from:
- **Oxford Institute for Energy Studies** (Hormuz scenario analysis)
- **Chatham House** (maritime security assessments)
- **CSIS Energy Security Program** (infrastructure vulnerability studies)
- **U.S. Energy Information Administration** (chokepoint statistics)

Historical data sourced from IEA, EIA, and S&P Global.

---

## Contact

- **Website**: [reroute.energy](https://reroute.energy) (placeholder)
- **Email**: team@reroute.energy
- **Twitter**: [@RerouteEnergy](https://twitter.com/RerouteEnergy) (placeholder)
- **LinkedIn**: [REROUTE Platform](https://linkedin.com/company/reroute-platform) (placeholder)

---

## Disclaimer

REROUTE is a **decision support tool**, not a trading system. Price forecasts are probabilistic estimates based on historical data and should not be construed as investment advice. Users are responsible for validating model assumptions and integrating outputs into their own risk management frameworks.

For questions about model methodology, see [`docs/METHODOLOGY.md`](docs/METHODOLOGY.md).

---

**Built with ⚡ by polymaths who believe energy security requires systemic thinking.**
