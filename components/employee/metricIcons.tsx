import { ArrowUp, Headphones, RefreshCw, Smartphone, Tablet, Target, Wifi, type LucideIcon } from "lucide-react";

export const METRIC_ICONS: Record<string, LucideIcon> = {
    ACTIVATIONS: Smartphone,
    BTS: Tablet,
    HSI: Wifi,
    MIGRATIONS: RefreshCw,
    ACCESSORIES: Headphones,
    UPGRADES: ArrowUp,
};

export const DEFAULT_METRIC_ICON: LucideIcon = Target;

export const iconForMetric = (key: string): LucideIcon => METRIC_ICONS[key.toUpperCase()] ?? DEFAULT_METRIC_ICON;
