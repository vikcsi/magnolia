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
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { StatsService } from 'src/app/services/stats.service';
import { Observable, Subscription, map } from 'rxjs';
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
  ModalController,
} from '@ionic/angular/standalone';
import { GoalSelectorModalComponent } from 'src/app/components/goal-selector-modal/goal-selector-modal.component';
import {
  getCurrentLevel,
  getNextLevel,
  LevelDefinition,
} from 'src/app/constants/leveling.constant';

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
    NavigationComponent,
    CommonModule,
  ],
})
export class ProfilePage implements OnInit, OnDestroy {
  private dataService = inject(DataService);
  private authService = inject(AuthService);
  private statsService = inject(StatsService);
  private router = inject(Router);
  private modalCtrl = inject(ModalController);

  private activitySub?: Subscription;

  userData$!: Observable<UserViewData | null>;
  activeGoalsDisplay$!: Observable<any[]>;
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

        return {
          ...user,
          currentLevel,
          nextLevel,
          levelProgress,
        };
      }),
    );

    const user = this.authService.currentUser;
    if (user) {
      this.loadActiveGoals(user.uid);
      this.activitySub = this.dataService
        .getUserActivities(user.uid)
        .subscribe((acts) => {
          this.weeklyStreak = this.statsService.getWeeklyStreak(acts);
        });
    }
  }

  ngOnDestroy() {
    this.activitySub?.unsubscribe();
  }

  private loadActiveGoals(uid: string) {
    this.activeGoalsDisplay$ = this.dataService.getUserGoals(uid).pipe(
      map((userGoals) => {
        const now = new Date().getTime();

        return userGoals
          .filter((ug) => ug.status === 'active')
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
              details: details,
              progressPercent: details ? ug.progress / details.targetValue : 0,
              remainingDays: remainingDays,
            };
          });
      }),
    );
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

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
