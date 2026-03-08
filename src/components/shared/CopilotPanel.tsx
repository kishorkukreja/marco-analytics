import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Sparkles, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const contextualResponses: Record<string, string[]> = {
  "margin": [
    "Based on current portfolio analysis, **SKU-001 (UltraClean 1L)** and **SKU-006 (BrightWave Softener)** show the highest margin improvement potential through material substitution.\n\n**Key insight:** Switching LAS surfactant to AOS in SKU-001 could yield **+1.2% margin uplift** with minimal risk (similarity: 89.4%).",
  ],
  "cost": [
    "Total portfolio landed cost is trending **+3.2% YoY** driven primarily by:\n\n1. **Freight cost increases** (+18% in APAC routes)\n2. **Surfactant raw material inflation** (+8% LAS, +5% SLES)\n\n**Recommendation:** Prioritize substitution simulations for high-volume Laundry SKUs where material cost represents >20% of COGS.",
  ],
  "risk": [
    "Current risk landscape across the portfolio:\n\n- **3 SKUs** above risk threshold (>40%)\n- **Primary risk driver:** Supplier concentration — 60% of surfactant volume from 2 suppliers\n- **Mitigation:** Run substitution simulation for MAT-001 → MAT-010 (AOS) to diversify supplier base while maintaining 89%+ similarity.",
  ],
  "forecast": [
    "Forecast intelligence summary for current selection:\n\n- **Avg confidence score:** 78.4% across portfolio\n- **Pattern detected:** CoC analysis shows Q3 seasonal uplift consistently under-forecast by 8-12%\n- **Recommendation:** Apply +6% seasonal correction for Jul-Sep periods based on L2Y benchmark alignment.\n\nWould you like me to drill into a specific SKU's forecast?",
  ],
  "default": [
    "I can help you analyze your CPG portfolio across several dimensions:\n\n- **\"Show me margin opportunities\"** — I'll identify SKUs with substitution potential\n- **\"What are the key risks?\"** — Portfolio risk assessment\n- **\"Forecast accuracy\"** — Confidence scores and anomaly analysis\n- **\"Cost drivers\"** — Landed cost trend analysis\n\nWhat would you like to explore?",
  ],
};

function getResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("margin") || lower.includes("saving") || lower.includes("uplift")) {
    return contextualResponses.margin[0];
  }
  if (lower.includes("cost") || lower.includes("price") || lower.includes("spend")) {
    return contextualResponses.cost[0];
  }
  if (lower.includes("risk") || lower.includes("supplier") || lower.includes("alert")) {
    return contextualResponses.risk[0];
  }
  if (lower.includes("forecast") || lower.includes("demand") || lower.includes("accuracy") || lower.includes("confidence")) {
    return contextualResponses.forecast[0];
  }
  return contextualResponses.default[0];
}

export function CopilotPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm your MarCo Co-pilot. I can help you analyze SKU margins, identify cost reduction opportunities, assess risks, and interpret forecast signals. What would you like to explore?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      const response = getResponse(userMsg.content);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }]);
      setIsTyping(false);
    }, 800 + Math.random() * 600);
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
            className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center"
          >
            <Sparkles className="h-5 w-5" />
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
                  <p className="text-[10px] text-muted-foreground">Contextual Intelligence Assistant</p>
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

            {/* Quick actions */}
            <div className="px-4 pb-2 flex gap-1.5 flex-wrap">
              {["Margin opportunities", "Key risks", "Cost drivers", "Forecast accuracy"].map(q => (
                <button
                  key={q}
                  onClick={() => { setInput(q); }}
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
                  placeholder="Ask about your portfolio..."
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
