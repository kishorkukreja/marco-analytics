import { motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { useState } from "react";

interface InlineNudgeProps {
  message: string;
  action?: string;
  onAction?: () => void;
  variant?: "info" | "opportunity" | "warning";
}

const variantStyles = {
  info: "border-primary/20 bg-primary/5",
  opportunity: "border-accent/20 bg-accent/5",
  warning: "border-warning/20 bg-warning/5",
};

const iconStyles = {
  info: "text-primary",
  opportunity: "text-accent",
  warning: "text-warning",
};

export function InlineNudge({ message, action, onAction, variant = "info" }: InlineNudgeProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, y: -8, height: 0 }}
      className={`rounded-lg border p-3 ${variantStyles[variant]}`}
    >
      <div className="flex items-start gap-2">
        <Sparkles className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${iconStyles[variant]}`} />
        <div className="flex-1 min-w-0">
          <p className="text-xs leading-relaxed text-foreground">{message}</p>
          {action && onAction && (
            <button onClick={onAction} className="text-[10px] font-semibold text-primary hover:underline mt-1">
              {action} →
            </button>
          )}
        </div>
        <button onClick={() => setDismissed(true)} className="shrink-0 p-0.5 rounded hover:bg-muted transition-colors">
          <X className="h-3 w-3 text-muted-foreground" />
        </button>
      </div>
    </motion.div>
  );
}
