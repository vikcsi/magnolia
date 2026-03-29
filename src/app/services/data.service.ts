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
