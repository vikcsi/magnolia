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
  limit,
  and,
  or,
  addDoc,
  updateDoc,
  increment,
  setDoc,
  getDoc,
  getDocs,
  writeBatch,
  deleteDoc,
  serverTimestamp,
} from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { User } from '../models/user.model';
import { Goal, UserGoal } from '../models/goal.model';
import { Activity } from '../models/activity.model';
import { Challenge, UserChallenge } from '../models/challenge.model';
import { Friendship } from '../models/friendship.model';
import { FIXED_GOALS } from '../constants/goals.constant';
import { BadgeDefinition } from '../models/badge.model';
import { BadgeService, BadgeCheckContext } from './badge.service';

export interface ActivitySaveResult {
  completedGoals: Goal[];
  completedChallenges: Challenge[];
  earnedXp: number;
  earnedBadges: BadgeDefinition[];
}

@Injectable({ providedIn: 'root' })
export class DataService {
  private firestore: Firestore = inject(Firestore);
  private injector: Injector = inject(Injector);
  private badgeService = inject(BadgeService);

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

  getUserGoals(uid: string): Observable<UserGoal[]> {
    return runInInjectionContext(this.injector, () => {
      const goalsRef = collection(this.firestore, 'user_goals');
      const q = query(goalsRef, where('userId', '==', uid));
      return collectionData(q, { idField: 'id' }) as Observable<UserGoal[]>;
    });
  }

  getGlobalChallenges(): Observable<Challenge[]> {
    return runInInjectionContext(this.injector, () => {
      const ref = collection(this.firestore, 'global_challenges');
      return collectionData(ref, { idField: 'id' }) as Observable<Challenge[]>;
    });
  }

  getActiveUserChallenges(userId: string): Observable<UserChallenge[]> {
    return runInInjectionContext(this.injector, () => {
      const challengesRef = collection(this.firestore, 'user_challenges');
      const q = query(
        challengesRef,
        where('userId', '==', userId),
        where('status', '==', 'active'),
      );
      return collectionData(q, { idField: 'id' }) as Observable<
        UserChallenge[]
      >;
    });
  }

  getCompletedUserChallenges(userId: string): Observable<UserChallenge[]> {
    return runInInjectionContext(this.injector, () => {
      const challengesRef = collection(this.firestore, 'user_challenges');
      const q = query(
        challengesRef,
        where('userId', '==', userId),
        where('status', '==', 'completed'),
      );
      return collectionData(q, { idField: 'id' }) as Observable<
        UserChallenge[]
      >;
    });
  }

  getPendingRequests(userId: string): Observable<Friendship[]> {
    return runInInjectionContext(this.injector, () => {
      const friendshipsRef = collection(this.firestore, 'friendships');
      const q = query(
        friendshipsRef,
        and(
          or(where('user1', '==', userId), where('user2', '==', userId)),
          where('status', '==', 'pending'),
          where('requesterId', '!=', userId),
        ),
      );
      return collectionData(q, { idField: 'id' }) as Observable<Friendship[]>;
    });
  }

  getAcceptedFriends(userId: string): Observable<Friendship[]> {
    return runInInjectionContext(this.injector, () => {
      const friendshipsRef = collection(this.firestore, 'friendships');
      const q = query(
        friendshipsRef,
        and(
          or(where('user1', '==', userId), where('user2', '==', userId)),
          where('status', '==', 'accepted'),
        ),
      );
      return collectionData(q, { idField: 'id' }) as Observable<Friendship[]>;
    });
  }

  getAllFriendships(userId: string): Observable<Friendship[]> {
    return runInInjectionContext(this.injector, () => {
      const friendshipsRef = collection(this.firestore, 'friendships');
      const q = query(
        friendshipsRef,
        or(where('user1', '==', userId), where('user2', '==', userId)),
      );
      return collectionData(q, { idField: 'id' }) as Observable<Friendship[]>;
    });
  }

  async saveShoppingActivity(
    userId: string,
    totalEmission: number,
    products: any[],
  ): Promise<ActivitySaveResult> {
    const activityRef = collection(this.firestore, 'activities');
    const userRef = doc(this.firestore, `users/${userId}`);

    let earnedXp = 10;
    products.forEach((p) => {
      if (
        ['a', 'b'].includes(p.ecoScore?.toLowerCase()) ||
        p.category === 'fruit' ||
        p.category === 'vegetable'
      ) {
        earnedXp += 5;
      }
    });

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

    const completedGoals = await this.processActivityForGoals(userId, {
      type: 'shopping',
      isMeatless: isMeatless,
    });

    const completedChallenges = await this.processActivityForChallenges(
      userId,
      {
        type: 'shopping',
        isMeatless: isMeatless,
        productCount: products.length,
        totalEmission: totalEmission,
      },
    );

    const earnedBadges = await this.checkBadgesAfterActivity(
      userId,
      'shopping',
      completedGoals,
      completedChallenges,
    );

    return { completedGoals, completedChallenges, earnedXp, earnedBadges };
  }

  async saveTravelActivity(
    userId: string,
    mode: string,
    distanceKm: number,
    durationMin: number,
    emission: number,
    from: string,
    to: string,
  ): Promise<ActivitySaveResult> {
    const activityRef = collection(this.firestore, 'activities');
    const userRef = doc(this.firestore, `users/${userId}`);

    let earnedXp = 5;
    if (mode === 'bicycling' || mode === 'walking') {
      earnedXp += Math.round(distanceKm * 5);
    } else if (mode === 'bus' || mode === 'train') {
      earnedXp += Math.round(distanceKm * 2);
    }
    earnedXp = Math.min(earnedXp, 300);

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

    const completedGoals = await this.processActivityForGoals(userId, {
      type: 'travel',
      distance: distanceKm,
      mode: mode,
    });

    const completedChallenges = await this.processActivityForChallenges(
      userId,
      {
        type: 'travel',
        distance: distanceKm,
        mode: mode,
      },
    );

    const earnedBadges = await this.checkBadgesAfterActivity(
      userId,
      'travel',
      completedGoals,
      completedChallenges,
    );

    return { completedGoals, completedChallenges, earnedXp, earnedBadges };
  }

  async saveEnergyActivity(
    userId: string,
    typeEnergy: 'water' | 'gas' | 'electricity',
    amount: number,
    period: 'month' | 'year',
    emission: number,
    billingDate: Date = new Date(),
  ): Promise<ActivitySaveResult> {
    const activityRef = collection(this.firestore, 'activities');
    const userRef = doc(this.firestore, `users/${userId}`);

    const earnedXp = 25;

    await addDoc(activityRef, {
      userId,
      xp: earnedXp,
      emission,
      timestamp: billingDate,
      type: 'energy',
      details: { typeEnergy, amount, period, billingDate },
    });

    await updateDoc(userRef, {
      emission: increment(emission),
      allXP: increment(earnedXp),
    });

    const periodDays = period === 'month' ? 30 : 365;
    const dailyEmission = Math.round((emission / periodDays) * 10) / 10;

    await this.updateMonthlyStats(
      userId,
      dailyEmission * 30,
      'energy',
      billingDate,
    );

    const completedGoals = await this.processActivityForGoals(userId, {
      type: 'energy',
    });

    const completedChallenges = await this.processActivityForChallenges(
      userId,
      {
        type: 'energy',
      },
    );

    const earnedBadges = await this.checkBadgesAfterActivity(
      userId,
      'energy',
      completedGoals,
      completedChallenges,
    );

    return { completedGoals, completedChallenges, earnedXp, earnedBadges };
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

  private async checkBadgesAfterActivity(
    userId: string,
    activityType: 'travel' | 'shopping' | 'energy',
    completedGoals: Goal[],
    completedChallenges: Challenge[],
  ): Promise<BadgeDefinition[]> {
    const allBadges: BadgeDefinition[] = [];

    const activityBadges = await this.badgeService.checkAndAwardBadges(userId, {
      trigger: 'activity_saved',
      activityType,
    });
    allBadges.push(...activityBadges);

    for (const goal of completedGoals) {
      const badges = await this.badgeService.checkAndAwardBadges(userId, {
        trigger: 'goal_completed',
        completedGoalId: goal.id,
      });
      allBadges.push(...badges);
    }

    for (const challenge of completedChallenges) {
      const badges = await this.badgeService.checkAndAwardBadges(userId, {
        trigger: 'challenge_completed',
      });
      allBadges.push(...badges);
    }

    return allBadges;
  }

  private async updateMonthlyStats(
    userId: string,
    emission: number,
    type: 'travel' | 'shopping' | 'energy',
    targetDate: Date = new Date(),
  ): Promise<void> {
    try {
      const key = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;
      const statsRef = doc(this.firestore, `users/${userId}/stats/${key}`);
      const day = targetDate.getDate();
      await setDoc(
        statsRef,
        {
          year: targetDate.getFullYear(),
          month: targetDate.getMonth() + 1,
          totalEmission: increment(emission),
          [`byCategory.${type}`]: increment(emission),
          [`dailyEmissions.${day}`]: increment(emission),
          activityCount: increment(1),
        },
        { merge: true },
      );
    } catch {}
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

  async joinChallenge(userId: string, challenge: Challenge): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      const challengesRef = collection(this.firestore, 'user_challenges');

      const q = query(
        challengesRef,
        where('userId', '==', userId),
        where('challengeId', '==', challenge.id),
        where('status', '==', 'active'),
      );

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        throw new Error(
          'Ehhez a kihíváshoz már csatlakoztál, és jelenleg is aktív!',
        );
      }

      const now = new Date();
      const expiresMs =
        now.getTime() + challenge.durationDays * 24 * 60 * 60 * 1000;
      const expiresAt = new Date(expiresMs);

      await addDoc(challengesRef, {
        userId,
        challengeId: challenge.id,
        progress: 0,
        joinedAt: now,
        expiresAt: expiresAt,
        status: 'active',
      });
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
      } else if (
        goalDef.id === 'goal_public_transport' &&
        metrics.type === 'travel' &&
        (metrics.mode === 'bus' || metrics.mode === 'train')
      ) {
        if (!alreadyUpdatedToday) progressIncrement = 1;
      } else if (goalDef.id === 'goal_consistent') {
        if (!alreadyUpdatedToday) progressIncrement = 1;
      } else if (
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

  async processActivityForChallenges(
    userId: string,
    metrics: {
      type: 'travel' | 'shopping' | 'energy';
      distance?: number;
      mode?: string;
      isMeatless?: boolean;
      productCount?: number;
      totalEmission?: number;
    },
  ): Promise<Challenge[]> {
    const challengesRef = collection(this.firestore, 'user_challenges');
    const q = query(
      challengesRef,
      where('userId', '==', userId),
      where('status', '==', 'active'),
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return [];

    const globalRef = collection(this.firestore, 'global_challenges');
    const globalSnap = await getDocs(globalRef);
    const globalChallenges = globalSnap.docs.map((d) => d.data() as Challenge);

    const batch = writeBatch(this.firestore);
    const completedChallenges: Challenge[] = [];
    const now = new Date();

    snapshot.forEach((docSnap) => {
      const userChallenge = docSnap.data() as UserChallenge;
      const expiresAt =
        userChallenge.expiresAt instanceof Date
          ? userChallenge.expiresAt
          : (userChallenge.expiresAt as any).toDate();

      if (now > expiresAt) {
        batch.update(docSnap.ref, { status: 'failed' });
        return;
      }

      const challengeDef = globalChallenges.find(
        (c) => c.id === userChallenge.challengeId,
      );
      if (!challengeDef) return;

      let progressIncrement = 0;

      if (
        challengeDef.category === 'travel' ||
        challengeDef.category === 'mixed'
      ) {
        const modeMatch =
          !challengeDef.targetCondition ||
          (metrics.mode && challengeDef.targetCondition.includes(metrics.mode));

        if (metrics.type === 'travel' && modeMatch) {
          if (challengeDef.metric === 'distance')
            progressIncrement = metrics.distance || 0;
          if (challengeDef.metric === 'count') progressIncrement = 1;
        } else if (
          challengeDef.category === 'mixed' &&
          challengeDef.metric === 'count'
        ) {
          progressIncrement = 1;
        }
      }

      if (metrics.type === 'shopping' && challengeDef.category === 'shopping') {
        if (challengeDef.metric === 'meatless_shopping' && metrics.isMeatless) {
          progressIncrement = 1;
        }
        if (
          challengeDef.metric === 'low_carbon_shopping' &&
          metrics.productCount &&
          metrics.productCount >= 5 &&
          metrics.totalEmission !== undefined
        ) {
          const avgEmission = metrics.totalEmission / metrics.productCount;
          if (avgEmission < 1.0) progressIncrement = 1;
        }
      }

      if (progressIncrement > 0) {
        const newProgress = userChallenge.progress + progressIncrement;

        if (newProgress >= challengeDef.targetValue) {
          batch.update(docSnap.ref, {
            progress: challengeDef.targetValue,
            status: 'completed',
          });

          const userRef = doc(this.firestore, `users/${userId}`);
          batch.update(userRef, { allXP: increment(challengeDef.xpReward) });

          completedChallenges.push(challengeDef);
        } else {
          batch.update(docSnap.ref, { progress: newProgress });
        }
      }
    });

    await batch.commit();
    return completedChallenges;
  }

  async createUserProfile(
    uid: string,
    username: string,
    email: string,
    selectedGoalIds: string[],
  ): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      const userRef = doc(this.firestore, `users/${uid}`);
      await setDoc(userRef, {
        id: uid,
        username: username,
        usernameLower: username.toLowerCase(),
        email: email,
        allXP: 0,
        emission: 0,
        badges: [],
      });
      for (const goalId of selectedGoalIds) {
        await this.startNewGoal(uid, goalId);
      }
    });
  }

  private getFriendshipId(uid1: string, uid2: string): string {
    return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
  }

  async sendFriendRequest(
    requesterId: string,
    receiverId: string,
  ): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      const friendshipId = this.getFriendshipId(requesterId, receiverId);
      const friendshipRef = doc(this.firestore, `friendships/${friendshipId}`);

      const existing = await getDoc(friendshipRef);
      if (existing.exists()) {
        throw new Error(
          'Már létezik barátság vagy függőben lévő kérés ezzel a felhasználóval.',
        );
      }

      await setDoc(friendshipRef, {
        user1: requesterId < receiverId ? requesterId : receiverId,
        user2: requesterId < receiverId ? receiverId : requesterId,
        requesterId: requesterId,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
    });
  }

  async acceptFriendRequest(
    currentUserId: string,
    requesterId: string,
  ): Promise<void> {
    const friendshipId = this.getFriendshipId(currentUserId, requesterId);
    const friendshipRef = doc(this.firestore, `friendships/${friendshipId}`);

    await updateDoc(friendshipRef, {
      status: 'accepted',
      updatedAt: serverTimestamp(),
    });
  }

  async removeFriendOrCancelRequest(uid1: string, uid2: string): Promise<void> {
    const friendshipId = this.getFriendshipId(uid1, uid2);
    const friendshipRef = doc(this.firestore, `friendships/${friendshipId}`);
    await deleteDoc(friendshipRef);
  }

  searchUserByEmail(email: string): Observable<User | null> {
    return runInInjectionContext(this.injector, () => {
      const usersRef = collection(this.firestore, 'users');
      const q = query(
        usersRef,
        where('email', '==', email.toLowerCase()),
        limit(1),
      );
      return collectionData(q, { idField: 'id' }).pipe(
        map((users) => (users.length > 0 ? (users[0] as User) : null)),
      );
    });
  }

  searchUsersByUsername(searchTerm: string): Observable<User[]> {
    return runInInjectionContext(this.injector, () => {
      const usersRef = collection(this.firestore, 'users');

      const searchLower = searchTerm.toLowerCase();
      const searchUpper = searchLower + '\uf8ff';

      const q = query(
        usersRef,
        where('usernameLower', '>=', searchLower),
        where('usernameLower', '<=', searchUpper),
        limit(10),
      );

      return collectionData(q, { idField: 'id' }).pipe(
        map((users) => users as User[]),
      );
    });
  }
}
