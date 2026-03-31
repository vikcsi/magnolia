import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonIcon,
  IonProgressBar,
  IonSpinner,
  ToastController,
} from '@ionic/angular/standalone';
import {
  Observable,
  of,
  map,
  combineLatest,
  switchMap,
  catchError,
  take,
} from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { AuthService } from 'src/app/services/auth.service';
import { UserChallenge, Challenge } from 'src/app/models/challenge.model';
import { addIcons } from 'ionicons';
import {
  flame,
  radioButtonOn,
  bicycle,
  walk,
  bus,
  leaf,
  cart,
  restaurant,
  timeOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
} from 'ionicons/icons';

export interface ActiveChallengeDisplay {
  userChallenge: UserChallenge;
  details: Challenge;
  progressPercent: number;
  timeRemainingText: string;
  isExpiringSoon: boolean;
}

@Component({
  selector: 'app-challenges',
  templateUrl: './challenges.component.html',
  styleUrls: ['./challenges.component.scss'],
  standalone: true,
  imports: [IonIcon, IonProgressBar, IonSpinner, CommonModule],
})
export class ChallengesComponent implements OnInit {
  private dataService = inject(DataService);
  private authService = inject(AuthService);
  private toastController = inject(ToastController);

  activeChallenges$!: Observable<ActiveChallengeDisplay[]>;
  availableChallenges$!: Observable<Challenge[]>;
  completedThisRotation$!: Observable<Challenge[]>;
  globalChallenges$!: Observable<Challenge[]>;
  isJoining: Record<string, boolean> = {};

  constructor() {
    addIcons({
      flame,
      radioButtonOn,
      bicycle,
      walk,
      bus,
      leaf,
      cart,
      restaurant,
      timeOutline,
      checkmarkCircleOutline,
      alertCircleOutline,
    });
  }

  ngOnInit() {
    this.globalChallenges$ = this.dataService
      .getGlobalChallenges()
      .pipe(catchError(() => of([])));

    const userActiveChallenges$ = this.authService.user$.pipe(
      switchMap((user) => {
        if (!user) return of([]);
        return this.dataService
          .getActiveUserChallenges(user.uid)
          .pipe(catchError(() => of([])));
      }),
    );

    this.activeChallenges$ = combineLatest([
      userActiveChallenges$,
      this.globalChallenges$,
    ]).pipe(
      map(([userChallenges, globalChallenges]) => {
        const now = new Date().getTime();
        return userChallenges
          .map((uc) => {
            const details = globalChallenges.find(
              (c) => c.id === uc.challengeId,
            );
            const exp =
              uc.expiresAt instanceof Date
                ? uc.expiresAt.getTime()
                : (uc.expiresAt as any).toDate().getTime();
            const diffMs = exp - now;
            let timeText = 'Lejárt';
            let expiringSoon = true;
            if (diffMs > 0) {
              const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
              const hours = Math.floor(
                (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
              );
              if (days > 0) {
                timeText = `${days} nap maradt`;
                expiringSoon = days <= 1;
              } else {
                timeText = `${hours} óra maradt`;
                expiringSoon = true;
              }
            }
            return {
              userChallenge: uc,
              details: details!,
              progressPercent: details
                ? Math.min(1, uc.progress / details.targetValue)
                : 0,
              timeRemainingText: timeText,
              isExpiringSoon: expiringSoon,
            };
          })
          .filter((item) => item.details !== undefined);
      }),
    );

    const completedChallenges$ = this.authService.user$.pipe(
      switchMap((user) => {
        if (!user) return of([]);
        return this.dataService
          .getCompletedUserChallenges(user.uid)
          .pipe(catchError(() => of([])));
      }),
    );

    this.completedThisRotation$ = combineLatest([
      completedChallenges$,
      this.globalChallenges$,
    ]).pipe(
      map(([completed, globals]) => {
        const now = new Date();
        const weeklyIds = this.getWeeklyChallenges(globals, 3).map((c) => c.id);
        return completed
          .filter((uc) => {
            const exp =
              uc.expiresAt instanceof Date
                ? uc.expiresAt
                : (uc.expiresAt as any).toDate();
            return exp > now && weeklyIds.includes(uc.challengeId);
          })
          .map((uc) => globals.find((c) => c.id === uc.challengeId)!)
          .filter(Boolean);
      }),
    );

    this.availableChallenges$ = combineLatest([
      this.activeChallenges$,
      this.completedThisRotation$,
      this.globalChallenges$,
    ]).pipe(
      map(([active, completedThisRotation, globals]) => {
        const activeIds = active.map((a) => a.details.id);
        const completedIds = completedThisRotation.map((c) => c.id);
        const weeklyOffer = this.getWeeklyChallenges(globals, 3);
        return weeklyOffer.filter(
          (c) => !activeIds.includes(c.id) && !completedIds.includes(c.id),
        );
      }),
    );
  }

  private getWeeklyChallenges(
    challenges: Challenge[],
    count: number = 3,
  ): Challenge[] {
    if (!challenges || challenges.length === 0) return [];
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor(
      (now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000),
    );
    const weekNumber = Math.ceil((now.getDay() + 1 + days) / 7);
    const startIndex = (weekNumber * count) % challenges.length;
    const selected = [];
    for (let i = 0; i < count; i++) {
      selected.push(challenges[(startIndex + i) % challenges.length]);
    }
    return selected;
  }

  async joinChallenge(challenge: Challenge) {
    const user = await this.authService.user$.pipe(take(1)).toPromise();
    if (!user) return;

    this.isJoining[challenge.id] = true;
    try {
      await this.dataService.joinChallenge(user.uid, challenge);
      const toast = await this.toastController.create({
        message: `Sikeresen csatlakoztál: ${challenge.name}`,
        duration: 2500,
        color: 'success',
        icon: 'checkmark-circle-outline',
        position: 'top',
      });
      await toast.present();
    } catch (error: any) {
      const toast = await this.toastController.create({
        message: error.message || 'Hiba történt a csatlakozás során.',
        duration: 3000,
        color: 'danger',
        position: 'top',
      });
      await toast.present();
    } finally {
      this.isJoining[challenge.id] = false;
    }
  }
}
