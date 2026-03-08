import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { skuMaster } from "@/data/mockData";

export interface FilterState {
  brand: string;
  category: string;
  region: string;
  channel: string;
}

interface GlobalFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

const brands = [...new Set(skuMaster.map(s => s.brand))];
const categories = [...new Set(skuMaster.map(s => s.category))];
const regions = [...new Set(skuMaster.map(s => s.region))];
const channels = [...new Set(skuMaster.map(s => s.channel))];

export function filterSKUs(filters: FilterState) {
  return skuMaster.filter(s =>
    (!filters.brand || s.brand === filters.brand) &&
    (!filters.category || s.category === filters.category) &&
    (!filters.region || s.region === filters.region) &&
    (!filters.channel || s.channel === filters.channel)
  );
}

export const defaultFilters: FilterState = { brand: "", category: "", region: "", channel: "" };

export function GlobalFilters({ filters, onChange }: GlobalFiltersProps) {
  const activeCount = Object.values(filters).filter(Boolean).length;

  const update = (key: keyof FilterState, value: string) => {
    onChange({ ...filters, [key]: value === "all" ? "" : value });
  };

  const clearAll = () => onChange(defaultFilters);

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <FilterSelect label="Brand" value={filters.brand} options={brands} onChange={v => update("brand", v)} />
      <FilterSelect label="Category" value={filters.category} options={categories} onChange={v => update("category", v)} />
      <FilterSelect label="Region" value={filters.region} options={regions} onChange={v => update("region", v)} />
      <FilterSelect label="Channel" value={filters.channel} options={channels} onChange={v => update("channel", v)} />
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
      <SelectTrigger className="w-[140px] h-8 text-xs">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All {label}s</SelectItem>
        {options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}
