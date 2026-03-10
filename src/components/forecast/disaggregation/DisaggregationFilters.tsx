import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { skuMaster } from "@/data/mockData";

export interface DisaggregationFilterState {
  category: string;
  brand: string;
  region: string;
  channel: string;
  horizon: "3" | "6" | "12";
  granularity: "monthly" | "quarterly";
  scenario: "baseline" | "agent" | "planner";
}

export const defaultDisaggregationFilters: DisaggregationFilterState = {
  category: "",
  brand: "",
  region: "",
  channel: "",
  horizon: "12",
  granularity: "monthly",
  scenario: "baseline",
};

interface Props {
  filters: DisaggregationFilterState;
  onChange: (filters: DisaggregationFilterState) => void;
}

const brands = [...new Set(skuMaster.map(s => s.brand))];
const categories = [...new Set(skuMaster.map(s => s.category))];
const regions = [...new Set(skuMaster.map(s => s.region))];
const channels = [...new Set(skuMaster.map(s => s.channel))];

export function filterDisaggregationSKUs(filters: DisaggregationFilterState) {
  return skuMaster.filter(s =>
    (!filters.category || s.category === filters.category) &&
    (!filters.brand || s.brand === filters.brand) &&
    (!filters.region || s.region === filters.region) &&
    (!filters.channel || s.channel === filters.channel)
  );
}

export function DisaggregationFilters({ filters, onChange }: Props) {
  const activeCount = [filters.category, filters.brand, filters.region, filters.channel].filter(Boolean).length;

  const update = (key: keyof DisaggregationFilterState, value: string) => {
    onChange({ ...filters, [key]: value === "all" ? "" : value });
  };

  const clearAll = () => onChange(defaultDisaggregationFilters);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <FilterSelect label="Category" value={filters.category} options={categories} onChange={v => update("category", v)} />
      <FilterSelect label="Brand" value={filters.brand} options={brands} onChange={v => update("brand", v)} />
      <FilterSelect label="Region" value={filters.region} options={regions} onChange={v => update("region", v)} />
      <FilterSelect label="Channel" value={filters.channel} options={channels} onChange={v => update("channel", v)} />

      <div className="h-6 w-px bg-border mx-1" />

      <Select value={filters.horizon} onValueChange={v => update("horizon", v)}>
        <SelectTrigger className="w-[120px] h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="3">3 Months</SelectItem>
          <SelectItem value="6">6 Months</SelectItem>
          <SelectItem value="12">12 Months</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.granularity} onValueChange={v => update("granularity", v)}>
        <SelectTrigger className="w-[110px] h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="monthly">Monthly</SelectItem>
          <SelectItem value="quarterly">Quarterly</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.scenario} onValueChange={v => update("scenario", v)}>
        <SelectTrigger className="w-[150px] h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="baseline">Baseline ML</SelectItem>
          <SelectItem value="agent">Agent Adjusted</SelectItem>
          <SelectItem value="planner">Final Planner</SelectItem>
        </SelectContent>
      </Select>

      {activeCount > 0 && (
        <button onClick={clearAll} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors ml-1">
          <X className="h-3 w-3" />
          Clear ({activeCount})
        </button>
      )}
    </div>
  );
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <Select value={value || "all"} onValueChange={onChange}>
      <SelectTrigger className="w-[130px] h-8 text-xs">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All {label}s</SelectItem>
        {options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}
