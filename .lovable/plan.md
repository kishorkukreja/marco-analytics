

## Updated Plan: Agent Insights as Side Panel

The only change from the approved plan is that the **Agent Insights** component will use a `Sheet` (side panel sliding from the right) instead of a `Dialog`.

### What changes

- **`src/components/forecast/AgentInsightsDialog.tsx`** → Rename to `AgentInsightsPanel.tsx`. Use `Sheet` + `SheetContent` (side="right", wide width ~`sm:max-w-2xl`) instead of `Dialog`/`DialogContent`. Internal structure (6 narrative sections with accordion/tabs) remains identical.
- The Brain/Sparkles icon in `SKUForecastAccordion.tsx` will trigger `Sheet` open state instead of `Dialog` open state.

Everything else in the previously approved plan (alert widgets, business summary, SKU accordion, narrative generation, mockData helpers) stays exactly the same.

