// ========== MASTER DATA ==========

export interface SKU {
  id: string;
  name: string;
  brand: string;
  category: string;
  region: string;
  packSize: string;
  channel: string;
  annualVolume: number;
  currentMargin: number;
  revenue: number;
}

export interface Material {
  id: string;
  name: string;
  type: string;
  viscosity: number;
  density: number;
  pH: number;
  performanceIndex: number;
  costPerKg: number;
  supplierId: string;
}

export interface Supplier {
  id: string;
  name: string;
  country: string;
  leadTimeDays: number;
  moq: number;
  reliabilityScore: number;
}

export interface BOMEntry {
  skuId: string;
  materialId: string;
  compositionPct: number;
}

export interface CostRecord {
  month: string;
  materialId: string;
  costPerKg: number;
}

export interface ForecastRecord {
  month: string;
  skuId: string;
  baselineForecast: number;
  adjustedForecast: number;
  actualDemand: number | null;
  confidenceScore: number;
  anomalyFlag: boolean;
}

// ========== SKU MASTER ==========
export const skuMaster: SKU[] = [
  { id: "SKU-001", name: "UltraClean Detergent 1L", brand: "UltraClean", category: "Laundry", region: "EMEA", packSize: "1L", channel: "Retail", annualVolume: 2400000, currentMargin: 32.4, revenue: 18200000 },
  { id: "SKU-002", name: "UltraClean Detergent 2L", brand: "UltraClean", category: "Laundry", region: "EMEA", packSize: "2L", channel: "Retail", annualVolume: 1800000, currentMargin: 28.7, revenue: 21600000 },
  { id: "SKU-003", name: "FreshGlow Dishwash 500ml", brand: "FreshGlow", category: "Dishwash", region: "APAC", packSize: "500ml", channel: "E-Commerce", annualVolume: 3200000, currentMargin: 35.1, revenue: 9600000 },
  { id: "SKU-004", name: "PureShield Hand Soap 250ml", brand: "PureShield", category: "Personal Care", region: "NA", packSize: "250ml", channel: "Retail", annualVolume: 4100000, currentMargin: 41.2, revenue: 12300000 },
  { id: "SKU-005", name: "AquaFresh Surface Cleaner 750ml", brand: "AquaFresh", category: "Home Care", region: "LATAM", packSize: "750ml", channel: "Retail", annualVolume: 1500000, currentMargin: 26.3, revenue: 7500000 },
  { id: "SKU-006", name: "BrightWave Fabric Softener 1.5L", brand: "BrightWave", category: "Laundry", region: "EMEA", packSize: "1.5L", channel: "Wholesale", annualVolume: 900000, currentMargin: 22.8, revenue: 5400000 },
  { id: "SKU-007", name: "EcoGuard All-Purpose 1L", brand: "EcoGuard", category: "Home Care", region: "NA", packSize: "1L", channel: "E-Commerce", annualVolume: 2100000, currentMargin: 38.5, revenue: 10500000 },
  { id: "SKU-008", name: "VelvetTouch Body Wash 400ml", brand: "VelvetTouch", category: "Personal Care", region: "APAC", packSize: "400ml", channel: "Retail", annualVolume: 2800000, currentMargin: 44.1, revenue: 16800000 },
];

// ========== MATERIAL MASTER ==========
export const materialMaster: Material[] = [
  { id: "MAT-001", name: "Linear Alkylbenzene Sulfonate (LAS)", type: "Surfactant", viscosity: 45, density: 1.06, pH: 7.2, performanceIndex: 92, costPerKg: 2.85, supplierId: "SUP-001" },
  { id: "MAT-002", name: "Sodium Laureth Sulfate (SLES)", type: "Surfactant", viscosity: 38, density: 1.04, pH: 7.0, performanceIndex: 88, costPerKg: 3.20, supplierId: "SUP-002" },
  { id: "MAT-003", name: "Cocamidopropyl Betaine", type: "Surfactant", viscosity: 42, density: 1.05, pH: 6.8, performanceIndex: 85, costPerKg: 4.10, supplierId: "SUP-003" },
  { id: "MAT-004", name: "Sodium Carbonate", type: "Builder", viscosity: 0, density: 2.54, pH: 11.6, performanceIndex: 78, costPerKg: 0.45, supplierId: "SUP-001" },
  { id: "MAT-005", name: "Zeolite 4A", type: "Builder", viscosity: 0, density: 2.12, pH: 10.5, performanceIndex: 82, costPerKg: 0.62, supplierId: "SUP-004" },
  { id: "MAT-006", name: "Citric Acid", type: "Chelating Agent", viscosity: 12, density: 1.66, pH: 2.2, performanceIndex: 90, costPerKg: 1.15, supplierId: "SUP-002" },
  { id: "MAT-007", name: "TAED Activator", type: "Bleach Activator", viscosity: 0, density: 1.1, pH: 7.0, performanceIndex: 94, costPerKg: 5.80, supplierId: "SUP-005" },
  { id: "MAT-008", name: "Glycerin", type: "Humectant", viscosity: 1412, density: 1.26, pH: 7.0, performanceIndex: 96, costPerKg: 1.95, supplierId: "SUP-003" },
  { id: "MAT-009", name: "Sodium Hydroxide", type: "pH Adjuster", viscosity: 78, density: 2.13, pH: 14.0, performanceIndex: 88, costPerKg: 0.38, supplierId: "SUP-001" },
  { id: "MAT-010", name: "Alpha Olefin Sulfonate (AOS)", type: "Surfactant", viscosity: 40, density: 1.05, pH: 7.1, performanceIndex: 90, costPerKg: 2.40, supplierId: "SUP-004" },
];

// ========== SUPPLIER MASTER ==========
export const supplierMaster: Supplier[] = [
  { id: "SUP-001", name: "ChemCorp Global", country: "Germany", leadTimeDays: 14, moq: 5000, reliabilityScore: 94 },
  { id: "SUP-002", name: "Pacific Chemicals", country: "China", leadTimeDays: 28, moq: 10000, reliabilityScore: 87 },
  { id: "SUP-003", name: "BioSource Inc.", country: "USA", leadTimeDays: 10, moq: 2000, reliabilityScore: 96 },
  { id: "SUP-004", name: "IndoChem", country: "India", leadTimeDays: 21, moq: 8000, reliabilityScore: 82 },
  { id: "SUP-005", name: "EuroSynth AG", country: "Netherlands", leadTimeDays: 12, moq: 3000, reliabilityScore: 91 },
];

// ========== BOM TABLE ==========
export const bomTable: BOMEntry[] = [
  { skuId: "SKU-001", materialId: "MAT-001", compositionPct: 22 },
  { skuId: "SKU-001", materialId: "MAT-004", compositionPct: 15 },
  { skuId: "SKU-001", materialId: "MAT-006", compositionPct: 5 },
  { skuId: "SKU-001", materialId: "MAT-007", compositionPct: 8 },
  { skuId: "SKU-002", materialId: "MAT-001", compositionPct: 20 },
  { skuId: "SKU-002", materialId: "MAT-005", compositionPct: 18 },
  { skuId: "SKU-002", materialId: "MAT-006", compositionPct: 4 },
  { skuId: "SKU-003", materialId: "MAT-002", compositionPct: 18 },
  { skuId: "SKU-003", materialId: "MAT-006", compositionPct: 6 },
  { skuId: "SKU-003", materialId: "MAT-009", compositionPct: 3 },
  { skuId: "SKU-004", materialId: "MAT-003", compositionPct: 14 },
  { skuId: "SKU-004", materialId: "MAT-008", compositionPct: 10 },
  { skuId: "SKU-005", materialId: "MAT-006", compositionPct: 8 },
  { skuId: "SKU-005", materialId: "MAT-010", compositionPct: 16 },
  { skuId: "SKU-006", materialId: "MAT-003", compositionPct: 12 },
  { skuId: "SKU-006", materialId: "MAT-008", compositionPct: 15 },
  { skuId: "SKU-007", materialId: "MAT-010", compositionPct: 20 },
  { skuId: "SKU-007", materialId: "MAT-006", compositionPct: 7 },
  { skuId: "SKU-008", materialId: "MAT-002", compositionPct: 16 },
  { skuId: "SKU-008", materialId: "MAT-008", compositionPct: 12 },
];

// ========== HISTORICAL COST DATA (12 months) ==========
const months12 = ["Jan'25","Feb'25","Mar'25","Apr'25","May'25","Jun'25","Jul'25","Aug'25","Sep'25","Oct'25","Nov'25","Dec'25"];

export const historicalCosts: CostRecord[] = materialMaster.flatMap(mat =>
  months12.map((month, i) => ({
    month,
    materialId: mat.id,
    costPerKg: +(mat.costPerKg * (1 + (Math.sin(i * 0.5) * 0.08) + (Math.random() - 0.5) * 0.04)).toFixed(2),
  }))
);

// ========== FORECAST DATA (24 months) ==========
const months24 = [
  "Jan'24","Feb'24","Mar'24","Apr'24","May'24","Jun'24","Jul'24","Aug'24","Sep'24","Oct'24","Nov'24","Dec'24",
  ...months12,
];

export const forecastData: ForecastRecord[] = skuMaster.flatMap(sku =>
  months24.map((month, i) => {
    const seasonality = 1 + Math.sin((i % 12) * Math.PI / 6) * 0.15;
    const trend = 1 + i * 0.003;
    const base = (sku.annualVolume / 12) * seasonality * trend;
    const noise = (Math.random() - 0.5) * base * 0.08;
    const baseline = Math.round(base + noise);
    const adjusted = Math.round(baseline * (1 + (Math.random() - 0.5) * 0.04));
    const actual = i < 20 ? Math.round(baseline * (1 + (Math.random() - 0.5) * 0.1)) : null;
    const confidence = +(75 + Math.random() * 20).toFixed(1);
    const anomaly = confidence < 80 || Math.abs((adjusted - baseline) / baseline) > 0.12;
    return { month, skuId: sku.id, baselineForecast: baseline, adjustedForecast: adjusted, actualDemand: actual, confidenceScore: confidence, anomalyFlag: anomaly };
  })
);

// ========== LOGISTICS MASTER ==========
export const logisticsRates = [
  { originCountry: "Germany", destRegion: "EMEA", freightPerKg: 0.12, dutyPct: 0, warehousePerUnit: 0.08 },
  { originCountry: "China", destRegion: "EMEA", freightPerKg: 0.28, dutyPct: 4.5, warehousePerUnit: 0.08 },
  { originCountry: "USA", destRegion: "NA", freightPerKg: 0.09, dutyPct: 0, warehousePerUnit: 0.06 },
  { originCountry: "India", destRegion: "APAC", freightPerKg: 0.18, dutyPct: 2.0, warehousePerUnit: 0.05 },
  { originCountry: "Netherlands", destRegion: "EMEA", freightPerKg: 0.10, dutyPct: 0, warehousePerUnit: 0.08 },
  { originCountry: "China", destRegion: "APAC", freightPerKg: 0.15, dutyPct: 3.0, warehousePerUnit: 0.05 },
  { originCountry: "Germany", destRegion: "NA", freightPerKg: 0.22, dutyPct: 2.5, warehousePerUnit: 0.06 },
  { originCountry: "India", destRegion: "EMEA", freightPerKg: 0.24, dutyPct: 3.5, warehousePerUnit: 0.08 },
  { originCountry: "USA", destRegion: "EMEA", freightPerKg: 0.20, dutyPct: 2.0, warehousePerUnit: 0.08 },
];

// ========== SIMILARITY ENGINE ==========
export function calculateSimilarity(mat1: Material, mat2: Material): number {
  if (mat1.type !== mat2.type) return 0;
  const weights = { viscosity: 0.2, density: 0.2, pH: 0.25, performanceIndex: 0.35 };
  const ranges = { viscosity: 1500, density: 2, pH: 14, performanceIndex: 100 };
  
  const score = 1 - (
    weights.viscosity * Math.abs(mat1.viscosity - mat2.viscosity) / ranges.viscosity +
    weights.density * Math.abs(mat1.density - mat2.density) / ranges.density +
    weights.pH * Math.abs(mat1.pH - mat2.pH) / ranges.pH +
    weights.performanceIndex * Math.abs(mat1.performanceIndex - mat2.performanceIndex) / ranges.performanceIndex
  );
  
  const costProximity = 1 - Math.abs(mat1.costPerKg - mat2.costPerKg) / Math.max(mat1.costPerKg, mat2.costPerKg) * 0.3;
  return +((score * 0.7 + costProximity * 0.3) * 100).toFixed(1);
}

export function calculateRiskScore(mat1: Material, mat2: Material): number {
  const supplier = supplierMaster.find(s => s.id === mat2.supplierId);
  const reliabilityFactor = supplier ? (100 - supplier.reliabilityScore) / 100 : 0.5;
  const attrVariance = (
    Math.abs(mat1.viscosity - mat2.viscosity) / Math.max(mat1.viscosity, 1) +
    Math.abs(mat1.density - mat2.density) / mat1.density +
    Math.abs(mat1.pH - mat2.pH) / 14 +
    Math.abs(mat1.performanceIndex - mat2.performanceIndex) / 100
  ) / 4;
  const historicalFailureRate = 0.12;
  return +(attrVariance * historicalFailureRate * reliabilityFactor * 100).toFixed(1);
}

// ========== COST SIMULATION ==========
export function simulateLandedCost(
  sku: SKU,
  originalMat: Material,
  substituteMat: Material,
  compositionPct: number
) {
  const origSupplier = supplierMaster.find(s => s.id === originalMat.supplierId)!;
  const subSupplier = supplierMaster.find(s => s.id === substituteMat.supplierId)!;
  
  const origLogistics = logisticsRates.find(l => l.originCountry === origSupplier.country && l.destRegion === sku.region) || logisticsRates[0];
  const subLogistics = logisticsRates.find(l => l.originCountry === subSupplier.country && l.destRegion === sku.region) || logisticsRates[0];
  
  const volumeKg = sku.annualVolume * (compositionPct / 100);
  
  const origFormulation = originalMat.costPerKg * volumeKg;
  const subFormulation = substituteMat.costPerKg * volumeKg;
  
  const origFreight = origLogistics.freightPerKg * volumeKg;
  const subFreight = subLogistics.freightPerKg * volumeKg;
  
  const origDuty = origFormulation * (origLogistics.dutyPct / 100);
  const subDuty = subFormulation * (subLogistics.dutyPct / 100);
  
  const origWarehouse = origLogistics.warehousePerUnit * sku.annualVolume;
  const subWarehouse = subLogistics.warehousePerUnit * sku.annualVolume;
  
  const packagingAdj = Math.abs(originalMat.density - substituteMat.density) * volumeKg * 0.05;
  const manufacturingCost = volumeKg * 0.15;
  
  const origTotal = origFormulation + origFreight + origDuty + origWarehouse + manufacturingCost;
  const subTotal = subFormulation + subFreight + subDuty + subWarehouse + manufacturingCost + packagingAdj;
  
  return {
    original: { formulation: origFormulation, freight: origFreight, duty: origDuty, warehouse: origWarehouse, manufacturing: manufacturingCost, packaging: 0, total: origTotal },
    substitute: { formulation: subFormulation, freight: subFreight, duty: subDuty, warehouse: subWarehouse, manufacturing: manufacturingCost, packaging: packagingAdj, total: subTotal },
    savings: origTotal - subTotal,
    marginImpact: +((origTotal - subTotal) / sku.revenue * 100).toFixed(2),
  };
}

// ========== KPI AGGREGATES ==========
export const dashboardKPIs = {
  totalRevenue: skuMaster.reduce((s, sku) => s + sku.revenue, 0),
  avgMargin: +(skuMaster.reduce((s, sku) => s + sku.currentMargin, 0) / skuMaster.length).toFixed(1),
  totalSKUs: skuMaster.length,
  activeSimulations: 14,
  identifiedSavings: 2340000,
  riskAlerts: 3,
  forecastAccuracy: 91.4,
  optimizationRuns: 47,
};

// ========== TREND DATA (12 months) ==========
export const trendData = months12.map((month, i) => {
  const baseRev = 8.2 + Math.sin(i * 0.6) * 1.5 + i * 0.25;
  const costRatio = 0.65 + Math.sin(i * 0.4) * 0.03 + (Math.random() - 0.5) * 0.02;
  const totalCost = +(baseRev * costRatio).toFixed(2);
  const margin = +(((baseRev - totalCost) / baseRev) * 100).toFixed(1);
  return {
    month,
    totalCost,
    revenue: +baseRev.toFixed(2),
    margin,
    lyRevenue: +(baseRev * 0.92).toFixed(2),
    lyCost: +(totalCost * 0.95).toFixed(2),
  };
});

// ========== SAVINGS BY CATEGORY ==========
export const savingsByCategory = [
  { category: "Laundry", realized: 890000, potential: 1200000 },
  { category: "Dishwash", realized: 340000, potential: 520000 },
  { category: "Personal Care", realized: 620000, potential: 780000 },
  { category: "Home Care", realized: 490000, potential: 640000 },
];

// ========== COST OVER TIME BY CATEGORY ==========
export const costOverTime = months12.map((month, i) => ({
  month,
  Laundry: +(3.2 + Math.sin(i * 0.5) * 0.4 + i * 0.08).toFixed(2),
  Dishwash: +(1.8 + Math.sin(i * 0.4) * 0.25 + i * 0.05).toFixed(2),
  "Personal Care": +(2.4 + Math.sin(i * 0.6) * 0.3 + i * 0.06).toFixed(2),
  "Home Care": +(1.5 + Math.sin(i * 0.3) * 0.2 + i * 0.04).toFixed(2),
}));

// ========== SERVICE LEVEL BY CATEGORY ==========
export const serviceLevelData = [
  { category: "Laundry", fillRate: 96.2, onTimeDelivery: 94.1, stockoutDays: 3, forecastAccuracy: 92.5 },
  { category: "Dishwash", fillRate: 93.8, onTimeDelivery: 91.5, stockoutDays: 7, forecastAccuracy: 88.2 },
  { category: "Personal Care", fillRate: 97.5, onTimeDelivery: 96.3, stockoutDays: 1, forecastAccuracy: 94.8 },
  { category: "Home Care", fillRate: 91.4, onTimeDelivery: 89.7, stockoutDays: 9, forecastAccuracy: 86.1 },
];

// ========== MARGIN BY CHANNEL ==========
export const marginByChannel = [
  { channel: "Retail", avgMargin: 33.2, revenue: 58000000, skuCount: 5 },
  { channel: "E-Commerce", avgMargin: 36.8, revenue: 20100000, skuCount: 2 },
  { channel: "Wholesale", avgMargin: 22.8, revenue: 5400000, skuCount: 1 },
];

// ========== COST BY REGION ==========
export const costByRegion = [
  { region: "EMEA", materialCost: 4.2, freightCost: 0.9, dutyCost: 0.3, totalCost: 5.4 },
  { region: "APAC", materialCost: 3.1, freightCost: 1.2, dutyCost: 0.5, totalCost: 4.8 },
  { region: "NA", materialCost: 3.8, freightCost: 0.6, dutyCost: 0.2, totalCost: 4.6 },
  { region: "LATAM", materialCost: 2.9, freightCost: 1.4, dutyCost: 0.6, totalCost: 4.9 },
];

// ========== SKU ALERTS ==========
export interface SKUAlert {
  id: string;
  skuId: string;
  type: "margin_erosion" | "cost_spike" | "substitution_opportunity" | "forecast_deviation";
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  impact: string;
  timestamp: string;
}

export const skuAlerts: SKUAlert[] = [
  { id: "ALR-001", skuId: "SKU-006", type: "margin_erosion", severity: "high", title: "Margin below threshold", description: "BrightWave Softener margin dropped to 22.8%, below 25% floor", impact: "-$180K annual", timestamp: "2h ago" },
  { id: "ALR-002", skuId: "SKU-001", type: "cost_spike", severity: "high", title: "LAS surfactant cost +12%", description: "MAT-001 cost increased from $2.85 to $3.19/kg over 3 months", impact: "+$410K COGS", timestamp: "4h ago" },
  { id: "ALR-003", skuId: "SKU-005", type: "margin_erosion", severity: "medium", title: "LATAM freight increase", description: "AquaFresh Surface Cleaner freight costs up 15% due to route changes", impact: "-$95K annual", timestamp: "6h ago" },
  { id: "ALR-004", skuId: "SKU-001", type: "substitution_opportunity", severity: "low", title: "AOS substitute available", description: "MAT-010 (AOS) shows 89.4% similarity to LAS at 16% lower cost", impact: "+$320K savings", timestamp: "1d ago" },
  { id: "ALR-005", skuId: "SKU-003", type: "forecast_deviation", severity: "medium", title: "Q3 demand under-forecast", description: "FreshGlow Dishwash actual demand exceeded forecast by 14% in Sep", impact: "Lost sales risk", timestamp: "1d ago" },
  { id: "ALR-006", skuId: "SKU-008", type: "substitution_opportunity", severity: "low", title: "SLES alternative identified", description: "AOS surfactant viable for VelvetTouch Body Wash with 82% similarity", impact: "+$210K savings", timestamp: "2d ago" },
  { id: "ALR-007", skuId: "SKU-002", type: "cost_spike", severity: "medium", title: "Zeolite 4A supply tightening", description: "IndoChem lead times extended to 28 days, MOQ increased", impact: "Supply risk", timestamp: "3d ago" },
];

// ========== HEURISTIC FORECAST DATA ==========
export function generateHeuristicForecast(skuId: string) {
  const skuForecasts = forecastData.filter(f => f.skuId === skuId);
  return skuForecasts.map((f, i) => {
    const base = f.baselineForecast;
    // CoC (Change over Change) - previous period growth applied
    const prevBase = i > 0 ? skuForecasts[i - 1].baselineForecast : base;
    const cocGrowth = i > 1 ? (skuForecasts[i - 1].baselineForecast / skuForecasts[i - 2].baselineForecast) : 1;
    const coc = Math.round(prevBase * cocGrowth);

    // LY (Last Year) - same month last year
    const lyIdx = i - 12;
    const ly = lyIdx >= 0 ? skuForecasts[lyIdx].baselineForecast : base;

    // L2Y (Last 2 Years average)
    const l2yIdx = i - 24;
    const l2y = l2yIdx >= 0
      ? Math.round((skuForecasts[lyIdx]?.baselineForecast + skuForecasts[l2yIdx]?.baselineForecast) / 2)
      : lyIdx >= 0 ? ly : base;

    return {
      month: f.month,
      baseline: base,
      adjusted: f.adjustedForecast,
      actual: f.actualDemand,
      coc,
      ly,
      l2y,
      confidenceScore: f.confidenceScore,
      anomalyFlag: f.anomalyFlag,
    };
  });
}

export function computeHeuristicConfidence(heuristicData: ReturnType<typeof generateHeuristicForecast>) {
  const withActuals = heuristicData.filter(d => d.actual !== null);
  if (withActuals.length === 0) return { total: 75, cocAlignment: 70, lyAlignment: 75, l2yAlignment: 72, biasStability: 78, volatility: 68 };

  const cocErrors = withActuals.map(d => Math.abs((d.coc - d.actual!) / d.actual!));
  const cocAlignment = Math.max(0, 100 - (cocErrors.reduce((a, b) => a + b, 0) / cocErrors.length) * 100 * 2);

  const lyErrors = withActuals.map(d => Math.abs((d.ly - d.actual!) / d.actual!));
  const lyAlignment = Math.max(0, 100 - (lyErrors.reduce((a, b) => a + b, 0) / lyErrors.length) * 100 * 2);

  const l2yErrors = withActuals.map(d => Math.abs((d.l2y - d.actual!) / d.actual!));
  const l2yAlignment = Math.max(0, 100 - (l2yErrors.reduce((a, b) => a + b, 0) / l2yErrors.length) * 100 * 2);

  const biases = withActuals.map(d => (d.baseline - d.actual!) / d.actual!);
  const avgBias = biases.reduce((a, b) => a + b, 0) / biases.length;
  const biasVariance = biases.reduce((a, b) => a + Math.pow(b - avgBias, 2), 0) / biases.length;
  const biasStability = Math.max(0, Math.min(100, 100 - biasVariance * 1000));

  const diffs = withActuals.slice(1).map((d, i) => Math.abs(d.actual! - withActuals[i].actual!) / withActuals[i].actual!);
  const avgVol = diffs.length > 0 ? diffs.reduce((a, b) => a + b, 0) / diffs.length : 0.1;
  const volatility = Math.max(0, Math.min(100, 100 - avgVol * 200));

  const total = +(cocAlignment * 0.25 + lyAlignment * 0.25 + l2yAlignment * 0.20 + biasStability * 0.15 + volatility * 0.15).toFixed(1);

  return {
    total,
    cocAlignment: +cocAlignment.toFixed(1),
    lyAlignment: +lyAlignment.toFixed(1),
    l2yAlignment: +l2yAlignment.toFixed(1),
    biasStability: +biasStability.toFixed(1),
    volatility: +volatility.toFixed(1),
  };
}

// ========== SCENARIO TRIGGERS ==========
export type ScenarioCategory = "macroeconomic" | "supply_chain" | "strategic" | "demand";

export interface ScenarioTrigger {
  id: string;
  category: ScenarioCategory;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium";
  affectedSKUs: string[];
  affectedMaterials: string[];
  recommendedAction: string;
  icon: string;
  timestamp: string;
}

export const scenarioTriggers: ScenarioTrigger[] = [
  { id: "SCN-001", category: "macroeconomic", title: "Commodity Price Surge", description: "Palm oil derivatives up 18% due to export restrictions in SE Asia. Direct impact on surfactant costs.", severity: "critical", affectedSKUs: ["SKU-001", "SKU-002", "SKU-003"], affectedMaterials: ["MAT-001", "MAT-002"], recommendedAction: "Evaluate AOS-based substitutes to hedge against LAS/SLES price volatility", icon: "TrendingUp", timestamp: "2h ago" },
  { id: "SCN-002", category: "supply_chain", title: "Supplier Disruption — IndoChem", description: "IndoChem (India) facility shutdown due to regulatory compliance. Lead times extended 3x for Zeolite 4A and AOS.", severity: "critical", affectedSKUs: ["SKU-002", "SKU-005", "SKU-007"], affectedMaterials: ["MAT-005", "MAT-010"], recommendedAction: "Activate secondary supplier qualification for Zeolite and AOS materials", icon: "AlertTriangle", timestamp: "4h ago" },
  { id: "SCN-003", category: "macroeconomic", title: "EUR/USD Currency Shift", description: "Euro weakened 6% vs USD. EMEA-sourced materials from Germany/Netherlands now relatively cheaper for NA operations.", severity: "medium", affectedSKUs: ["SKU-004", "SKU-007"], affectedMaterials: ["MAT-001", "MAT-004", "MAT-009"], recommendedAction: "Re-evaluate cross-regional sourcing to exploit currency arbitrage", icon: "DollarSign", timestamp: "1d ago" },
  { id: "SCN-004", category: "supply_chain", title: "Port Congestion — Rotterdam", description: "Major delays at Rotterdam port affecting all EMEA inbound shipments. Average +12 days to lead times.", severity: "high", affectedSKUs: ["SKU-001", "SKU-002", "SKU-006"], affectedMaterials: ["MAT-007"], recommendedAction: "Switch to air freight for critical materials or source from alternate ports", icon: "Ship", timestamp: "6h ago" },
  { id: "SCN-005", category: "strategic", title: "Margin Recovery Initiative", description: "Corporate mandate to recover 200bps margin across Laundry portfolio by Q4. Requires reformulation or sourcing changes.", severity: "high", affectedSKUs: ["SKU-001", "SKU-002", "SKU-006"], affectedMaterials: ["MAT-001", "MAT-003", "MAT-005"], recommendedAction: "Run full substitution analysis on top-3 cost contributors in Laundry BOM", icon: "Target", timestamp: "3d ago" },
  { id: "SCN-006", category: "strategic", title: "Sustainability Reformulation", description: "2026 target: 40% bio-based surfactants across Personal Care. Current mix at 12%.", severity: "medium", affectedSKUs: ["SKU-004", "SKU-008"], affectedMaterials: ["MAT-002", "MAT-003"], recommendedAction: "Identify bio-based alternatives for SLES and Cocamidopropyl Betaine", icon: "Leaf", timestamp: "1w ago" },
  { id: "SCN-007", category: "demand", title: "Forecast Deviation — APAC Spike", description: "Actual demand for FreshGlow Dishwash exceeded forecast by 22% in Q1. Risk of stockout if trend continues.", severity: "high", affectedSKUs: ["SKU-003", "SKU-008"], affectedMaterials: ["MAT-002", "MAT-006"], recommendedAction: "Increase safety stock and evaluate faster-lead-time supplier alternatives", icon: "BarChart3", timestamp: "12h ago" },
  { id: "SCN-008", category: "demand", title: "New Channel Launch — D2C", description: "Direct-to-consumer channel launching Q3 for Personal Care. Requires adjusted pack sizes and separate BOM costing.", severity: "medium", affectedSKUs: ["SKU-004", "SKU-008"], affectedMaterials: ["MAT-003", "MAT-008"], recommendedAction: "Simulate D2C-specific BOM configurations with smaller pack sizes", icon: "Store", timestamp: "5d ago" },
];

// ========== MULTI-METRIC MONTE CARLO ==========
export type MetricKey = "serviceLevel" | "margin" | "inventoryTurnover" | "profitability" | "timeToMake" | "leadTime";

export interface MetricDistribution {
  bins: { bin: string; count: number; cumPct: number }[];
  p5: number;
  p50: number;
  p95: number;
  mean: number;
  unit: string;
}

export interface MultiMetricResult {
  serviceLevel: MetricDistribution;
  margin: MetricDistribution;
  inventoryTurnover: MetricDistribution;
  profitability: MetricDistribution;
  timeToMake: MetricDistribution;
  leadTime: MetricDistribution;
}

export const metricLabels: Record<MetricKey, { label: string; unit: string; higher: "better" | "worse" }> = {
  serviceLevel: { label: "Service Level", unit: "%", higher: "better" },
  margin: { label: "Gross Margin", unit: "%", higher: "better" },
  inventoryTurnover: { label: "Inventory Turnover", unit: "days", higher: "worse" },
  profitability: { label: "Net Profitability", unit: "$K", higher: "better" },
  timeToMake: { label: "Time to Make", unit: "days", higher: "worse" },
  leadTime: { label: "Lead Time", unit: "days", higher: "worse" },
};

function boxMuller(): number {
  return Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random());
}

function buildDistribution(values: number[], unit: string, decimals = 1): MetricDistribution {
  values.sort((a, b) => a - b);
  const N = values.length;
  const min = values[0], max = values[N - 1];
  const bins = 25;
  const binWidth = (max - min) / bins;
  const histogram: MetricDistribution["bins"] = [];
  let cum = 0;
  for (let i = 0; i < bins; i++) {
    const lo = min + i * binWidth;
    const count = values.filter(r => r >= lo && r < lo + binWidth).length;
    cum += count;
    histogram.push({ bin: `${lo.toFixed(decimals)}`, count, cumPct: Math.round((cum / N) * 100) });
  }
  const mean = values.reduce((a, b) => a + b, 0) / N;
  return {
    bins: histogram,
    p5: +values[Math.floor(N * 0.05)].toFixed(decimals),
    p50: +values[Math.floor(N * 0.5)].toFixed(decimals),
    p95: +values[Math.floor(N * 0.95)].toFixed(decimals),
    mean: +mean.toFixed(decimals),
    unit,
  };
}

export function simulateMultiMetric(
  sku: SKU,
  originalMat: Material,
  substituteMat: Material,
  compositionPct: number,
  scenarioSeverity: "critical" | "high" | "medium" | "none" = "none"
): MultiMetricResult {
  const N = 5000;
  const severityMultiplier = scenarioSeverity === "critical" ? 1.8 : scenarioSeverity === "high" ? 1.4 : scenarioSeverity === "medium" ? 1.15 : 1.0;

  const subSupplier = supplierMaster.find(s => s.id === substituteMat.supplierId)!;
  const baseCostDelta = (substituteMat.costPerKg - originalMat.costPerKg) / originalMat.costPerKg;

  // Service Level: base ~95%, impacted by supplier reliability and scenario
  const slBase = subSupplier.reliabilityScore * 0.98;
  const slVol = (100 - subSupplier.reliabilityScore) * 0.15 * severityMultiplier;
  const slValues = Array.from({ length: N }, () => Math.min(100, Math.max(50, slBase + boxMuller() * slVol)));

  // Margin: base from sku margin, adjusted by cost delta
  const marginBase = sku.currentMargin + (baseCostDelta * -compositionPct * 0.5);
  const marginVol = 2.5 * severityMultiplier;
  const marginValues = Array.from({ length: N }, () => +(marginBase + boxMuller() * marginVol).toFixed(1));

  // Inventory Turnover (days): base ~30 days, higher lead time = more days
  const turnBase = 25 + subSupplier.leadTimeDays * 0.5 * severityMultiplier;
  const turnVol = 5 * severityMultiplier;
  const turnValues = Array.from({ length: N }, () => Math.max(5, +(turnBase + boxMuller() * turnVol).toFixed(0)));

  // Profitability: revenue * margin impact
  const profitBase = (sku.revenue / 1000) * (marginBase / 100);
  const profitVol = profitBase * 0.08 * severityMultiplier;
  const profitValues = Array.from({ length: N }, () => +(profitBase + boxMuller() * profitVol).toFixed(0));

  // Time to Make: base ~5 days, impacted by material change
  const ttmBase = 4.5 + Math.abs(originalMat.viscosity - substituteMat.viscosity) * 0.005 * severityMultiplier;
  const ttmVol = 0.8 * severityMultiplier;
  const ttmValues = Array.from({ length: N }, () => Math.max(1, +(ttmBase + boxMuller() * ttmVol).toFixed(1)));

  // Lead Time: base from supplier, increased by scenario
  const ltBase = subSupplier.leadTimeDays * severityMultiplier;
  const ltVol = subSupplier.leadTimeDays * 0.2 * severityMultiplier;
  const ltValues = Array.from({ length: N }, () => Math.max(1, +(ltBase + boxMuller() * ltVol).toFixed(0)));

  return {
    serviceLevel: buildDistribution(slValues, "%"),
    margin: buildDistribution(marginValues, "%"),
    inventoryTurnover: buildDistribution(turnValues, "days", 0),
    profitability: buildDistribution(profitValues, "$K", 0),
    timeToMake: buildDistribution(ttmValues, "days"),
    leadTime: buildDistribution(ltValues, "days", 0),
  };
}

// ========== FORECAST METRICS (per SKU) ==========
export interface SKUForecastMetrics {
  skuId: string;
  accuracy: number;
  bias: number;
  volatility: number;
  cocChange: number;
  lyChange: number;
  runRate: number;
  runRateChange: number;
  flags: string[];
}

export function computeSKUForecastMetrics(skuId: string): SKUForecastMetrics {
  const records = forecastData.filter(f => f.skuId === skuId);
  const withActuals = records.filter(r => r.actualDemand !== null);
  
  if (withActuals.length < 2) {
    return { skuId, accuracy: 85, bias: 0, volatility: 5, cocChange: 0, lyChange: 0, runRate: 0, runRateChange: 0, flags: [] };
  }

  // Accuracy: MAPE-based
  const apes = withActuals.map(r => Math.abs((r.baselineForecast - r.actualDemand!) / r.actualDemand!));
  const mape = apes.reduce((a, b) => a + b, 0) / apes.length;
  const accuracy = +(Math.max(0, (1 - mape) * 100)).toFixed(1);

  // Bias: mean percentage error (positive = over-forecast)
  const biases = withActuals.map(r => (r.baselineForecast - r.actualDemand!) / r.actualDemand!);
  const bias = +(biases.reduce((a, b) => a + b, 0) / biases.length * 100).toFixed(1);

  // Volatility: CoV of actuals
  const actuals = withActuals.map(r => r.actualDemand!);
  const mean = actuals.reduce((a, b) => a + b, 0) / actuals.length;
  const std = Math.sqrt(actuals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / actuals.length);
  const volatility = +(std / mean * 100).toFixed(1);

  // Run rate: last 3 months average
  const last3 = withActuals.slice(-3);
  const runRate = Math.round(last3.reduce((a, r) => a + r.actualDemand!, 0) / last3.length);
  const prev3 = withActuals.slice(-6, -3);
  const prevRunRate = prev3.length > 0 ? prev3.reduce((a, r) => a + r.actualDemand!, 0) / prev3.length : runRate;
  const runRateChange = +((runRate - prevRunRate) / prevRunRate * 100).toFixed(1);

  // CoC and LY changes
  const latest = records[records.length - 1];
  const prevRecord = records.length > 1 ? records[records.length - 2] : latest;
  const cocChange = +((latest.baselineForecast - prevRecord.baselineForecast) / prevRecord.baselineForecast * 100).toFixed(1);
  const lyRecord = records.length > 12 ? records[records.length - 13] : latest;
  const lyChange = +((latest.baselineForecast - lyRecord.baselineForecast) / lyRecord.baselineForecast * 100).toFixed(1);

  // Flags
  const flags: string[] = [];
  if (Math.abs(runRateChange) > 10) flags.push("volatile_run_rate");
  if (accuracy < 80) flags.push("low_accuracy");
  if (Math.abs(bias) > 5) flags.push("bias_detected");
  const sku = skuMaster.find(s => s.id === skuId);
  if (sku && sku.currentMargin > 35) flags.push("high_margin");

  return { skuId, accuracy, bias, volatility, cocChange, lyChange, runRate, runRateChange, flags };
}

export function computeAllSKUMetrics(): SKUForecastMetrics[] {
  return skuMaster.map(s => computeSKUForecastMetrics(s.id));
}

export function generateAgentNarratives(skuId: string) {
  const sku = skuMaster.find(s => s.id === skuId)!;
  const metrics = computeSKUForecastMetrics(skuId);
  const hData = generateHeuristicForecast(skuId);
  const confidence = computeHeuristicConfidence(hData);
  const withActuals = hData.filter(d => d.actual !== null);
  const anomalies = hData.filter(d => d.anomalyFlag);

  const bestHeuristic = confidence.cocAlignment >= confidence.lyAlignment && confidence.cocAlignment >= confidence.l2yAlignment
    ? "CoC" : confidence.lyAlignment >= confidence.l2yAlignment ? "LY" : "L2Y";
  const bestAlignment = bestHeuristic === "CoC" ? confidence.cocAlignment : bestHeuristic === "LY" ? confidence.lyAlignment : confidence.l2yAlignment;

  // Movement Analysis
  const movement = {
    title: "Movement Analysis",
    content: `${sku.name} forecast shows a ${metrics.cocChange > 0 ? "+" : ""}${metrics.cocChange}% CoC change (${metrics.cocChange > 0 ? "+" : ""}${Math.round(metrics.runRate * Math.abs(metrics.cocChange) / 100).toLocaleString()} cases) vs last period. Year-over-year change is ${metrics.lyChange > 0 ? "+" : ""}${metrics.lyChange}%. ${Math.abs(metrics.cocChange) > 5 ? `The bulk of the ${metrics.cocChange > 0 ? "uplift" : "decline"} is concentrated in the next 13 weeks, with ${metrics.cocChange > 0 ? "summer" : "Q4"} periods showing the most significant shifts.` : "Movement is within normal operational bounds across the horizon."} Current run-rate: ${metrics.runRate.toLocaleString()} cases/month (${metrics.runRateChange > 0 ? "+" : ""}${metrics.runRateChange}% vs prior 3 months).`,
  };

  // Key Drivers
  const drivers = {
    title: "Key Drivers",
    content: `${anomalies.length} forecast units exceed ±2% CoC threshold at the SKU level. ${anomalies.length > 3 ? `Key driver: ${sku.channel} channel demand for ${sku.brand} ${sku.category.toLowerCase()} shifted ${metrics.cocChange > 0 ? "upward" : "downward"} in ${sku.region}, with the change concentrated around seasonal promotion windows.` : "Deviations are minor and distributed across periods without clear concentration."} SKUs deviating from seasonal pattern (watchlist): ${sku.id} in months ${anomalies.slice(0, 3).map(a => a.month).join(", ")}. ${metrics.volatility > 15 ? "High demand volatility suggests external drivers beyond standard promotional activity." : "Volatility is within acceptable range for this category."}`,
  };

  // Benchmark Assessment
  const benchmarkAssessment = {
    title: "Benchmark Assessment",
    content: `For ${sku.id}, the current forecast of ${metrics.runRate.toLocaleString()} cases/month compares against: Run-rate (last 6 weeks): ${Math.round(metrics.runRate * 0.98).toLocaleString()} cases/month. LY: ${Math.round(metrics.runRate * (1 - metrics.lyChange / 100)).toLocaleString()} cases/month. L2Y: ${Math.round(metrics.runRate * 0.88).toLocaleString()} cases/month. ${bestHeuristic} benchmark shows ${bestAlignment}% alignment with historical actuals — the strongest among all heuristics. ${metrics.accuracy > 85 ? "Service rates have been stable above 95%." : "Service rates have shown recent pressure, suggesting forecast gaps."} ${Math.abs(metrics.cocChange) > 10 ? `The ${Math.abs(metrics.cocChange)}% shift appears ${metrics.accuracy > 80 ? "partially" : "poorly"} supported by historical patterns and requires review.` : "Current forecast levels are consistent with benchmark signals."}`,
  };

  // ML Reliability
  const mlReliability = {
    title: "ML Reliability & Human Override History",
    content: `For ${sku.id}, the ML forecast has historically achieved ${metrics.accuracy}% accuracy. ${metrics.accuracy < 80 ? `The model consistently ${metrics.bias > 0 ? "over" : "under"}-forecasts during peak demand periods, with accuracy dropping to ~${Math.round(metrics.accuracy * 0.85)}% during seasonal transitions.` : `Model performance is stable across seasons with minor ${metrics.bias > 0 ? "over" : "under"}-forecasting tendency.`} Historical analyst adjustments ${metrics.accuracy < 80 ? "improved accuracy by ~10pp when applied" : "have had marginal impact, suggesting ML signal is strong"}. S&OP overrides ${metrics.accuracy > 85 ? "rarely needed" : "have historically improved accuracy to ~" + Math.min(95, Math.round(metrics.accuracy * 1.15)) + "%"}. Confidence signal: ${metrics.accuracy > 85 ? "HIGH" : metrics.accuracy > 75 ? "MEDIUM" : "LOW"} — ${metrics.accuracy > 85 ? "ML signal reliable, minimal review needed." : "human review recommended as ML drift is likely."}`,
  };

  // Recommendation
  const recommendation = {
    title: "Recommendation",
    content: `${Math.abs(metrics.cocChange) > 5 && metrics.accuracy < 80 ? `ADJUST: The CoC change of ${metrics.cocChange > 0 ? "+" : ""}${metrics.cocChange}% lacks supporting signals from run-rate, benchmarks, or promotional plans. Recommend reverting to prior cycle level and applying ${bestHeuristic}-based correction factor.` : Math.abs(metrics.cocChange) > 5 && metrics.accuracy >= 80 ? `ACCEPT WITH ENRICHMENT: The ${metrics.cocChange > 0 ? "uplift" : "decline"} is partially supported by ${bestHeuristic} alignment (${bestAlignment}%) and seasonal patterns. Recommend accepting the directional shift but moderating magnitude by ${Math.round(Math.abs(metrics.cocChange) * 0.3)}pp.` : `ACCEPT: Current forecast changes are within normal bounds. ${bestHeuristic} alignment at ${bestAlignment}% supports the current trajectory. No manual intervention required.`} Bias assessment: ${Math.abs(metrics.bias) > 5 ? `Systematic ${metrics.bias > 0 ? "over" : "under"}-forecasting bias of ${Math.abs(metrics.bias).toFixed(1)}% detected — recommend bias correction.` : "Forecast bias is stable and within acceptable range."}`,
  };

  // Final Summary
  const finalSummary = {
    title: "Final Forecast Summary",
    content: `After review, ${sku.name} (${sku.region}, ${sku.channel}) forecast stands at ${metrics.runRate.toLocaleString()} cases/month. CoC: ${metrics.cocChange > 0 ? "+" : ""}${metrics.cocChange}%. vs LY: ${metrics.lyChange > 0 ? "+" : ""}${metrics.lyChange}%. Forecast accuracy: ${metrics.accuracy}%. Confidence: ${confidence.total}%. ${anomalies.length} anomalies detected — ${anomalies.length > 5 ? "elevated count suggests structural demand shift." : "within acceptable threshold."} Primary benchmark: ${bestHeuristic} (${bestAlignment}% alignment). ${metrics.flags.length > 0 ? `Active flags: ${metrics.flags.map(f => f.replace(/_/g, " ")).join(", ")}.` : "No active flags."}`,
  };

  return { movement, drivers, benchmarkAssessment, mlReliability, recommendation, finalSummary, metrics, confidence };
}

export function generateBusinessSummary(skuIds: string[]) {
  const allMetrics = skuIds.map(id => ({ sku: skuMaster.find(s => s.id === id)!, metrics: computeSKUForecastMetrics(id) }));
  const totalRunRate = allMetrics.reduce((a, m) => a + m.metrics.runRate, 0);
  const avgAccuracy = +(allMetrics.reduce((a, m) => a + m.metrics.accuracy, 0) / allMetrics.length).toFixed(1);
  const avgCoCChange = +(allMetrics.reduce((a, m) => a + m.metrics.cocChange, 0) / allMetrics.length).toFixed(1);
  const totalCoCCases = Math.round(totalRunRate * Math.abs(avgCoCChange) / 100);

  const movers = allMetrics
    .sort((a, b) => Math.abs(b.metrics.cocChange) - Math.abs(a.metrics.cocChange))
    .slice(0, 3);
  const upMovers = movers.filter(m => m.metrics.cocChange > 0);
  const downMovers = movers.filter(m => m.metrics.cocChange < 0);

  // Brand-level aggregation
  const byBrand = new Map<string, { cocSum: number; count: number }>();
  allMetrics.forEach(m => {
    const existing = byBrand.get(m.sku.brand) || { cocSum: 0, count: 0 };
    existing.cocSum += m.metrics.cocChange;
    existing.count++;
    byBrand.set(m.sku.brand, existing);
  });
  const brandSummaries = Array.from(byBrand.entries()).map(([brand, data]) => ({
    brand,
    avgCoC: +(data.cocSum / data.count).toFixed(1),
  }));

  return {
    totalRunRate,
    avgAccuracy,
    avgCoCChange,
    totalCoCCases,
    upMovers,
    downMovers,
    brandSummaries,
    skuCount: skuIds.length,
    flaggedCount: allMetrics.filter(m => m.metrics.flags.length > 0).length,
  };
}

// ========== SAVED SCENARIOS ==========
export interface SavedScenario {
  id: string;
  name: string;
  timestamp: string;
  skuId: string;
  materialId: string;
  substituteId: string;
  triggerId: string | null;
  triggerTitle: string | null;
  costSim: ReturnType<typeof simulateLandedCost>;
  multiMetric: MultiMetricResult;
}

// ========== LAB INTELLIGENCE ==========

export interface LabBOMEntry {
  materialId: string;
  compositionPct: number;
}

export interface SimulatedProperties {
  pH: number;
  viscosity: number;
  density: number;
  foamIndex: number;
  textureScore: number;
  consistencyRating: number;
}

export interface QualityThresholds {
  pH: [number, number];
  viscosity: [number, number];
  density: [number, number];
  foamIndex: [number, number];
  textureScore: [number, number];
  consistencyRating: [number, number];
}

export const categoryThresholds: Record<string, QualityThresholds> = {
  Laundry: {
    pH: [8.0, 11.0],
    viscosity: [20, 80],
    density: [1.0, 1.4],
    foamIndex: [60, 95],
    textureScore: [50, 90],
    consistencyRating: [60, 95],
  },
  Dishwash: {
    pH: [6.5, 9.0],
    viscosity: [25, 70],
    density: [1.0, 1.3],
    foamIndex: [70, 98],
    textureScore: [55, 92],
    consistencyRating: [65, 95],
  },
  "Personal Care": {
    pH: [4.5, 7.0],
    viscosity: [100, 800],
    density: [1.0, 1.2],
    foamIndex: [40, 85],
    textureScore: [70, 98],
    consistencyRating: [75, 98],
  },
  "Home Care": {
    pH: [6.0, 10.0],
    viscosity: [15, 60],
    density: [1.0, 1.3],
    foamIndex: [50, 90],
    textureScore: [45, 85],
    consistencyRating: [55, 90],
  },
};

export function simulateFormulation(bomEntries: LabBOMEntry[], category: string): { properties: SimulatedProperties; verdict: "Pass" | "Review" | "Fail"; details: Record<string, "pass" | "review" | "fail"> } {
  const totalPct = bomEntries.reduce((s, e) => s + e.compositionPct, 0);
  // Remainder is water/filler with neutral properties
  const waterPct = Math.max(0, 100 - totalPct);

  let pH = 7.0 * (waterPct / 100);
  let viscosity = 1.0 * (waterPct / 100);
  let density = 1.0 * (waterPct / 100);
  let foamNumerator = 0;
  let humectantPct = 0;

  bomEntries.forEach(entry => {
    const mat = materialMaster.find(m => m.id === entry.materialId);
    if (!mat) return;
    const frac = entry.compositionPct / 100;
    pH += mat.pH * frac;
    viscosity += mat.viscosity * frac;
    density += mat.density * frac;
    if (mat.type === "Surfactant") {
      foamNumerator += mat.performanceIndex * frac;
    }
    if (mat.type === "Humectant") {
      humectantPct += entry.compositionPct;
    }
  });

  // Foam index: surfactant performance weighted, scaled to 0-100
  const surfactantPct = bomEntries.reduce((s, e) => {
    const mat = materialMaster.find(m => m.id === e.materialId);
    return s + (mat?.type === "Surfactant" ? e.compositionPct : 0);
  }, 0);
  const foamIndex = Math.min(100, foamNumerator * 3 + surfactantPct * 1.5 + 15);

  // Texture score: category-aware normalization
  // Laundry/Home Care = low viscosity expected; Personal Care/Dishwash = higher viscosity
  const viscosityRanges: Record<string, [number, number]> = {
    Laundry: [5, 80],
    Dishwash: [10, 70],
    "Personal Care": [50, 800],
    "Home Care": [5, 60],
  };
  const [viscLo, viscHi] = viscosityRanges[category] || [5, 500];
  const viscNorm = Math.min(1, Math.max(0, (viscosity - viscLo * 0.5) / (viscHi - viscLo * 0.5)));
  const humNorm = Math.min(1, humectantPct / 20);
  const builderPct = bomEntries.reduce((s, e) => {
    const mat = materialMaster.find(m => m.id === e.materialId);
    return s + (mat?.type === "Builder" ? e.compositionPct : 0);
  }, 0);
  const builderNorm = Math.min(1, builderPct / 25);
  // For laundry/home care, builders and surfactants matter more than viscosity for texture
  const isLowVisc = category === "Laundry" || category === "Home Care";
  const textureScore = isLowVisc
    ? Math.min(100, viscNorm * 25 + surfactantPct * 1.2 + builderNorm * 30 + humNorm * 15 + 15)
    : Math.min(100, viscNorm * 50 + humNorm * 40 + 10);

  // Consistency: composite of density stability, pH balance, and formulation completeness
  const densityScore = density >= 1.0 && density <= 1.5 ? 90 : density > 1.5 ? 70 : 60;
  const pHThresh = categoryThresholds[category]?.pH || [5, 10];
  const pHScore = pH >= pHThresh[0] && pH <= pHThresh[1] ? 92 : pH >= pHThresh[0] - 1 && pH <= pHThresh[1] + 1 ? 78 : 60;
  const completenessScore = Math.min(95, totalPct * 1.2 + 30);
  const consistencyRating = Math.min(100, (densityScore * 0.35 + pHScore * 0.3 + foamIndex * 0.15 + completenessScore * 0.2));

  const properties: SimulatedProperties = {
    pH: +pH.toFixed(2),
    viscosity: +viscosity.toFixed(1),
    density: +density.toFixed(3),
    foamIndex: +foamIndex.toFixed(1),
    textureScore: +textureScore.toFixed(1),
    consistencyRating: +consistencyRating.toFixed(1),
  };

  const thresholds = categoryThresholds[category] || categoryThresholds["Laundry"];
  const details: Record<string, "pass" | "review" | "fail"> = {};
  let failCount = 0;
  let reviewCount = 0;

  (Object.keys(thresholds) as (keyof QualityThresholds)[]).forEach(key => {
    const [lo, hi] = thresholds[key];
    const val = properties[key];
    const margin = (hi - lo) * 0.1; // 10% buffer for review zone
    if (val >= lo && val <= hi) {
      details[key] = "pass";
    } else if (val >= lo - margin && val <= hi + margin) {
      details[key] = "review";
      reviewCount++;
    } else {
      details[key] = "fail";
      failCount++;
    }
  });

  const verdict = failCount > 0 ? "Fail" : reviewCount > 1 ? "Review" : reviewCount === 1 ? "Review" : "Pass";

  return { properties, verdict, details };
}

export function getRecipeBOM(skuId: string): LabBOMEntry[] {
  return bomTable
    .filter(b => b.skuId === skuId)
    .map(b => ({ materialId: b.materialId, compositionPct: b.compositionPct }));
}

export function getBOMCost(bomEntries: LabBOMEntry[]): number {
  return bomEntries.reduce((total, entry) => {
    const mat = materialMaster.find(m => m.id === entry.materialId);
    return total + (mat ? mat.costPerKg * entry.compositionPct / 100 : 0);
  }, 0);
}

export interface SavedExperiment {
  id: string;
  name: string;
  skuId: string;
  date: string;
  rdBom: LabBOMEntry[];
  results: ReturnType<typeof simulateFormulation>;
  recipeCost: number;
  rdCost: number;
  notes: string;
}
