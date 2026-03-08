

## Plan: Scenario-Driven Simulation with Save & Compare

### What Changes

**3 major additions to the Simulation Engine:**

1. **Scenario Triggers Panel** — New section at the top with pre-built scenario cards (Macroeconomic, Supply Chain, Strategic, Demand) that provide context on *why* to simulate and auto-fill SKU/material selections.

2. **Multi-Metric Monte Carlo** — Replace cost-only Monte Carlo with 6 business metrics: Service Level, Margin, Inventory Turnover, Profitability, Time to Make, Lead Time. Tabbed histograms + radar chart summary.

3. **Save & Compare Scenarios** — After running a simulation, users can name and save it to local state. A "Compare" panel lets them select 2+ saved scenarios and view side-by-side results across all metrics.

### File Changes

#### `src/data/mockData.ts`
- Add `ScenarioTrigger` interface and `scenarioTriggers[]` array with ~8 pre-built scenarios across 4 categories
- Add `simulateMultiMetric()` function returning distributions for Service Level, Margin, Turnover, Profitability, Time to Make, Lead Time
- Add `SavedScenario` interface (id, name, timestamp, skuId, materialId, substituteId, triggerType, results)

#### `src/pages/SimulationEngine.tsx`
- **Top section**: Scenario Triggers with category tabs (All | Macro | Supply Chain | Strategic | Demand), clickable cards that auto-fill simulation params and show a context banner
- **Monte Carlo section**: Replace single cost histogram with tabbed multi-metric view (6 tabs) + Recharts RadarChart summary
- **Save flow**: After simulation completes, show "Save Scenario" button → name input dialog → saves to `useState` array (persisted to `localStorage`)
- **Compare panel**: Toggle-able comparison view showing a table of saved scenarios with checkboxes → side-by-side KPI cards and radar overlay for selected scenarios

### UI Flow

```text
┌─ Scenario Triggers ──────────────────────────┐
│ [All] [Macro] [Supply Chain] [Strategic] ...  │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐  │
│ │Commodity│ │Supplier│ │Margin  │ │Forecast│  │
│ │Surge   │ │Disrupt │ │Recovery│ │Deviation│  │
│ └────────┘ └────────┘ └────────┘ └────────┘  │
├─ Context Banner: "Simulating because..."──────┤
├─ SKU → Material → Substitute (existing) ──────┤
├─ Run Simulation + Results ────────────────────┤
├─ Monte Carlo Tabs ────────────────────────────┤
│ [Service Level][Margin][Turnover][Profit]...  │
│ [Histogram] + [Radar Summary]                 │
├─ [💾 Save Scenario] [📊 Compare Scenarios] ──┤
├─ Compare Panel (when toggled) ────────────────┤
│ Saved scenarios table → side-by-side view     │
└───────────────────────────────────────────────┘
```

### Technical Details

- **Scenario triggers** link to `skuAlerts` where applicable (e.g., ALR-002 cost spike → "Commodity Price Surge" scenario)
- **Multi-metric Monte Carlo** uses the same Box-Muller random generation but with metric-specific means/stddevs derived from the cost simulation output
- **Save/Compare** uses `localStorage` for persistence across sessions, with a `savedScenarios` state array
- **Compare radar** overlays multiple scenarios on a single `RadarChart` with different colors
- Scenario selection from Dashboard "Simulate" icon will pre-select matching trigger if one exists

