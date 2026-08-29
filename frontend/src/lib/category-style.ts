import {
  Apple,
  BookOpen,
  Brain,
  Briefcase,
  Code,
  Coffee,
  Compass,
  Dumbbell,
  Gamepad2,
  Heart,
  Home,
  Leaf,
  Music,
  Palette,
  Plane,
  ShoppingCart,
  Sparkles,
  Star,
  Sun,
  Tag,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

export const CATEGORY_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#14b8a6", // teal
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#6b7280", // gray
] as const;

export interface CategoryIconDef {
  name: string;
  Icon: LucideIcon;
}

export const CATEGORY_ICONS: CategoryIconDef[] = [
  { name: "star", Icon: Star },
  { name: "heart", Icon: Heart },
  { name: "zap", Icon: Zap },
  { name: "home", Icon: Home },
  { name: "briefcase", Icon: Briefcase },
  { name: "dumbbell", Icon: Dumbbell },
  { name: "book", Icon: BookOpen },
  { name: "code", Icon: Code },
  { name: "coffee", Icon: Coffee },
  { name: "music", Icon: Music },
  { name: "sun", Icon: Sun },
  { name: "leaf", Icon: Leaf },
  { name: "cart", Icon: ShoppingCart },
  { name: "plane", Icon: Plane },
  { name: "gamepad", Icon: Gamepad2 },
  { name: "brain", Icon: Brain },
  { name: "apple", Icon: Apple },
  { name: "wrench", Icon: Wrench },
  { name: "palette", Icon: Palette },
  { name: "compass", Icon: Compass },
  { name: "sparkles", Icon: Sparkles },
];

const ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  CATEGORY_ICONS.map((d) => [d.name, d.Icon]),
);

export function getCategoryIcon(name: string | null | undefined): LucideIcon {
  if (name && ICON_MAP[name]) return ICON_MAP[name];
  return Tag;
}
