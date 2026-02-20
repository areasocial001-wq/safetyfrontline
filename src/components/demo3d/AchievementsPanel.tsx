import { Achievement } from "@/lib/achievements";
import { AchievementBadge } from "./AchievementBadge";
import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";

interface AchievementsPanelProps {
  achievements: Achievement[];
  unlockedIds: string[];
}

export const AchievementsPanel = ({
  achievements,
  unlockedIds,
}: AchievementsPanelProps) => {
  const unlockedCount = unlockedIds.length;
  const totalCount = achievements.length;
  const percentage = Math.round((unlockedCount / totalCount) * 100);

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Trophy className="w-8 h-8 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Achievements Sbloccati</h2>
          <p className="text-sm text-muted-foreground">
            {unlockedCount} di {totalCount} ({percentage}%)
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Achievement badges */}
      <div className="grid gap-3">
        {achievements.map((achievement) => (
          <AchievementBadge
            key={achievement.id}
            achievement={achievement}
            unlocked={unlockedIds.includes(achievement.id)}
          />
        ))}
      </div>
    </Card>
  );
};
