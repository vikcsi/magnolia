import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationComponent } from 'src/app/components/navigation/navigation.component';
import { addIcons } from 'ionicons';
import {
  settingsOutline,
  star,
  flash,
  ribbon,
  chevronForward,
  people,
  radioButtonOn,
  leaf,
  trophy,
  person,
  playForward,
  chevronForwardOutline,
  timeOutline,
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { StatsService } from 'src/app/services/stats.service';
import { Observable, Subscription, of, map, switchMap, catchError } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { FIXED_GOALS } from 'src/app/constants/goals.constant';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonProgressBar,
  IonFooter,
  IonSkeletonText,
  ModalController,
  ViewWillEnter,
  ViewWillLeave,
  NavController,
} from '@ionic/angular/standalone';
import { GoalSelectorModalComponent } from 'src/app/components/goal-selector-modal/goal-selector-modal.component';
import {
  getCurrentLevel,
  getNextLevel,
  LevelDefinition,
} from 'src/app/constants/leveling.constant';
import { BadgeGalleryModalComponent } from 'src/app/components/badge-gallery-modal/badge-gallery-modal.component';
import { BADGES } from 'src/app/constants/badges.constant';
import { BadgeDefinition } from 'src/app/models/badge.model';
import { firstValueFrom } from 'rxjs';

export interface UserViewData extends User {
  currentLevel: LevelDefinition;
  nextLevel: LevelDefinition | null;
  levelProgress: number;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonProgressBar,
    IonFooter,
    IonSkeletonText,
    NavigationComponent,
    CommonModule,
  ],
})
export class ProfilePage
  implements OnInit, OnDestroy, ViewWillEnter, ViewWillLeave
{
  private dataService = inject(DataService);
  private authService = inject(AuthService);
  private statsService = inject(StatsService);
  private modalCtrl = inject(ModalController);
  private navCtrl = inject(NavController);

  private activitySub?: Subscription;

  userData$!: Observable<UserViewData | null>;
  activeGoalsDisplay$!: Observable<any[]>;
  friendsCount$!: Observable<number>;
  recentBadges: BadgeDefinition[] = [];
  weeklyStreak = 0;

  constructor() {
    addIcons({
      settingsOutline,
      star,
      flash,
      ribbon,
      chevronForward,
      chevronForwardOutline,
      people,
      radioButtonOn,
      leaf,
      trophy,
      person,
      playForward,
      timeOutline,
    });
  }

  ngOnInit() {
    this.initProfileData();
  }

  ionViewWillEnter() {
    this.initProfileData();
    this.subscribeToActivities();
  }

  ionViewWillLeave() {
    this.unsubscribeFromActivities();
  }

  ngOnDestroy() {
    this.unsubscribeFromActivities();
  }

  private subscribeToActivities() {
    this.unsubscribeFromActivities();

    this.activitySub = this.authService.user$
      .pipe(
        switchMap((firebaseUser) => {
          if (!firebaseUser) return of([]);
          return this.dataService
            .getUserActivities(firebaseUser.uid)
            .pipe(catchError(() => of([])));
        }),
      )
      .subscribe((acts) => {
        if (acts.length === 0) {
          this.weeklyStreak = 0;
          return;
        }
        this.weeklyStreak = this.statsService.getWeeklyStreak(acts);
      });
  }

  private unsubscribeFromActivities() {
    this.activitySub?.unsubscribe();
    this.activitySub = undefined;
  }

  async openGoalSelector() {
    const routerOutlet = document.querySelector('ion-router-outlet');
    const modal = await this.modalCtrl.create({
      component: GoalSelectorModalComponent,
      presentingElement: routerOutlet || undefined,
      canDismiss: true,
      cssClass: 'rounded-card-modal',
    });
    await modal.present();
    await modal.onDidDismiss();
  }

  openSettings() {
    this.navCtrl.navigateForward('/settings');
  }

  async openBadgeGallery() {
    const user = await firstValueFrom(this.userData$);
    if (!user) return;

    const routerOutlet = document.querySelector('ion-router-outlet');
    const modal = await this.modalCtrl.create({
      component: BadgeGalleryModalComponent,
      componentProps: {
        earnedBadgeIds: (user.badges || []).map((b) => b.id),
      },
      presentingElement: routerOutlet || undefined,
      canDismiss: true,
      cssClass: 'rounded-card-modal',
    });

    await modal.present();
  }

  private initProfileData() {
    this.userData$ = this.authService.currentUserProfile$.pipe(
      map((user) => {
        if (!user) return null;
        const currentLevel = getCurrentLevel(user.allXP);
        const nextLevel = getNextLevel(user.allXP);
        let levelProgress = 1;
        if (nextLevel) {
          const xpRange = nextLevel.requiredXp - currentLevel.requiredXp;
          const xpGainedInLevel = user.allXP - currentLevel.requiredXp;
          levelProgress = xpGainedInLevel / xpRange;
        }

        const earnedDefs = (user.badges || [])
          .sort((a, b) => {
            const timeA =
              a.earnedAt instanceof Date
                ? a.earnedAt.getTime()
                : (a.earnedAt as any).toDate().getTime();
            const timeB =
              b.earnedAt instanceof Date
                ? b.earnedAt.getTime()
                : (b.earnedAt as any).toDate().getTime();
            return timeB - timeA;
          })
          .slice(0, 4)
          .map((ub) => BADGES.find((b) => b.id === ub.id))
          .filter(Boolean) as BadgeDefinition[];

        this.recentBadges = earnedDefs;

        return { ...user, currentLevel, nextLevel, levelProgress };
      }),
    );

    const currentUid = this.authService.currentUser?.uid;
    if (currentUid) {
      this.friendsCount$ = this.dataService
        .getAcceptedFriends(currentUid)
        .pipe(map((friendships) => friendships.length));
    }

    this.activeGoalsDisplay$ = this.authService.user$.pipe(
      switchMap((firebaseUser) => {
        if (!firebaseUser) return of([]);
        return this.dataService
          .getUserGoals(firebaseUser.uid)
          .pipe(catchError(() => of([])));
      }),
      map((userGoals) => {
        const now = new Date().getTime();
        return userGoals
          .filter((ug) => {
            if (ug.status !== 'active') return false;

            const details = FIXED_GOALS.find((g) => g.id === ug.goalId);
            if (!details) return false;

            const startDate =
              ug.startDate instanceof Date
                ? ug.startDate
                : (ug.startDate as any)?.toDate?.() || new Date(ug.startDate);
            const deadlineMs =
              startDate.getTime() + details.durationDays * 24 * 60 * 60 * 1000;

            return new Date().getTime() <= deadlineMs;
          })
          .map((ug) => {
            const details = FIXED_GOALS.find((g) => g.id === ug.goalId);
            const startDate =
              ug.startDate instanceof Date
                ? ug.startDate
                : (ug.startDate as any)?.toDate?.() || new Date(ug.startDate);
            let remainingDays = 0;
            if (details) {
              const elapsedMs = now - startDate.getTime();
              const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
              remainingDays = Math.max(0, details.durationDays - elapsedDays);
            }
            return {
              userGoal: ug,
              details,
              progressPercent: details ? ug.progress / details.targetValue : 0,
              remainingDays,
            };
          });
      }),
    );
  }
}
