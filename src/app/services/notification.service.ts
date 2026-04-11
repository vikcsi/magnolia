import { Injectable, inject } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { firstValueFrom } from 'rxjs';
import { DataService } from './data.service';
import { FIXED_GOALS } from '../constants/goals.constant';
import { UserGoal } from '../models/goal.model';
import { UserChallenge } from '../models/challenge.model';
import { Challenge } from '../models/challenge.model';

const DAY_MS = 24 * 60 * 60 * 1000;
const THRESHOLDS_DAYS = [3, 1];

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private dataService = inject(DataService);

  async scheduleExpiryNotifications(userId: string): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    const { display } = await LocalNotifications.requestPermissions();
    if (display !== 'granted') return;

    const [goals, challenges, globalChallenges] = await Promise.all([
      firstValueFrom(this.dataService.getUserGoals(userId)),
      firstValueFrom(this.dataService.getActiveUserChallenges(userId)),
      firstValueFrom(this.dataService.getGlobalChallenges()),
    ]);

    const pending = await LocalNotifications.getPending();
    const pendingIds = new Set(pending.notifications.map((n) => n.id));
    const toSchedule: any[] = [];
    const now = new Date();

    // ── Célkitűzések ──
    const activeGoals = (goals ?? []).filter((g) => g.status === 'active');
    for (const goal of activeGoals) {
      const def = FIXED_GOALS.find((g) => g.id === goal.goalId);
      if (!def) continue;
      const deadline = this.goalDeadline(goal, def.durationDays);
      this.collectNotifications(toSchedule, pendingIds, `g_${goal.id}`, def.title, 'célkitűzés', deadline, now);
    }

    // ── Kihívások ──
    for (const uc of challenges ?? []) {
      const def = (globalChallenges ?? []).find((c: Challenge) => c.id === uc.challengeId);
      const name = def?.name ?? 'Kihívás';
      const deadline = this.toDate(uc.expiresAt);
      this.collectNotifications(toSchedule, pendingIds, `c_${uc.id}`, name, 'kihívás', deadline, now);
    }

    if (toSchedule.length > 0) {
      await LocalNotifications.schedule({ notifications: toSchedule });
    }
  }

  private collectNotifications(
    list: any[],
    pendingIds: Set<number>,
    key: string,
    name: string,
    type: string,
    deadline: Date,
    now: Date,
  ): void {
    for (const days of THRESHOLDS_DAYS) {
      const fireAt = new Date(deadline.getTime() - days * DAY_MS);
      if (fireAt <= now) continue;

      const id = this.stableId(`${key}_${days}d`);
      if (pendingIds.has(id)) continue;

      list.push({
        id,
        title: days === 1 ? 'Magnolia – Utolsó nap!' : 'Magnolia – Hamarosan lejár!',
        body:
          days === 1
            ? `„${name}" ${type}od holnap lejár. Ne hagyd ki!`
            : `„${name}" ${type}od ${days} nap múlva lejár.`,
        schedule: { at: fireAt },
        smallIcon: 'ic_stat_icon_config_sample',
        iconColor: days === 1 ? '#FF9800' : '#4CAF50',
        extra: { key },
      });
    }
  }

  private goalDeadline(goal: UserGoal, durationDays: number): Date {
    const start = this.toDate(goal.startDate);
    return new Date(start.getTime() + durationDays * DAY_MS);
  }

  private toDate(value: any): Date {
    if (value instanceof Date) return value;
    if (typeof value?.toDate === 'function') return value.toDate();
    return new Date(value);
  }

  /** Determinisztikus, pozitív egész szám adott kulcshoz (notification ID-nak kell szám) */
  private stableId(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = Math.imul(31, hash) + str.charCodeAt(i);
    }
    return Math.abs(hash) % 2_000_000_000;
  }
}
