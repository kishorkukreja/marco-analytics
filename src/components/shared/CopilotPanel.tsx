import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// ========== SCREEN CONTEXT ==========
interface ScreenContext {
  welcomeMessage: string;
  quickActions: string[];
  proactiveSuggestion: string;
  subtitle: string;
}

const screenContexts: Record<string, ScreenContext> = {
  "/dashboard": {
    subtitle: "Executive Dashboard",
    welcomeMessage: "I'm looking at your **Executive Dashboard**. I can see your portfolio KPIs, trend analysis, and active alerts. Here's what stands out:\n\n• **SKU-006** margin at 22.8% is below the 25% threshold — needs attention\n• **$2.3M** in identified savings across 14 simulations\n• LAS surfactant cost up 12% — impacting 3 SKUs\n\nWhat would you like to dig into?",
    quickActions: ["Which SKUs need attention?", "Show savings breakdown", "Explain the cost trend", "Highest margin opportunities"],
    proactiveSuggestion: "I noticed **2 high-severity alerts** on your dashboard. SKU-006 margin erosion and SKU-001 LAS cost spike could impact $590K annually. Want me to analyze mitigation options?",
  },
  "/simulation": {
    subtitle: "Simulation Engine",
    welcomeMessage: "You're in the **Simulation Engine**. I can help you:\n\n• Choose the best **RM/PM substitute** for any SKU\n• Explain **cost impact** across formulation, freight, duty & packaging\n• Interpret **Monte Carlo** risk distributions\n• Flag **margin erosion** scenarios\n\nTip: Select a SKU and material — I'll proactively suggest the best substitute.",
    quickActions: ["Best substitute for SKU-001?", "Why is freight cost higher?", "Explain Monte Carlo results", "Which material has lowest risk?"],
    proactiveSuggestion: "For your current selection, **AOS (MAT-010)** is the strongest substitute candidate — 89.4% similarity, 16% lower cost, and low supplier risk. Shall I walk through the landed cost impact?",
  },
  "/optimization": {
    subtitle: "Optimization Engine",
    welcomeMessage: "You're viewing the **Optimization Engine**. I can explain:\n\n• How the **MILP solver** finds optimal material allocations\n• What each **constraint** means (Risk, Capacity, MOQ, Regulatory)\n• Why certain solutions are **feasible but sub-optimal**\n\nRun an optimization and I'll interpret the results for you.",
    quickActions: ["What constraints are binding?", "Why is risk score high?", "Explain the solver status", "How to improve margin further?"],
    proactiveSuggestion: "The optimization is constrained primarily by **supplier capacity** and **MOQ requirements**. Relaxing the risk threshold from 40% to 50% could unlock an additional $180K in savings.",
  },
  "/forecast": {
    subtitle: "Forecast Intelligence",
    welcomeMessage: "You're on **Forecast Intelligence**. I can help interpret:\n\n• **CoC, LY, L2Y** heuristic benchmarks and which one fits best\n• **Confidence score** breakdown and what drives it\n• **Anomalies** — why they were flagged and what to do\n\nToggle the heuristic lines on the chart to compare visually.",
    quickActions: ["Which heuristic is most accurate?", "Why is confidence low?", "Explain the anomalies", "Best benchmark for Q3?"],
    proactiveSuggestion: "CoC heuristic shows strongest alignment for most Laundry SKUs, while LY works better for seasonal categories like Dishwash. Want me to compare benchmarks for a specific SKU?",
  },
  "/lab": {
    subtitle: "Lab Intelligence",
    welcomeMessage: "You're in **Lab Intelligence** — the R&D formulation workbench. I can help with:\n\n• Understanding **Recipe vs R&D BOM** differences and their impact\n• Interpreting **simulation properties** — pH, viscosity, density, foam, texture, consistency\n• Evaluating **substitution recommendations** and their trade-offs\n• Comparing **saved experiments** and identifying the best candidates\n\nSelect a SKU, tweak the R&D BOM, and run a simulation — I'll help you interpret the results.",
    quickActions: ["How do I read simulation results?", "Which substitution saves the most?", "Compare my experiments", "What affects foam index?"],
    proactiveSuggestion: "The substitution recommender has identified **cost-saving alternatives** for your current BOM materials. Apply one, run the simulation, and I'll help you understand what changed and why.",
  },
  "/settings": {
    subtitle: "Settings Hub",
    welcomeMessage: "You're in the **Settings Hub** — system configuration, architecture overview, and value tracking.\n\n• **Architecture** — view the MarCo 2.0 system layers and data flow\n• **Admin** — thresholds, risk parameters, data pipeline config\n• **Insights & Value** — realized savings, ROI tracking, approval workflows\n\nWhat would you like to configure or review?",
    quickActions: ["Current thresholds", "System architecture overview", "Value realized so far", "Data pipeline status"],
    proactiveSuggestion: "Your risk threshold is set at 40%. Based on current portfolio risk distribution, adjusting to 35% would flag 2 additional SKUs for proactive review.",
  },
};

const defaultContext: ScreenContext = {
  subtitle: "Portfolio Assistant",
  welcomeMessage: "Hi! I'm your **MarCo Co-pilot**. I can help across every module:\n\n• **Dashboard** — KPIs, alerts, margin opportunities\n• **Simulation** — substitution analysis, Monte Carlo\n• **Optimization** — solver results, constraint analysis\n• **Forecast** — heuristic benchmarks, confidence scores\n• **Lab** — formulation R&D, BOM experiments, property simulation\n• **Settings** — architecture, admin, value tracking\n\nNavigate to any screen and I'll adapt to your context.",
  quickActions: ["Go to dashboard insights", "Run a simulation", "Check forecast accuracy", "Start a lab experiment"],
  proactiveSuggestion: "",
};

// ========== RESPONSE ENGINE ==========
function getResponse(input: string, path: string): string {
  const lower = input.toLowerCase();

  // Lab Intelligence responses
  if (path === "/lab") {
    if (lower.includes("simulation result") || lower.includes("how do i read") || lower.includes("interpret")) {
      return "The simulation compares **6 key properties** between your Recipe BOM and R&D BOM:\n\n| Property | What it measures |\n|---|---|\n| **pH Level** | Acidity/alkalinity balance |\n| **Viscosity** | Flow resistance (cP) |\n| **Density** | Mass per unit volume |\n| **Foam Index** | Foaming performance (0-100) |\n| **Texture Score** | Tactile quality (0-100) |\n| **Consistency** | Batch uniformity (0-100) |\n\n**How to read the cards:**\n- Each card shows Recipe vs R&D values side-by-side\n- The **↑↓ arrows** show the direction and magnitude of change\n- Comparison bars let you visually gauge relative values\n\n**The Agent Insights panel** below the properties gives you contextual analysis — cost impact, material swaps detected, and category-specific observations.\n\nThere's no pass/fail — you decide what matters for your formulation goals.";
    }
    if (lower.includes("substitution") || lower.includes("saves") || lower.includes("cost") || lower.includes("recommend")) {
      return "The **Substitution Recommender** ranks alternatives using a composite score:\n\n**Ranking formula:** `Similarity × 60% + Cost Savings × 40%`\n\n**What each column means:**\n- **Similarity %** — property match (viscosity, density, pH, performance index) between original and substitute. >85% is strong.\n- **Cost Δ %** — price difference per kg. Negative = cheaper.\n- **Arrow** — shows original → substitute material name\n- **Supplier info** — name and lead time for the substitute\n\n**To apply a recommendation:**\n1. Click **Apply** on any suggestion\n2. It swaps the material in your R&D BOM automatically\n3. Run **Simulation** to see the property impact\n4. Save the experiment if the results look promising\n\nTip: Apply substitutions one at a time to isolate their individual impact.";
    }
    if (lower.includes("compare") || lower.includes("experiment")) {
      return "To compare experiments:\n\n1. Go to the **Experiment History** table at the bottom\n2. Click the **checkbox** on any 2 experiments\n3. A **side-by-side comparison** panel appears showing all 6 properties, cost, and your notes\n\n**Tips for effective comparison:**\n- Name experiments descriptively (e.g., \"AOS swap 20%\", \"Reduced surfactant blend\")\n- Add notes documenting your **hypothesis** before saving\n- After comparing, annotate the winner with your conclusions\n- Use the **Load** button (↓ icon) to reload any experiment's BOM for further iteration\n\nYou can also compare experiments across different SKUs to spot patterns in how material changes affect properties.";
    }
    if (lower.includes("foam") || lower.includes("foaming")) {
      return "**Foam Index** is derived from surfactant content and performance:\n\n`Foam = (Σ SurfactantPerf × Fraction × 3) + (SurfactantPct × 1.5) + 15`\n\n**Key drivers:**\n- **Surfactant concentration** — more surfactant = higher foam\n- **Performance index** — LAS (92/100) foams better than Cocamidopropyl Betaine (85/100)\n- **Surfactant type** — Anionic surfactants (LAS, AOS, SLES) foam more than amphoteric (Betaine)\n\n**Category context:**\n- Dishwash needs **high foam** (70-98 typical)\n- Personal Care prefers **moderate foam** (40-85 typical)\n- Laundry can vary (60-95 typical)\n\n**To increase foam:** Add more surfactant % or swap to a higher-performing surfactant.\n**To decrease foam:** Reduce surfactant concentration or switch to a milder surfactant type.";
    }
    if (lower.includes("ph") || lower.includes("acid") || lower.includes("alkal")) {
      return "**pH** is a weighted average of all material pH values plus water filler:\n\n`pH = Σ (material_pH × fraction) + (7.0 × water_fraction)`\n\n**Category typical ranges:**\n- Laundry: **8.0–11.0** (alkaline for cleaning power)\n- Dishwash: **6.5–9.0** (mildly alkaline)\n- Personal Care: **4.5–7.0** (skin-compatible, slightly acidic)\n- Home Care: **6.0–10.0** (varies by product)\n\n**To adjust pH:**\n- **Lower pH:** Add Citric Acid (MAT-006, pH 2.2)\n- **Raise pH:** Add Sodium Hydroxide (MAT-009, pH 14.0) or Sodium Carbonate (MAT-004, pH 11.6)\n\nThe Agent Insights will flag if your R&D formulation pH shifts outside the typical range for the SKU's category.";
    }
    if (lower.includes("viscosity") || lower.includes("thick") || lower.includes("thin")) {
      return "**Viscosity** measures flow resistance in centipoise (cP):\n\n**Material viscosity leaders:**\n- Glycerin (MAT-008): **1412 cP** — major thickener\n- Sodium Hydroxide (MAT-009): **78 cP**\n- LAS (MAT-001): **45 cP**\n- Builders (MAT-004, MAT-005): **~0 cP** — no thickening effect\n\n**Category expectations:**\n- Laundry: **5–80 cP** (pourable liquid)\n- Personal Care: **50–800 cP** (cream/gel consistency)\n- Dishwash: **10–70 cP** (liquid)\n\n**To increase viscosity:** Add Glycerin or increase surfactant %\n**To decrease viscosity:** Remove Glycerin, increase water ratio (lower active material %)";
    }
    if (lower.includes("texture") || lower.includes("consistency") || lower.includes("density")) {
      return "**Texture Score** and **Consistency Rating** measure sensory and batch quality:\n\n**Texture Score** depends on category:\n- For Laundry/Home Care: Driven by surfactant %, builder content, and viscosity fit\n- For Personal Care/Dishwash: Driven by viscosity range and humectant (Glycerin) content\n\n**Consistency Rating** is a composite:\n- **Density stability** (35%) — how close density is to 1.0-1.5 g/cm³\n- **pH balance** (30%) — within category-appropriate range\n- **Foam index** (15%) — foaming uniformity\n- **Formulation completeness** (20%) — active material % coverage\n\n**To improve both:** Ensure balanced formulation with adequate surfactant, appropriate pH adjusters, and category-relevant thickeners.";
    }
    if (lower.includes("bom") || lower.includes("recipe") || lower.includes("r&d")) {
      return "The **two-panel BOM view** shows:\n\n**Left: Recipe BOM** (Production Spec)\n- The current production formula — read-only\n- Expand any material to see cost/kg, properties, supplier info\n- Shows total active material % and water/filler balance\n\n**Right: R&D BOM** (Experimental)\n- Editable copy — your experimental playground\n- **Change %:** Adjust composition percentage for any material\n- **Swap material:** Use the dropdown to replace one material with another\n- **Add material:** Click 'Add Material' at the bottom\n- **Remove:** Trash icon removes a material\n- **Delta badges** show changes vs recipe (NEW, +5%, -3% etc.)\n\n**Workflow:** Modify R&D BOM → Run Simulation → Review insights → Save experiment → Compare with previous experiments.";
    }
  }

  // Simulation-specific responses
  if (path === "/simulation") {
    if (lower.includes("substitute") || lower.includes("sku-001") || lower.includes("best")) {
      return "For **SKU-001 (UltraClean 1L)**, the top substitute for LAS surfactant is:\n\n🏆 **AOS (MAT-010)** — Alpha Olefin Sulfonate\n- Similarity: **89.4%**\n- Cost: **$2.40/kg** (vs $2.85/kg for LAS = -16%)\n- Risk: **0.2%** (very low)\n- Supplier: IndoChem (India), 21-day lead time\n\n**Projected impact:** $237K annual savings at +0.76% margin uplift.\n\nThe only trade-off is slightly higher freight from India vs Germany. Run the simulation to see full landed cost breakdown.";
    }
    if (lower.includes("freight") || lower.includes("logistics")) {
      return "Freight cost differences arise from **supplier origin**:\n\n| Route | Cost/kg |\n|---|---|\n| Germany → EMEA | $0.12 |\n| India → EMEA | $0.24 |\n| China → EMEA | $0.28 |\n\nSwitching from ChemCorp (Germany) to IndoChem (India) doubles freight, but the **$0.45/kg material savings** more than offsets the $0.12/kg freight increase.\n\nNet benefit: **$0.33/kg** or ~$174K annually for SKU-001.";
    }
    if (lower.includes("monte carlo") || lower.includes("risk distribution")) {
      return "The Monte Carlo simulation runs **5,000 iterations** with stochastic variation:\n\n- Material cost: **±12%** (normal distribution)\n- Freight: **±18%** (higher volatility)\n- Duties: **±8%**\n- Packaging: **±5%**\n\n**Interpretation:**\n- **P5 (Best case):** Savings rarely exceed deterministic estimate by >8%\n- **P95 (Worst case):** Savings could erode by up to 25%\n- **P50 (Median):** Closely tracks deterministic estimate\n\nThe tight P5–P95 band indicates **low overall risk** for this substitution.";
    }
    if (lower.includes("risk") || lower.includes("lowest")) {
      return "Materials ranked by risk score (lowest first):\n\n1. **MAT-010 (AOS)** — Risk: 0.2% ✅\n   - 89.4% similarity, reliable supplier\n2. **MAT-002 (SLES)** — Risk: 0.4%\n   - 85% similarity, but higher cost\n3. **MAT-003 (Cocamidopropyl Betaine)** — Risk: 0.8%\n   - 82% similarity, US-based supplier\n\nRisk = `AttrVariance × HistFailRate × SupplierReliability`\n\nMAT-010 scores lowest because AOS has very similar functional properties to LAS with a reliable supplier.";
    }
  }

  // Forecast-specific responses
  if (path === "/forecast") {
    if (lower.includes("heuristic") || lower.includes("accurate") || lower.includes("which")) {
      return "Heuristic benchmark accuracy by category:\n\n| Category | Best Heuristic | Alignment |\n|---|---|---|\n| Laundry | **CoC** | 82% |\n| Dishwash | **LY** | 78% |\n| Personal Care | **CoC** | 76% |\n| Home Care | **L2Y** | 71% |\n\n**CoC** works best for consistent growth. **LY** excels for seasonal products. **L2Y** provides stability for volatile categories.";
    }
    if (lower.includes("confidence") || lower.includes("low")) {
      return "Confidence score is derived from 5 factors:\n\n1. **CoC Alignment (25%)** — Period-over-period change accuracy\n2. **LY Alignment (25%)** — Same-month-last-year accuracy\n3. **L2Y Alignment (20%)** — 2-year average stability\n4. **Bias Stability (15%)** — Error consistency\n5. **Volatility Control (15%)** — Demand smoothness\n\nWhen confidence drops below **75%**, it usually means persistent bias or a structural demand shift.";
    }
    if (lower.includes("anomal")) {
      return "Anomalies are flagged when:\n\n1. Forecast deviation > **2σ** of historical deviation\n2. LY deviation > **15%**\n3. Bias persists for **3 consecutive cycles**\n\nMost anomalies cluster in **Q3** (Jul-Sep), suggesting a seasonal pattern the baseline doesn't capture.\n\n**Action:** Apply +6-8% seasonal uplift for Q3 based on L2Y patterns.";
    }
    if (lower.includes("q3") || lower.includes("benchmark") || lower.includes("season")) {
      return "For Q3 (Jul-Sep):\n\n**Historical pattern:** Actuals exceed baseline by 8-14% in Q3.\n\n**Best benchmark:**\n- **LY** for Dishwash (seasonal signal)\n- **CoC** for Laundry (growth + seasonal)\n- **L2Y average** for volatile SKUs\n\n**Correction:** Baseline × 1.08 × 1.02 for Q3 months.";
    }
  }

  // Dashboard-specific responses
  if (path === "/dashboard") {
    if (lower.includes("sku") || lower.includes("attention") || lower.includes("alert")) {
      return "SKUs requiring immediate attention:\n\n🔴 **SKU-006 (BrightWave Softener)** — Margin at 22.8%, below 25% floor\n- Impact: -$180K annual\n- Action: Run substitution sim for Cocamidopropyl Betaine\n\n🟠 **SKU-001 (UltraClean 1L)** — LAS cost spike +12%\n- Impact: +$410K COGS increase\n- Action: Evaluate AOS substitute (89.4% similarity)\n\n🟠 **SKU-005 (AquaFresh Cleaner)** — LATAM freight up 15%\n- Impact: -$95K annual\n\n🟢 **SKU-003 (FreshGlow Dishwash)** — Q3 demand under-forecast\n- Action: Apply LY seasonal correction";
    }
    if (lower.includes("saving") || lower.includes("breakdown")) {
      return "Savings breakdown by category:\n\n| Category | Realized | Potential | Gap |\n|---|---|---|---|\n| Laundry | $890K | $1.2M | $310K |\n| Personal Care | $620K | $780K | $160K |\n| Home Care | $490K | $640K | $150K |\n| Dishwash | $340K | $520K | $180K |\n| **Total** | **$2.34M** | **$3.14M** | **$800K** |\n\nThe remaining $800K is mostly in Laundry (LAS → AOS) and Dishwash (SLES optimization).";
    }
    if (lower.includes("cost") || lower.includes("trend")) {
      return "Cost trend analysis (12-month):\n\n📈 **Total portfolio cost up +3.2% YoY**\n\n**Top drivers:**\n1. Raw materials (+8% LAS, +5% SLES)\n2. Freight (+18% APAC routes)\n3. Duties (stable)\n\n**Offset by:** Manufacturing efficiency (-2%), warehouse optimization (-1.5%)\n\nMaterial substitution could offset **60-70%** of the $1.4M annual cost increase.";
    }
    if (lower.includes("margin") || lower.includes("opportunit")) {
      return "Top margin improvement opportunities:\n\n1. **SKU-001** — LAS → AOS: **+1.2%** margin (+$320K)\n2. **SKU-006** — Betaine optimization: **+2.1%** margin (+$180K)\n3. **SKU-008** — SLES → AOS: **+0.8%** margin (+$210K)\n\n**Total potential:** +$710K from top 3.\n\n💡 Head to **Lab Intelligence** to experiment with these formulation changes and run property simulations before committing.";
    }
  }

  // Settings-specific responses
  if (path === "/settings") {
    if (lower.includes("threshold") || lower.includes("config")) {
      return "Current configuration thresholds:\n\n| Parameter | Value | Impact |\n|---|---|---|\n| Risk threshold | **40%** | SKUs above this flagged for review |\n| Margin floor | **25%** | Alerts when margin drops below |\n| Confidence minimum | **75%** | Forecasts below need manual review |\n| Similarity minimum | **70%** | Substitutes below this excluded |\n\nAdjusting risk threshold to 35% would flag 2 additional SKUs. Raising similarity minimum to 80% would reduce substitute candidates by ~30%.";
    }
    if (lower.includes("architecture") || lower.includes("system") || lower.includes("layer")) {
      return "MarCo 2.0 uses a **4-layer architecture**:\n\n1. **Data Layer** — SKU master, material master, BOM table, supplier data, cost records, forecast records\n2. **Logic Layer** — Similarity engine, cost simulation, formulation simulator, optimization solver\n3. **Intelligence Layer** — Forecast heuristics, agent narratives, substitution recommender, experiment insights\n4. **Presentation Layer** — Dashboard, Simulation, Optimization, Forecast, Lab Intelligence, Settings\n\nEach layer is independently testable and feeds forward.";
    }
    if (lower.includes("value") || lower.includes("roi") || lower.includes("realized")) {
      return "Value tracking summary:\n\n• **Realized savings:** $2.34M across all categories\n• **Potential (pipeline):** $3.14M identified\n• **Gap to close:** $800K\n• **Simulations run:** 47 optimization runs\n• **Active experiments:** 14 formulation experiments\n\nBiggest value drivers: Laundry LAS → AOS substitution ($890K realized) and Personal Care SLES optimization ($620K realized).";
    }
    if (lower.includes("pipeline") || lower.includes("data") || lower.includes("refresh")) {
      return "Data pipeline status:\n\n• **SKU Master** — 8 active SKUs, last refresh: live\n• **Material Master** — 10 materials, 5 suppliers\n• **BOM Table** — 20 entries across 8 SKUs\n• **Cost Records** — 12-month history, monthly refresh\n• **Forecast Data** — 24-month horizon (12 historical + 12 forward)\n\nAll data is synchronized and ready for simulation.";
    }
  }

  // Cross-module generic responses
  if (lower.includes("lab") || lower.includes("formulation") || lower.includes("experiment")) {
    return "**Lab Intelligence** is your R&D formulation workbench:\n\n1. **Select an SKU** to load its Recipe BOM\n2. **Review substitution recommendations** — ranked by similarity + cost savings\n3. **Modify the R&D BOM** — adjust %, swap materials, add/remove ingredients\n4. **Run Simulation** — see impact on pH, viscosity, density, foam, texture, consistency\n5. **Read Agent Insights** — contextual analysis of what changed and why\n6. **Save & Compare** — build an experiment library with notes\n\nNavigate to **/lab** to get started, or ask me about specific properties.";
  }
  if (lower.includes("margin") || lower.includes("saving")) {
    return "**Portfolio margin analysis:**\n\nAvg margin: **32.6%** across 8 SKUs. Top opportunities:\n- SKU-001: LAS → AOS substitution (+1.2%)\n- SKU-006: Betaine optimization (+2.1%)\n- SKU-008: SLES → AOS (+0.8%)\n\nTotal potential: **+$710K**. Use the **Simulation Engine** for cost analysis or **Lab Intelligence** for formulation experiments.";
  }
  if (lower.includes("cost") || lower.includes("price")) {
    return "Total portfolio landed cost trending **+3.2% YoY**:\n\n1. Freight (+18% APAC routes)\n2. Surfactant inflation (+8% LAS, +5% SLES)\n\nMitigation: Prioritize substitution simulations for high-volume Laundry SKUs. Head to **Simulation Engine** for cost modeling or **Lab Intelligence** for formulation alternatives.";
  }
  if (lower.includes("risk") || lower.includes("supplier")) {
    return "Risk landscape:\n\n- **3 SKUs** above 40% risk threshold\n- **Primary driver:** Supplier concentration — 60% of surfactant from 2 suppliers\n- **Mitigation:** Diversify via MAT-001 → MAT-010 (AOS) substitution\n\nRun supplier analysis in **Simulation Engine** or test formulation alternatives in **Lab Intelligence**.";
  }
  if (lower.includes("forecast") || lower.includes("demand") || lower.includes("confidence")) {
    return "Forecast intelligence summary:\n\n- **Avg confidence:** 78.4% across portfolio\n- **Pattern:** Q3 seasonal uplift consistently under-forecast by 8-12%\n- **Recommendation:** Apply +6% seasonal correction for Jul-Sep\n\nHead to **Forecast Intelligence** for detailed SKU-level analysis with heuristic benchmarks.";
  }

  const ctx = screenContexts[path] || defaultContext;
  return `I'm here to help on the **${ctx.subtitle}** screen. You can ask me about:\n\n${ctx.quickActions.map(a => `• "${a}"`).join("\n")}\n\nOr ask any portfolio-related question — I have context across Dashboard, Simulation, Optimization, Forecast, Lab Intelligence, and Settings!`;
}

export function CopilotPanel() {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [lastContextPath, setLastContextPath] = useState("");
  const [hasShownProactive, setHasShownProactive] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const ctx = screenContexts[currentPath] || defaultContext;

  // Send context-aware welcome when screen changes
  useEffect(() => {
    if (currentPath !== lastContextPath) {
      setLastContextPath(currentPath);
      const welcomeMsg: Message = {
        id: `welcome-${currentPath}-${Date.now()}`,
        role: "assistant",
        content: ctx.welcomeMessage,
        timestamp: new Date(),
      };

      if (messages.length === 0) {
        setMessages([welcomeMsg]);
      } else {
        setMessages(prev => [...prev, {
          id: `nav-${Date.now()}`,
          role: "assistant",
          content: `📍 *Switched to **${ctx.subtitle}***\n\n${ctx.welcomeMessage}`,
          timestamp: new Date(),
        }]);
      }
    }
  }, [currentPath]);

  // Proactive suggestion when opening the panel
  useEffect(() => {
    if (isOpen && ctx.proactiveSuggestion && !hasShownProactive.has(currentPath)) {
      setHasShownProactive(prev => new Set(prev).add(currentPath));
      const timer = setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `proactive-${currentPath}-${Date.now()}`,
          role: "assistant",
          content: `💡 **Proactive insight:**\n\n${ctx.proactiveSuggestion}`,
          timestamp: new Date(),
        }]);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, currentPath]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = getResponse(userMsg.content, currentPath);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }]);
      setIsTyping(false);
    }, 600 + Math.random() * 800);
  };

  const handleQuickAction = (q: string) => {
    setInput(q);
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: q, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getResponse(q, currentPath),
        timestamp: new Date(),
      }]);
      setIsTyping(false);
    }, 600 + Math.random() * 800);
    setInput("");
  };

  return (
    <>
      {/* Floating trigger */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center group"
          >
            <Sparkles className="h-5 w-5" />
            {ctx.proactiveSuggestion && !hasShownProactive.has(currentPath) && (
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-accent rounded-full animate-pulse" />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 z-50 h-full w-[380px] bg-card border-l shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">MarCo Co-pilot</p>
                  <p className="text-[10px] text-muted-foreground">📍 {ctx.subtitle}</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 rounded hover:bg-muted transition-colors">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}>
                    {msg.content.split("\n").map((line, i) => (
                      <p key={i} className={line === "" ? "h-1.5" : ""}>
                        {line.split(/(\*\*.*?\*\*)/).map((part, j) =>
                          part.startsWith("**") && part.endsWith("**")
                            ? <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>
                            : part
                        )}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-3 py-2 flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Context-aware quick actions */}
            <div className="px-4 pb-2 flex gap-1.5 flex-wrap">
              {ctx.quickActions.map(q => (
                <button
                  key={q}
                  onClick={() => handleQuickAction(q)}
                  className="text-[10px] px-2 py-1 rounded-full border border-border hover:bg-muted transition-colors text-muted-foreground"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 border-t">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSend()}
                  placeholder={`Ask about ${ctx.subtitle.toLowerCase()}...`}
                  className="flex-1 text-xs bg-muted rounded-lg px-3 py-2 outline-none placeholder:text-muted-foreground/60 focus:ring-1 focus:ring-primary/30"
                />
                <Button size="icon" variant="ghost" onClick={handleSend} disabled={!input.trim()} className="h-8 w-8 shrink-0">
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
