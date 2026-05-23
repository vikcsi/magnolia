import {
  Injectable,
  inject,
  Injector,
  runInInjectionContext,
} from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
} from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { FIXED_GOALS } from '../constants/goals.constant';
import { environment } from '../../environments/environment';
import { toDate } from '../utils/date.util';

@Injectable({ providedIn: 'root' })
export class CleanupService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private injector = inject(Injector);

  async cleanupExpiredItems(): Promise<void> {
    const userId = this.authService.currentUser?.uid;
    if (!userId) return;

    try {
      await Promise.all([
        this.cleanupExpiredChallenges(userId),
        this.cleanupExpiredGoals(userId),
      ]);
      if (!environment.production) console.log('[CleanupService] Lejárt elemek tisztítása kész.');
    } catch (error) {
      if (!environment.production) console.warn('[CleanupService] Cleanup hiba:', error);
    }
  }

  private cleanupExpiredChallenges(userId: string): Promise<void> {
    return this.cleanupExpired(
      userId,
      'user_challenges',
      (data) => toDate(data['expiresAt']),
      'lejárt kihívás lezárva.',
    );
  }

  private cleanupExpiredGoals(userId: string): Promise<void> {
    return this.cleanupExpired(
      userId,
      'user_goals',
      (data) => {
        const startDate = toDate(data['startDate']);
        if (!startDate) return null;
        const goalDef = FIXED_GOALS.find((g) => g.id === data['goalId']);
        if (!goalDef) return null;
        return new Date(startDate.getTime() + goalDef.durationDays * 24 * 60 * 60 * 1000);
      },
      'lejárt célkitűzés lezárva.',
      (now) => ({ failedAt: now }),
    );
  }

  private async cleanupExpired<T extends Record<string, any>>(
    userId: string,
    collectionName: string,
    deadlineFn: (data: T) => Date | null,
    label: string,
    extraUpdate: (now: Date) => Record<string, any> = () => ({}),
  ): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      const ref = collection(this.firestore, collectionName);
      const q = query(ref, where('userId', '==', userId), where('status', '==', 'active'));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return;

      const batch = writeBatch(this.firestore);
      const now = new Date();
      let failedCount = 0;

      snapshot.forEach((docSnap) => {
        const deadline = deadlineFn(docSnap.data() as T);
        if (deadline && now > deadline) {
          batch.update(docSnap.ref, { status: 'failed', ...extraUpdate(now) });
          failedCount++;
        }
      });

      if (failedCount > 0) {
        await batch.commit();
        if (!environment.production) console.log(`[CleanupService] ${failedCount} ${label}`);
      }
    });
  }
}
