

## Optimization Engine Enhancement Plan

### Current State
The Optimization Engine is a single-mode page with two sliders (risk cap, capacity cap) and a mock MILP solver that produces static recommendations about material substitutions. It's disconnected from the rich data model (SKUs, materials, BOM, costs, forecasts, suppliers) already available in the app.

### Proposed Enhancement: Multi-Objective Optimization with 4 Modes

The engine will be restructured into a **tabbed interface** with four optimization modules, each leveraging the existing mock data:

```text
┌─────────────────────────────────────────────────────────┐
│  [Margin Max] [Cost Min] [Forecast-Demand] [Portfolio]  │  ← Tabs
├─────────────────────────────────────────────────────────┤
│  Constraints Panel (contextual per tab)                 │
│  ─────────────────────────────────────────              │
│  Results: KPI Summary → Recommendations → Constraint    │
│  Status → Waterfall/Pareto Charts                       │
└─────────────────────────────────────────────────────────┘
```

#### Tab 1: Margin Maximization (enhanced current)
- **Objective:** Maximize gross margin across portfolio
- **Constraints:** Risk cap, capacity cap, min performance index, regulatory
- **Inputs:** Global filters (brand/category/region), constraint sliders
- **Output:** SKU-level material swap recommendations with margin uplift, landed cost waterfall chart (formulation + freight + duty + warehouse), Pareto frontier chart (risk vs. margin)
- Uses `simulateLandedCost()` and `calculateSimilarity()` from mockData

#### Tab 2: Cost Minimization
- **Objective:** Minimize total landed cost (formulation + logistics + duty)
- **Constraints:** Min quality/performance threshold, supplier diversity, MOQ
- **Inputs:** Target cost reduction %, min performance index slider
- **Output:** Supplier consolidation recommendations, freight route optimization, cost breakdown by component (stacked bar chart), savings by category
- Uses `logisticsRates`, `supplierMaster`, `bomTable`

#### Tab 3: Forecast-Demand Alignment
- **Objective:** Minimize over/under-stock cost by aligning procurement to demand forecast
- **Constraints:** Safety stock level, max inventory days, service level target
- **Inputs:** SKU selector, planning horizon, confidence threshold
- **Output:** Procurement schedule recommendations, inventory cost vs. stockout risk tradeoff, demand vs. planned procurement chart
- Uses `forecastData`, `generateHeuristicForecast()`

#### Tab 4: Portfolio Optimization
- **Objective:** Optimize SKU portfolio mix for best overall margin-risk-cost balance
- **Constraints:** Min SKU count, max revenue concentration, channel balance
- **Inputs:** Weight sliders for margin/risk/cost priorities (summing to 100%)
- **Output:** SKU rank-ordered list with composite score, keep/review/sunset recommendations, radar chart per SKU, portfolio-level KPI summary

### Technical Approach

1. **Refactor `OptimizationEngine.tsx`** into a tabbed layout using existing `Tabs` component
2. **Create 4 sub-components** in `src/components/optimization/`:
   - `MarginOptimizer.tsx` — evolved from current page
   - `CostMinimizer.tsx`
   - `ForecastAligner.tsx`
   - `PortfolioOptimizer.tsx`
3. **Add mock solver logic** in `src/data/mockData.ts` — deterministic functions that compute results from existing data (no random delays, just computation + animated progress bar)
4. **Shared components:** Reuse `GlobalFilters`, constraint slider pattern, result status banner, and recommendation card pattern
5. **Charts:** Waterfall chart (recharts BarChart stacked), Pareto scatter, Radar chart — all using existing recharts dependency
6. **Mobile responsive:** 1-col constraint layout on mobile, scrollable tabs

### Files to Create/Modify
- `src/pages/OptimizationEngine.tsx` — refactor to tab container
- `src/components/optimization/MarginOptimizer.tsx` — new
- `src/components/optimization/CostMinimizer.tsx` — new
- `src/components/optimization/ForecastAligner.tsx` — new
- `src/components/optimization/PortfolioOptimizer.tsx` — new
- `src/data/mockData.ts` — add solver functions for cost/forecast/portfolio optimization

