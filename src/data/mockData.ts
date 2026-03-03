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
const months12 = ["Jan'24","Feb'24","Mar'24","Apr'24","May'24","Jun'24","Jul'24","Aug'24","Sep'24","Oct'24","Nov'24","Dec'24"];

export const historicalCosts: CostRecord[] = materialMaster.flatMap(mat =>
  months12.map((month, i) => ({
    month,
    materialId: mat.id,
    costPerKg: +(mat.costPerKg * (1 + (Math.sin(i * 0.5) * 0.08) + (Math.random() - 0.5) * 0.04)).toFixed(2),
  }))
);

// ========== FORECAST DATA (24 months) ==========
const months24 = [
  "Jan'23","Feb'23","Mar'23","Apr'23","May'23","Jun'23","Jul'23","Aug'23","Sep'23","Oct'23","Nov'23","Dec'23",
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
