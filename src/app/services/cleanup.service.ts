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
  doc,
} from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { FIXED_GOALS } from '../constants/goals.constant';
import { environment } from '../../environments/environment';

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

  private async cleanupExpiredChallenges(userId: string): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      const challengesRef = collection(this.firestore, 'user_challenges');
      const q = query(
        challengesRef,
        where('userId', '==', userId),
        where('status', '==', 'active'),
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return;

      const batch = writeBatch(this.firestore);
      const now = new Date();
      let failedCount = 0;

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const expiresAt =
          data['expiresAt'] instanceof Date
            ? data['expiresAt']
            : data['expiresAt']?.toDate?.();

        if (expiresAt && now > expiresAt) {
          batch.update(docSnap.ref, { status: 'failed' });
          failedCount++;
        }
      });

      if (failedCount > 0) {
        await batch.commit();
        if (!environment.production) console.log(`[CleanupService] ${failedCount} lejárt kihívás lezárva.`);
      }
    });
  }

  private async cleanupExpiredGoals(userId: string): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      const goalsRef = collection(this.firestore, 'user_goals');
      const q = query(
        goalsRef,
        where('userId', '==', userId),
        where('status', '==', 'active'),
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return;

      const batch = writeBatch(this.firestore);
      const now = new Date();
      let failedCount = 0;

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();

        const startDate =
          data['startDate'] instanceof Date
            ? data['startDate']
            : data['startDate']?.toDate?.();

        if (!startDate) return;

        const goalDef = FIXED_GOALS.find((g) => g.id === data['goalId']);
        if (!goalDef) return;

        const deadlineMs =
          startDate.getTime() + goalDef.durationDays * 24 * 60 * 60 * 1000;
        const deadline = new Date(deadlineMs);

        if (now > deadline) {
          batch.update(docSnap.ref, {
            status: 'failed',
            failedAt: now,
          });
          failedCount++;
        }
      });

      if (failedCount > 0) {
        await batch.commit();
        if (!environment.production) console.log(`[CleanupService] ${failedCount} lejárt célkitűzés lezárva.`);
      }
    });
  }
}
