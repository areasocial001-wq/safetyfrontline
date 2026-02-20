import { Achievement, getRarityColor, getRarityBg, getRarityLabel } from "@/lib/achievements";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";

interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked: boolean;
  compact?: boolean;
}

export const AchievementBadge = ({
  achievement,
  unlocked,
  compact = false,
}: AchievementBadgeProps) => {
  const Icon = achievement.icon;

  if (compact) {
    return (
      <div
        className={`relative inline-flex items-center justify-center w-12 h-12 rounded-full border-2 ${
          unlocked ? getRarityColor(achievement.rarity) : "border-muted"
        } ${unlocked ? getRarityBg(achievement.rarity) : "bg-muted/20"} transition-all`}
        title={achievement.name}
      >
        {unlocked ? (
          <Icon className={unlocked ? getRarityColor(achievement.rarity).split(" ")[0] : "text-muted-foreground"} size={20} />
        ) : (
          <Lock className="text-muted-foreground" size={16} />
        )}
      </div>
    );
  }

  return (
    <Card
      className={`p-4 transition-all ${
        unlocked
          ? `border-2 ${getRarityColor(achievement.rarity)} ${getRarityBg(achievement.rarity)}`
          : "opacity-50 border-muted"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center ${
            unlocked ? getRarityColor(achievement.rarity) : "border-muted bg-muted/20"
          }`}
        >
          {unlocked ? (
            <Icon className={getRarityColor(achievement.rarity).split(" ")[0]} size={24} />
          ) : (
            <Lock className="text-muted-foreground" size={20} />
          )}
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className={`font-bold ${unlocked ? "" : "text-muted-foreground"}`}>
              {achievement.name}
            </h3>
            <Badge
              variant="outline"
              className={`text-xs ${unlocked ? getRarityColor(achievement.rarity) : "text-muted-foreground border-muted"}`}
            >
              {getRarityLabel(achievement.rarity)}
            </Badge>
          </div>
          <p className={`text-sm ${unlocked ? "text-muted-foreground" : "text-muted-foreground/70"}`}>
            {achievement.description}
          </p>
        </div>
      </div>
    </Card>
  );
};
