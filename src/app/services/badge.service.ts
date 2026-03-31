import {
  Injectable,
  inject,
  Injector,
  runInInjectionContext,
} from '@angular/core';
import {
  Firestore,
  doc,
  updateDoc,
  increment,
  collection,
  query,
  where,
  getDocs,
  getDoc,
} from '@angular/fire/firestore';
import { BadgeDefinition, UserBadge } from '../models/badge.model';
import { BADGES } from '../constants/badges.constant';
import { FIXED_GOALS } from '../constants/goals.constant';
import { LEVELS } from '../constants/leveling.constant';
import { StatsService } from './stats.service';
import { Activity } from '../models/activity.model';

export interface BadgeCheckContext {
  trigger:
    | 'activity_saved'
    | 'goal_completed'
    | 'challenge_completed'
    | 'level_up';

  activityType?: 'travel' | 'shopping' | 'energy';

  completedGoalId?: string;

  currentLevel?: number;
}

@Injectable({ providedIn: 'root' })
export class BadgeService {
  private firestore = inject(Firestore);
  private injector = inject(Injector);
  private statsService = inject(StatsService);

  async checkAndAwardBadges(
    userId: string,
    context: BadgeCheckContext,
  ): Promise<BadgeDefinition[]> {
    return runInInjectionContext(this.injector, async () => {
      const userRef = doc(this.firestore, `users/${userId}`);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return [];

      const userData = userSnap.data();
      const currentBadges: UserBadge[] = userData['badges'] || [];
      const ownedBadgeIds = new Set(currentBadges.map((b) => b.id));

      let stats: UserStats | null = null;
      const getStats = async () => {
        if (!stats) {
          stats = await this.gatherUserStats(userId);
        }
        return stats;
      };

      const newlyEarned: BadgeDefinition[] = [];

      for (const badge of BADGES) {
        if (ownedBadgeIds.has(badge.id)) continue;

        if (!this.isRelevant(badge, context)) continue;

        const s = await getStats();
        if (this.evaluateCondition(badge, s, context)) {
          newlyEarned.push(badge);
        }
      }

      if (newlyEarned.length > 0) {
        const now = new Date();
        const newBadgeEntries: UserBadge[] = newlyEarned.map((b) => ({
          id: b.id,
          earnedAt: now,
        }));

        const totalBadgeXp = newlyEarned.reduce(
          (sum, b) => sum + b.xpReward,
          0,
        );

        await updateDoc(userRef, {
          badges: [...currentBadges, ...newBadgeEntries],
          allXP: increment(totalBadgeXp),
        });
      }

      return newlyEarned;
    });
  }

  private isRelevant(badge: BadgeDefinition, ctx: BadgeCheckContext): boolean {
    const { type } = badge.condition;

    switch (ctx.trigger) {
      case 'activity_saved':
        return [
          'first_activity',
          'first_travel',
          'first_shopping',
          'first_energy',
          'activity_count',
          'streak_days',
        ].includes(type);

      case 'goal_completed':
        return [
          'first_goal_completed',
          'specific_goal_completed',
          'all_goals_completed',
        ].includes(type);

      case 'challenge_completed':
        return ['first_challenge_completed', 'challenge_count'].includes(type);

      case 'level_up':
        return ['level_reached', 'max_level'].includes(type);

      default:
        return false;
    }
  }

  private evaluateCondition(
    badge: BadgeDefinition,
    stats: UserStats,
    ctx: BadgeCheckContext,
  ): boolean {
    const { condition } = badge;

    switch (condition.type) {
      case 'first_activity':
        return stats.totalActivities >= 1;

      case 'first_travel':
        return ctx.activityType === 'travel' && stats.travelCount >= 1;

      case 'first_shopping':
        return ctx.activityType === 'shopping' && stats.shoppingCount >= 1;

      case 'first_energy':
        return ctx.activityType === 'energy' && stats.energyCount >= 1;

      case 'first_goal_completed':
        return stats.completedGoalsCount >= 1;

      case 'first_challenge_completed':
        return stats.completedChallengesCount >= 1;

      case 'specific_goal_completed':
        return ctx.completedGoalId === condition.targetId;

      case 'all_goals_completed': {
        const allGoalIds = FIXED_GOALS.map((g) => g.id);
        return allGoalIds.every((gid) => stats.completedGoalIds.has(gid));
      }

      case 'challenge_count':
        return stats.completedChallengesCount >= (condition.targetValue || 0);

      case 'activity_count':
        return stats.totalActivities >= (condition.targetValue || 0);

      case 'level_reached':
        return (ctx.currentLevel || 0) >= (condition.targetValue || 0);

      case 'max_level': {
        const maxLevel = LEVELS[LEVELS.length - 1].level;
        return (ctx.currentLevel || 0) >= maxLevel;
      }

      case 'streak_days':
        return stats.currentStreak >= (condition.targetValue || 0);

      default:
        return false;
    }
  }

  private async gatherUserStats(userId: string): Promise<UserStats> {
    const activitiesRef = collection(this.firestore, 'activities');
    const activitiesQuery = query(activitiesRef, where('userId', '==', userId));
    const activitiesSnap = await getDocs(activitiesQuery);

    const activities: Activity[] = [];
    let travelCount = 0;
    let shoppingCount = 0;
    let energyCount = 0;

    activitiesSnap.forEach((d) => {
      const act = d.data() as Activity;
      activities.push(act);

      const type = act.type;
      if (type === 'travel') travelCount++;
      else if (type === 'shopping') shoppingCount++;
      else if (type === 'energy') energyCount++;
    });

    const currentStreak = this.statsService.getWeeklyStreak(activities);

    const goalsRef = collection(this.firestore, 'user_goals');
    const goalsQuery = query(
      goalsRef,
      where('userId', '==', userId),
      where('status', '==', 'completed'),
    );
    const goalsSnap = await getDocs(goalsQuery);
    const completedGoalIds = new Set<string>();
    goalsSnap.forEach((d) => completedGoalIds.add(d.data()['goalId']));

    const challengesRef = collection(this.firestore, 'user_challenges');
    const challengesQuery = query(
      challengesRef,
      where('userId', '==', userId),
      where('status', '==', 'completed'),
    );
    const challengesSnap = await getDocs(challengesQuery);

    return {
      totalActivities: travelCount + shoppingCount + energyCount,
      travelCount,
      shoppingCount,
      energyCount,
      completedGoalsCount: goalsSnap.size,
      completedGoalIds,
      completedChallengesCount: challengesSnap.size,
      currentStreak: currentStreak,
    };
  }
}

interface UserStats {
  totalActivities: number;
  travelCount: number;
  shoppingCount: number;
  energyCount: number;
  completedGoalsCount: number;
  completedGoalIds: Set<string>;
  completedChallengesCount: number;
  currentStreak: number;
}
