

# Forecast Disaggregation Page — Implementation Plan

## Overview
Add a new **Forecast Disaggregation** page as the default entry point for the Forecast Intelligence module. This page provides portfolio-level visibility of month-on-month forecasts across SKUs, component demand translation, and margin impact analysis — before users drill into individual SKU details.

## Architecture

```text
/forecast (module root)
├── /forecast              → Forecast Disaggregation (NEW, default)
└── /forecast/deep-dive    → SKU Forecast Deep Dive (existing page, moved)
```

## File Changes

### 1. Routing & Navigation

**`src/App.tsx`** — Add sub-routes under `/forecast`:
- `/forecast` → new `ForecastDisaggregation` page (default)
- `/forecast/deep-dive` → existing `ForecastIntelligence` (renamed to SKU Deep Dive)

**`src/components/layout/AppSidebar.tsx`** — Update Forecast nav item. When user clicks "Forecast", it lands on `/forecast` (disaggregation). No sub-menu needed; in-page tabs handle the two views.

**`src/pages/ForecastIntelligence.tsx`** — Add a tab bar at the top with two tabs: "Forecast Disaggregation" and "SKU Forecast Deep Dive". Default tab is Disaggregation. This avoids complex nested routing — a single page with tab switching.

### 2. New Files

| File | Purpose |
|------|---------|
| `src/components/forecast/ForecastDisaggregation.tsx` | Main disaggregation content (rendered in tab) |
| `src/components/forecast/disaggregation/DisaggregationFilters.tsx` | Extended filter bar (Category, Brand, SKU multi-select, Region, Channel, Horizon, Granularity, Scenario) |
| `src/components/forecast/disaggregation/ForecastKPIStrip.tsx` | 5 KPI cards with sparklines |
| `src/components/forecast/disaggregation/MultiSKUTrendChart.tsx` | Multi-line recharts chart (top 10 SKUs by revenue) with Volume/Revenue toggle |
| `src/components/forecast/disaggregation/SKUComparisonTable.tsx` | Sortable/filterable table with conditional formatting |
| `src/components/forecast/disaggregation/ComponentForecastView.tsx` | Component demand trend chart + material demand heatmap |
| `src/components/forecast/disaggregation/MarginImpactChart.tsx` | Dual-axis chart (volume + margin %) with scenario comparison |
| `src/components/forecast/disaggregation/ForecastBubbleChart.tsx` | Bubble chart (growth × margin × revenue × risk) |

### 3. Mock Data Extensions

**`src/data/mockData.ts`** — Add helper functions:
- `generateDisaggregationForecasts(skuIds, horizon)` — returns 12-month forward forecast per SKU with baseline/agent/planner scenarios
- `computeComponentDemand(skuIds, horizon)` — uses `bomTable` to translate SKU forecasts into material demand by month
- `computeDisaggregationKPIs(skuIds)` — returns forecasted revenue, volume growth %, accuracy delta, volatility index, margin impact %

### 4. Section-by-Section Implementation

**Section 2 — Filters**: New `DisaggregationFilters` component extends `GlobalFilters` with Horizon (3/6/12 months), Granularity (Monthly/Quarterly), and Scenario (Baseline ML/Agent Adjusted/Final Planner) selects. All state lifted to parent.

**Section 3 — View Toggle**: A `Tabs` component (shadcn) at page top: "SKU Forecast View" | "Component Forecast View". Controls which panels render below.

**Section 4 — KPI Strip**: 5 `KPICard`-style cards using existing `motion.div` pattern. Each card includes a tiny recharts `Sparkline` (48×20px) from historical trend data. KPIs computed from filtered forecast data.

**Section 5 — Multi-SKU Trend Chart**: `ResponsiveContainer` with `LineChart`. Top 10 SKUs by revenue get individual `<Line>` elements with distinct colors. Volume/Revenue toggle switches the Y-axis dataKey. Custom tooltip shows SKU name, volume, revenue, confidence.

**Section 6 — Comparison Table**: Uses `<Table>` from shadcn. Columns: SKU, Category, Revenue, Forecast Vol, Growth %, Confidence, Margin Contribution, Risk Level. Conditional cell styling via className logic (green/amber/red). Sortable headers, search input. Each row is clickable → navigates to deep dive.

**Section 7 — Component View**: Activated by toggle. `ComponentDemandTrendChart` — multi-line chart grouping materials by type (Surfactants, Builders, etc.) using `bomTable` × forecast volumes. `MaterialDemandHeatmap` — CSS grid matrix with color-intensity cells (white→navy scale) showing monthly demand per material.

**Section 8 — Margin Impact**: Dual-axis `ComposedChart` with `<Bar>` for volume and `<Line>` for margin %. Two lines for Baseline vs Agent scenarios.

**Section 9 — Bubble Chart**: `ScatterChart` with `<Scatter>` using `<Cell>` for risk-based coloring. X=growth, Y=margin impact, Z (bubble size)=revenue. Click navigates to deep dive.

**Section 10 — Drill Down**: All clickable SKU elements use `useNavigate()` to push to the existing forecast deep dive with the SKU pre-selected (via URL search params or state).

### 5. Design Compliance
- All cards use existing `kpi-card` class and `motion.div` animations
- Navy/slate palette from CSS variables, white card backgrounds
- Consistent 1400px max-width container
- Recharts tooltips use `ChartTooltipContent` pattern from existing chart.tsx
- Smooth `framer-motion` entry animations with staggered delays

### 6. Implementation Sequence
1. Add mock data helpers to `mockData.ts`
2. Build filter and KPI strip components
3. Build SKU trend chart and comparison table
4. Build component forecast view (chart + heatmap)
5. Build margin impact and bubble charts
6. Create main `ForecastDisaggregation` component assembling all sections
7. Update `ForecastIntelligence.tsx` with tab navigation (Disaggregation | Deep Dive)
8. Wire drill-down navigation

