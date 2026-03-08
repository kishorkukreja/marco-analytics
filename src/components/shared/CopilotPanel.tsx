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
  "/": {
    subtitle: "Executive Summary",
    welcomeMessage: "I'm looking at your **Executive Summary**. I can see your portfolio KPIs, trend analysis, and active alerts. Here's what stands out:\n\n• **SKU-006** margin at 22.8% is below the 25% threshold — needs attention\n• **$2.3M** in identified savings across 14 simulations\n• LAS surfactant cost up 12% — impacting 3 SKUs\n\nWhat would you like to dig into?",
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
  "/insights": {
    subtitle: "Insights & Value",
    welcomeMessage: "You're viewing **Insights & Value**. I can help you understand:\n\n• **Scenario comparisons** and trade-offs\n• **ROI projections** and payback periods\n• **Approval workflow** status and bottlenecks\n\nWhat would you like to explore?",
    quickActions: ["Compare scenarios", "ROI projection details", "Approval status", "Total value created"],
    proactiveSuggestion: "Scenario A (conservative substitution) projects $1.8M savings vs Scenario B (aggressive) at $3.1M but with 2.3x higher risk. Would you like a detailed comparison?",
  },
  "/architecture": {
    subtitle: "System Architecture",
    welcomeMessage: "You're viewing the **System Architecture**. I can explain:\n\n• How the **Data Layer** feeds into the Logic Layer\n• The **Similarity Engine** and **Cost Simulation** algorithms\n• How **Forecast Intelligence** validates predictions\n\nClick on any layer for details.",
    quickActions: ["How does similarity work?", "Explain the data flow", "What drives risk scores?", "Forecast validation logic"],
    proactiveSuggestion: "The architecture uses a 4-layer design: Data → Logic → Intelligence → Presentation. Each layer is independently testable. Want me to walk through any specific component?",
  },
  "/admin": {
    subtitle: "Admin Settings",
    welcomeMessage: "You're in **Admin Settings**. I can help with:\n\n• **Threshold configuration** for risk, margin, and confidence\n• **Data refresh** schedules and pipeline status\n• **User permissions** and audit logs\n\nWhat would you like to configure?",
    quickActions: ["Current thresholds", "Data pipeline status", "User access logs", "Configuration best practices"],
    proactiveSuggestion: "Your risk threshold is set at 40%. Based on current portfolio risk distribution, 35% would flag 2 additional SKUs for review. Want me to show the impact?",
  },
};

const defaultContext: ScreenContext = {
  subtitle: "Portfolio Assistant",
  welcomeMessage: "Hi! I'm your MarCo Co-pilot. I can help you analyze your portfolio. What would you like to explore?",
  quickActions: ["Margin opportunities", "Key risks", "Cost drivers", "Forecast accuracy"],
  proactiveSuggestion: "",
};

// ========== RESPONSE ENGINE ==========
function getResponse(input: string, path: string): string {
  const lower = input.toLowerCase();

  // Simulation-specific responses
  if (path === "/simulation") {
    if (lower.includes("substitute") || lower.includes("sku-001") || lower.includes("best")) {
      return "For **SKU-001 (UltraClean 1L)**, the top substitute for LAS surfactant is:\n\n🏆 **AOS (MAT-010)** — Alpha Olefin Sulfonate\n- Similarity: **89.4%**\n- Cost: **$2.40/kg** (vs $2.85/kg for LAS = -16%)\n- Risk: **0.2%** (very low)\n- Supplier: IndoChem (India), 21-day lead time\n\n**Projected impact:** $237K annual savings at +0.76% margin uplift.\n\nThe only trade-off is slightly higher freight from India vs Germany. Run the simulation to see full landed cost breakdown.";
    }
    if (lower.includes("freight") || lower.includes("logistics")) {
      return "Freight cost differences arise from **supplier origin**:\n\n| Route | Cost/kg |\n|---|---|\n| Germany → EMEA | $0.12 |\n| India → EMEA | $0.24 |\n| China → EMEA | $0.28 |\n\nSwitching from ChemCorp (Germany) to IndoChem (India) doubles freight, but the **$0.45/kg material savings** more than offsets the $0.12/kg freight increase.\n\nNet benefit: **$0.33/kg** or ~$174K annually for SKU-001.";
    }
    if (lower.includes("monte carlo") || lower.includes("risk distribution")) {
      return "The Monte Carlo simulation runs **5,000 iterations** with stochastic variation:\n\n- Material cost: **±12%** (normal distribution)\n- Freight: **±18%** (higher volatility)\n- Duties: **±8%**\n- Packaging: **±5%**\n\n**Interpretation:**\n- **P5 (Best case):** Even with favorable conditions, savings rarely exceed the deterministic estimate by >8%\n- **P95 (Worst case):** In adverse scenarios, savings could erode by up to 25%\n- **P50 (Median):** Closely tracks the deterministic estimate, confirming model reliability\n\nThe tight P5–P95 band indicates **low overall risk** for this substitution.";
    }
    if (lower.includes("risk") || lower.includes("lowest")) {
      return "Materials ranked by risk score (lowest first):\n\n1. **MAT-010 (AOS)** — Risk: 0.2% ✅\n   - 89.4% similarity, reliable supplier\n2. **MAT-002 (SLES)** — Risk: 0.4%\n   - 85% similarity, but higher cost\n3. **MAT-003 (Cocamidopropyl Betaine)** — Risk: 0.8%\n   - 82% similarity, US-based supplier\n\nRisk is calculated as: `AttrVariance × HistFailRate × SupplierReliability`\n\nMAT-010 scores lowest because AOS has very similar functional properties to LAS with a reliable (82%) supplier.";
    }
  }

  // Forecast-specific responses
  if (path === "/forecast") {
    if (lower.includes("heuristic") || lower.includes("accurate") || lower.includes("which")) {
      return "Heuristic benchmark accuracy by category:\n\n| Category | Best Heuristic | Alignment |\n|---|---|---|\n| Laundry | **CoC** | 82% |\n| Dishwash | **LY** | 78% |\n| Personal Care | **CoC** | 76% |\n| Home Care | **L2Y** | 71% |\n\n**Key findings:**\n- **CoC** works best for categories with consistent growth patterns\n- **LY** excels for highly seasonal products\n- **L2Y** provides stability for volatile categories by averaging out noise\n\nRecommendation: Use CoC as primary for Laundry & Personal Care, LY for Dishwash.";
    }
    if (lower.includes("confidence") || lower.includes("low")) {
      return "Confidence score is derived from 5 factors:\n\n1. **CoC Alignment (25%)** — How well period-over-period change predicts actuals\n2. **LY Alignment (25%)** — Same-month-last-year accuracy\n3. **L2Y Alignment (20%)** — 2-year average stability\n4. **Bias Stability (15%)** — Consistency of forecast errors\n5. **Volatility Control (15%)** — Demand signal smoothness\n\nWhen confidence drops below **75%**, it usually means:\n- Bias is **persistent** (consistently over or under-forecasting)\n- Or demand pattern has **structurally shifted** (new channel, promotion, etc.)\n\nCheck the bias stability bar — if it's below 60%, there's a systematic issue to address.";
    }
    if (lower.includes("anomal")) {
      return "Anomalies are flagged when any of these conditions are met:\n\n1. Forecast deviation > **2σ** of historical deviation\n2. LY deviation > **15%**\n3. Bias persists for **3 consecutive cycles**\n\nFor the current SKU, most anomalies cluster in **Q3 months** (Jul-Sep), suggesting a recurring seasonal pattern the baseline model doesn't fully capture.\n\n**Action:** Apply a +6-8% seasonal uplift for Q3 based on L2Y patterns. This would resolve ~60% of flagged anomalies.";
    }
    if (lower.includes("q3") || lower.includes("benchmark") || lower.includes("season")) {
      return "For Q3 (Jul-Sep) demand planning:\n\n**Historical pattern:** Actuals exceed baseline by 8-14% in Q3 across most categories. This is consistent over L2Y.\n\n**Best benchmark for Q3:**\n- **LY** for Dishwash (strong seasonal signal)\n- **CoC** for Laundry (growth + seasonal compound)\n- **L2Y average** for volatile SKUs (smooths out outliers)\n\n**Recommended correction:** Baseline × 1.08 (LY seasonal factor) × 1.02 (trend correction) for Q3 months.";
    }
  }

  // Dashboard-specific responses
  if (path === "/") {
    if (lower.includes("sku") || lower.includes("attention") || lower.includes("alert")) {
      return "SKUs requiring immediate attention:\n\n🔴 **SKU-006 (BrightWave Softener)** — Margin at 22.8%, below 25% floor\n- Impact: -$180K annual\n- Action: Run substitution sim for Cocamidopropyl Betaine\n\n🟠 **SKU-001 (UltraClean 1L)** — LAS cost spike +12%\n- Impact: +$410K COGS increase\n- Action: Evaluate AOS substitute (89.4% similarity)\n\n🟠 **SKU-005 (AquaFresh Cleaner)** — LATAM freight up 15%\n- Impact: -$95K annual\n- Action: Review regional sourcing options\n\n🟢 **SKU-003 (FreshGlow Dishwash)** — Q3 demand under-forecast\n- Action: Apply LY seasonal correction";
    }
    if (lower.includes("saving") || lower.includes("breakdown")) {
      return "Savings breakdown by category:\n\n| Category | Realized | Potential | Gap |\n|---|---|---|---|\n| Laundry | $890K | $1.2M | $310K |\n| Personal Care | $620K | $780K | $160K |\n| Home Care | $490K | $640K | $150K |\n| Dishwash | $340K | $520K | $180K |\n| **Total** | **$2.34M** | **$3.14M** | **$800K** |\n\n**To close the gap:** The remaining $800K is mostly in Laundry (LAS → AOS substitution) and Dishwash (SLES optimization). Both have >80% similarity scores and low risk.";
    }
    if (lower.includes("cost") || lower.includes("trend")) {
      return "Cost trend analysis (12-month):\n\n📈 **Total portfolio cost up +3.2% YoY**\n\n**Top cost drivers:**\n1. **Raw materials** (+8% LAS, +5% SLES) — driven by petrochemical price increases\n2. **Freight** (+18% APAC routes) — shipping lane disruptions\n3. **Duties** (stable) — no regulatory changes\n\n**Offset by:**\n- Manufacturing efficiency gains (-2%)\n- Warehouse optimization (-1.5%)\n\n**Net impact:** +$1.4M annual cost increase. Material substitution could offset **60-70%** of this through lower-cost alternatives.";
    }
    if (lower.includes("margin") || lower.includes("opportunit")) {
      return "Top margin improvement opportunities:\n\n1. **SKU-001** — LAS → AOS substitution\n   - Uplift: **+1.2%** margin (+$320K)\n   - Risk: Very low (0.2%)\n   - Status: Ready for simulation\n\n2. **SKU-006** — Cocamidopropyl Betaine optimization\n   - Uplift: **+2.1%** margin (+$180K)\n   - Risk: Low (0.8%)\n   - Status: Needs R&D validation\n\n3. **SKU-008** — SLES → AOS for Body Wash\n   - Uplift: **+0.8%** margin (+$210K)\n   - Risk: Medium (1.4%)\n   - Status: Pending supplier qualification\n\n**Total potential:** +$710K from top 3 opportunities.";
    }
  }

  // Generic fallbacks
  if (lower.includes("margin") || lower.includes("saving")) {
    return "Based on current portfolio analysis, **SKU-001 (UltraClean 1L)** and **SKU-006 (BrightWave Softener)** show the highest margin improvement potential through material substitution.\n\n**Key insight:** Switching LAS surfactant to AOS in SKU-001 could yield **+1.2% margin uplift** with minimal risk (similarity: 89.4%).";
  }
  if (lower.includes("cost") || lower.includes("price")) {
    return "Total portfolio landed cost is trending **+3.2% YoY** driven primarily by:\n\n1. **Freight cost increases** (+18% in APAC routes)\n2. **Surfactant raw material inflation** (+8% LAS, +5% SLES)\n\n**Recommendation:** Prioritize substitution simulations for high-volume Laundry SKUs where material cost represents >20% of COGS.";
  }
  if (lower.includes("risk") || lower.includes("supplier")) {
    return "Current risk landscape:\n\n- **3 SKUs** above risk threshold (>40%)\n- **Primary risk driver:** Supplier concentration — 60% of surfactant volume from 2 suppliers\n- **Mitigation:** Run substitution simulation for MAT-001 → MAT-010 (AOS) to diversify supplier base.";
  }
  if (lower.includes("forecast") || lower.includes("demand") || lower.includes("confidence")) {
    return "Forecast intelligence summary:\n\n- **Avg confidence score:** 78.4% across portfolio\n- **Pattern detected:** CoC analysis shows Q3 seasonal uplift consistently under-forecast by 8-12%\n- **Recommendation:** Apply +6% seasonal correction for Jul-Sep based on L2Y benchmark alignment.";
  }

  const ctx = screenContexts[path] || defaultContext;
  return `I'm here to help on the **${ctx.subtitle}** screen. You can ask me about:\n\n${ctx.quickActions.map(a => `• "${a}"`).join("\n")}\n\nOr ask any portfolio-related question!`;
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
        // Add a context switch message
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
    // Auto-send
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
            {/* Pulse indicator for proactive suggestion */}
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
