

## Lab Intelligence Module

New page at `/lab` for R&D scientists to explore SKU formulations, run experiments with modified BOMs, and compare results.

### Page Structure

```text
┌──────────────────────────────────────────────────────────────┐
│  Header: "Lab Intelligence" + "New Experiment" button        │
├──────────────────────────────────────────────────────────────┤
│  SKU Selector (dropdown) + Saved Experiments list             │
├──────────────────────────────────────────────────────────────┤
│  TWO-PANEL BOM VIEW                                          │
│  ┌─────────────────────┐  ┌─────────────────────────────┐    │
│  │ RECIPE BOM (locked)  │  │ R&D BOM (editable)          │    │
│  │ Accordion per mat:   │  │ Accordion per mat:           │    │
│  │  MAT-001 LAS 22%    │  │  MAT-001 LAS → edit % or    │    │
│  │   cost, visc, pH,   │  │  swap material, edit %       │    │
│  │   density, perf     │  │  Shows delta vs Recipe       │    │
│  │  MAT-004 NaCarb 15% │  │  + "Add Material" button     │    │
│  └─────────────────────┘  └─────────────────────────────┘    │
├──────────────────────────────────────────────────────────────┤
│  [Run Simulation] button                                      │
├──────────────────────────────────────────────────────────────┤
│  SIMULATION RESULTS                                           │
│  Predicted properties: pH, viscosity, density, foam index,    │
│  texture score, consistency — shown as gauge cards with       │
│  Recipe vs R&D comparison bars                                │
│  Quality verdict: Pass / Review / Fail                        │
├──────────────────────────────────────────────────────────────┤
│  EXPERIMENT HISTORY (saved experiments table)                 │
│  Name | SKU | Date | Cost Δ | Quality | [Compare] [Load]     │
│  Compare mode: select 2 experiments, side-by-side results     │
└──────────────────────────────────────────────────────────────┘
```

### Files to Create/Modify

1. **`src/pages/LabIntelligence.tsx`** — Main page with SKU selector, two-panel BOM view, simulation trigger, results display, experiment history
2. **`src/components/lab/RecipeBOM.tsx`** — Read-only accordion of current BOM materials with cost/property details
3. **`src/components/lab/RnDBOM.tsx`** — Editable accordion: adjust composition %, swap materials via dropdown, add/remove materials, shows delta vs recipe
4. **`src/components/lab/SimulationResults.tsx`** — Predicted SKU properties (pH, viscosity, density, foam, texture, consistency) as comparison cards with quality verdict
5. **`src/components/lab/ExperimentHistory.tsx`** — Table of saved experiments with compare toggle; localStorage persistence
6. **`src/data/mockData.ts`** — Add `simulateFormulation(bomEntries[])` function that computes weighted-average properties from material attributes, plus quality thresholds per category
7. **`src/App.tsx`** — Add `/lab` route
8. **`src/components/layout/AppSidebar.tsx`** — Add Lab Intelligence nav item with `FlaskConical` or `Microscope` icon

### Simulation Logic

`simulateFormulation()` will compute weighted averages of material properties based on composition percentages:
- **pH** — weighted average of material pH values
- **Viscosity** — weighted sum
- **Density** — weighted sum
- **Foam Index** — derived from surfactant % and performance indices
- **Texture Score** — function of viscosity range and humectant content
- **Consistency Rating** — composite of density variance and pH stability

Each property has acceptable ranges per category (Laundry, Dishwash, Personal Care, Home Care). The simulation returns a pass/review/fail verdict.

### Material Accordion Detail

Each material row in the accordion shows:
- Name, type, composition %
- Cost/kg, total cost contribution
- Viscosity, density, pH, performance index
- Supplier name, lead time, reliability

### Experiment Persistence

Experiments saved to `localStorage` as JSON array: `{ id, name, skuId, date, rdBom[], results, notes }`. Load/delete/compare from the history table.

