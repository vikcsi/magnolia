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
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { Activity } from '../models/activity.model';

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
  ): Promise<void> {
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
      details: {
        products: productSnapshots,
        date: new Date(),
      },
    });

    await updateDoc(userRef, {
      emission: increment(totalEmission),
      allXP: increment(earnedXp),
    });

    await this.updateMonthlyStats(userId, totalEmission, 'shopping');
  }

  async saveTravelActivity(
    userId: string,
    mode: string,
    distanceKm: number,
    durationMin: number,
    emission: number,
    from: string,
    to: string,
  ): Promise<void> {
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
  }

  async saveEnergyActivity(
    userId: string,
    typeEnergy: 'water' | 'gas' | 'electricity',
    amount: number,
    period: 'week' | 'month' | 'year',
    emission: number,
  ): Promise<void> {
    const activityRef = collection(this.firestore, 'activities');
    const userRef = doc(this.firestore, `users/${userId}`);
    const earnedXp = 10;

    await addDoc(activityRef, {
      userId,
      xp: earnedXp,
      emission,
      timestamp: new Date(),
      type: 'energy',
      details: {
        typeEnergy,
        amount,
        period,
      },
    });

    await updateDoc(userRef, {
      emission: increment(emission),
      allXP: increment(earnedXp),
    });

    const periodDays = period === 'week' ? 7 : period === 'month' ? 30 : 365;
    const dailyEmission = Math.round((emission / periodDays) * 10) / 10;
    await this.updateMonthlyStats(userId, dailyEmission * 30, 'energy');
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
      await setDoc(statsRef, {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        totalEmission: increment(emission),
        [`byCategory.${type}`]: increment(emission),
        [`dailyEmissions.${day}`]: increment(emission),
        activityCount: increment(1),
      }, { merge: true });
    } catch {
      // Nem kritikus – a fő mentés már sikerült
    }
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
}
