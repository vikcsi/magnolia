import {
  Injectable,
  inject,
  Injector,
  runInInjectionContext,
} from '@angular/core';
import {
  Firestore,
  doc,
  docData,
  collection,
  collectionData,
  query,
  where,
  addDoc,
  updateDoc,
  increment,
  setDoc,
  getDoc,
  getDocs,
  writeBatch,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { Goal, UserGoal } from '../models/goal.model';
import { Activity } from '../models/activity.model';
import { FIXED_GOALS } from '../constants/goals.constant';

@Injectable({ providedIn: 'root' })
export class DataService {
  private firestore: Firestore = inject(Firestore);
  private injector: Injector = inject(Injector);

  getUserData(uid: string): Observable<User> {
    return runInInjectionContext(this.injector, () => {
      const userDocRef = doc(this.firestore, `users/${uid}`);
      return docData(userDocRef, { idField: 'id' }) as Observable<User>;
    });
  }

  getUserActivities(uid: string): Observable<Activity[]> {
    return runInInjectionContext(this.injector, () => {
      const activitiesRef = collection(this.firestore, 'activities');
      const q = query(activitiesRef, where('userId', '==', uid));
      return collectionData(q, { idField: 'id' }) as Observable<Activity[]>;
    });
  }

  async saveShoppingActivity(
    userId: string,
    totalEmission: number,
    products: any[],
  ): Promise<Goal[]> {
    const activityRef = collection(this.firestore, 'activities');
    const userRef = doc(this.firestore, `users/${userId}`);
    const earnedXp = products.length * 10;

    const productSnapshots = products.map((p) => ({
      barcode: p.barcode,
      name: p.name,
      emission: p.emission,
      weight: p.weight,
    }));

    await addDoc(activityRef, {
      userId: userId,
      xp: earnedXp,
      emission: totalEmission,
      timestamp: new Date(),
      type: 'shopping',
      details: { products: productSnapshots, date: new Date() },
    });

    await updateDoc(userRef, {
      emission: increment(totalEmission),
      allXP: increment(earnedXp),
    });

    await this.updateMonthlyStats(userId, totalEmission, 'shopping');

    const isMeatless = !products.some(
      (p) => p.category.startsWith('meat_') || p.category === 'fish',
    );

    return await this.processActivityForGoals(userId, {
      type: 'shopping',
      isMeatless: isMeatless,
    });
  }

  async saveTravelActivity(
    userId: string,
    mode: string,
    distanceKm: number,
    durationMin: number,
    emission: number,
    from: string,
    to: string,
  ): Promise<Goal[]> {
    const activityRef = collection(this.firestore, 'activities');
    const userRef = doc(this.firestore, `users/${userId}`);
    const earnedXp = Math.max(5, Math.round(distanceKm));
    const now = new Date();

    const departedAt = new Date(now.getTime() - durationMin * 60 * 1000);

    await addDoc(activityRef, {
      userId,
      xp: earnedXp,
      emission,
      timestamp: now,
      type: 'travel',
      details: {
        mode,
        distance: distanceKm,
        departedAt,
        arrivedAt: now,
        from,
        to,
      },
    });

    await updateDoc(userRef, {
      emission: increment(emission),
      allXP: increment(earnedXp),
    });

    await this.updateMonthlyStats(userId, emission, 'travel');

    return await this.processActivityForGoals(userId, {
      type: 'travel',
      distance: distanceKm,
      mode: mode,
    });
  }

  async saveEnergyActivity(
    userId: string,
    typeEnergy: 'water' | 'gas' | 'electricity',
    amount: number,
    period: 'week' | 'month' | 'year',
    emission: number,
  ): Promise<Goal[]> {
    const activityRef = collection(this.firestore, 'activities');
    const userRef = doc(this.firestore, `users/${userId}`);
    const earnedXp = 10;

    await addDoc(activityRef, {
      userId,
      xp: earnedXp,
      emission,
      timestamp: new Date(),
      type: 'energy',
      details: { typeEnergy, amount, period },
    });

    await updateDoc(userRef, {
      emission: increment(emission),
      allXP: increment(earnedXp),
    });

    const periodDays = period === 'week' ? 7 : period === 'month' ? 30 : 365;
    const dailyEmission = Math.round((emission / periodDays) * 10) / 10;
    await this.updateMonthlyStats(userId, dailyEmission * 30, 'energy');

    return await this.processActivityForGoals(userId, {
      type: 'energy',
    });
  }

  async getCommunityProduct(barcode: string): Promise<any | null> {
    try {
      return await runInInjectionContext(this.injector, async () => {
        const docRef = doc(this.firestore, `community_products/${barcode}`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          return docSnap.data();
        }
        return null;
      });
    } catch (error) {
      console.error('Hiba a közösségi adatbázis lekérdezésekor:', error);
      return null;
    }
  }

  private async updateMonthlyStats(
    userId: string,
    emission: number,
    type: 'travel' | 'shopping' | 'energy',
  ): Promise<void> {
    try {
      const now = new Date();
      const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const statsRef = doc(this.firestore, `users/${userId}/stats/${key}`);
      const day = now.getDate();
      await setDoc(
        statsRef,
        {
          year: now.getFullYear(),
          month: now.getMonth() + 1,
          totalEmission: increment(emission),
          [`byCategory.${type}`]: increment(emission),
          [`dailyEmissions.${day}`]: increment(emission),
          activityCount: increment(1),
        },
        { merge: true },
      );
    } catch {}
  }

  async saveCommunityProducts(products: any[]): Promise<void> {
    try {
      await runInInjectionContext(this.injector, async () => {
        const promises = products.map((product) => {
          if (!product.barcode) return Promise.resolve();

          const productRef = doc(
            this.firestore,
            `community_products/${product.barcode}`,
          );
          return setDoc(
            productRef,
            {
              barcode: product.barcode,
              name: product.name,
              brands: product.brands || '',
              category: product.category || 'other',
              addedAt: new Date(),
            },
            { merge: true },
          );
        });

        await Promise.all(promises);
      });
    } catch (error) {
      console.error('Hiba a közösségi termékek mentésekor:', error);
    }
  }

  getUserGoals(uid: string): Observable<UserGoal[]> {
    return runInInjectionContext(this.injector, () => {
      const goalsRef = collection(this.firestore, 'user_goals');
      const q = query(goalsRef, where('userId', '==', uid));
      return collectionData(q, { idField: 'id' }) as Observable<UserGoal[]>;
    });
  }

  async startNewGoal(userId: string, goalId: string): Promise<void> {
    const goalsRef = collection(this.firestore, 'user_goals');
    await addDoc(goalsRef, {
      userId,
      goalId,
      progress: 0,
      startDate: new Date(),
      status: 'active',
    });
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  async processActivityForGoals(
    userId: string,
    metrics: {
      type: 'travel' | 'shopping' | 'energy';
      distance?: number;
      mode?: string;
      isMeatless?: boolean;
    },
  ): Promise<Goal[]> {
    const goalsRef = collection(this.firestore, 'user_goals');
    const q = query(
      goalsRef,
      where('userId', '==', userId),
      where('status', '==', 'active'),
    );
    const snapshot = await getDocs(q);

    const batch = writeBatch(this.firestore);
    const completedGoals: Goal[] = [];
    const now = new Date();

    snapshot.forEach((docSnap) => {
      const userGoal = docSnap.data() as UserGoal;
      const goalDef = FIXED_GOALS.find((g) => g.id === userGoal.goalId);
      if (!goalDef) return;

      let lastUpdate: Date | null = null;
      if (userGoal.lastUpdatedDate) {
        lastUpdate =
          userGoal.lastUpdatedDate instanceof Date
            ? userGoal.lastUpdatedDate
            : (userGoal.lastUpdatedDate as any).toDate();
      }

      const alreadyUpdatedToday = lastUpdate
        ? this.isSameDay(lastUpdate, now)
        : false;
      let progressIncrement = 0;


      if (
        goalDef.id === 'goal_active_travel' &&
        metrics.type === 'travel' &&
        (metrics.mode === 'walking' || metrics.mode === 'bicycling')
      ) {
        progressIncrement = metrics.distance || 0;
      }

      else if (
        goalDef.id === 'goal_public_transport' &&
        metrics.type === 'travel' &&
        (metrics.mode === 'bus' || metrics.mode === 'train')
      ) {
        if (!alreadyUpdatedToday) progressIncrement = 1;
      }

      else if (goalDef.id === 'goal_consistent') {
        if (!alreadyUpdatedToday) progressIncrement = 1;
      }

      else if (
        goalDef.id === 'goal_meatless_month' &&
        metrics.type === 'shopping' &&
        metrics.isMeatless
      ) {
        if (!alreadyUpdatedToday) progressIncrement = 1;
      }

      if (progressIncrement > 0) {
        const newProgress = userGoal.progress + progressIncrement;
        const goalRef = doc(this.firestore, `user_goals/${docSnap.id}`);

        if (newProgress >= goalDef.targetValue) {
          batch.update(goalRef, {
            progress: goalDef.targetValue,
            status: 'completed',
            completedAt: now,
            lastUpdatedDate: now,
          });

          const userRef = doc(this.firestore, `users/${userId}`);
          batch.update(userRef, { allXP: increment(goalDef.xpReward) });

          completedGoals.push(goalDef);
        } else {
          batch.update(goalRef, {
            progress: increment(progressIncrement),
            lastUpdatedDate: now,
          });
        }
      }
    });

    await batch.commit();
    return completedGoals;
  }
}
