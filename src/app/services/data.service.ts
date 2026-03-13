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

  async saveShoppingActivity(userId: string, totalEmission: number, products: any[]): Promise<void> {
    const activityRef = collection(this.firestore, 'activities');
    const userRef = doc(this.firestore, `users/${userId}`);

    const earnedXp = products.length * 10;

    await addDoc(activityRef, {
      userId: userId,
      xp: earnedXp,
      emission: totalEmission,
      timestamp: new Date(),
      type: 'shopping',
      details: {
        products: products.map(p => p.name),
        date: new Date()
      }
    });

    await updateDoc(userRef, {
      emission: increment(totalEmission),
      allXP: increment(earnedXp)
    });
  }

  async saveCommunityProducts(products: any[]): Promise<void> {
    for (const product of products) {
      const productRef = doc(this.firestore, `community_products/${product.barcode}`);
      await setDoc(productRef, {
        barcode: product.barcode,
        name: product.name,
        brands: product.brands || '',
        category: product.category,
        addedAt: new Date()
      }, { merge: true });
    }
  }
}
