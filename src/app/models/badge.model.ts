export type BadgeCategory = 'first' | 'goal' | 'challenge' | 'activity' | 'level' | 'streak';
export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type BadgeConditionType =
  | 'first_activity'
  | 'first_travel'
  | 'first_shopping'
  | 'first_energy'
  | 'first_goal_completed'
  | 'first_challenge_completed'
  | 'specific_goal_completed'
  | 'all_goals_completed'
  | 'challenge_count'
  | 'activity_count'
  | 'level_reached'
  | 'max_level'
  | 'streak_days';

export interface BadgeCondition {
  type: BadgeConditionType;
  targetValue?: number;
  targetId?: string;
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  xpReward: number;
  condition: BadgeCondition;
}

export interface UserBadge {
  id: string;
  earnedAt: Date;
}