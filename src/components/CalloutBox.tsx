import { Info, AlertTriangle, Lightbulb, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type CalloutVariant = "info" | "warning" | "tip" | "success";

interface Props {
  variant?: CalloutVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const CONFIG: Record<CalloutVariant, {
  icon: React.ElementType;
  containerClass: string;
  iconClass: string;
  titleClass: string;
  textClass: string;
}> = {
  info: {
    icon: Info,
    containerClass: "bg-brand-50 border-brand-200",
    iconClass: "text-brand-500",
    titleClass: "text-brand-800",
    textClass: "text-brand-700",
  },
  warning: {
    icon: AlertTriangle,
    containerClass: "bg-amber-50 border-amber-200",
    iconClass: "text-amber-500",
    titleClass: "text-amber-800",
    textClass: "text-amber-700",
  },
  tip: {
    icon: Lightbulb,
    containerClass: "bg-green-50 border-green-200",
    iconClass: "text-green-500",
    titleClass: "text-green-800",
    textClass: "text-green-700",
  },
  success: {
    icon: CheckCircle,
    containerClass: "bg-green-50 border-green-200",
    iconClass: "text-green-500",
    titleClass: "text-green-800",
    textClass: "text-green-700",
  },
};

export default function CalloutBox({ variant = "info", title, children, className }: Props) {
  const cfg = CONFIG[variant];
  const Icon = cfg.icon;

  return (
    <div className={cn("border rounded-xl p-4 my-4", cfg.containerClass, className)}>
      <div className="flex gap-3">
        <Icon className={cn("w-5 h-5 shrink-0 mt-0.5", cfg.iconClass)} />
        <div className="flex-1 text-sm leading-relaxed">
          {title && (
            <p className={cn("font-semibold mb-1", cfg.titleClass)}>{title}</p>
          )}
          <div className={cfg.textClass}>{children}</div>
        </div>
      </div>
    </div>
  );
}
