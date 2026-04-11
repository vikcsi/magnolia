import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { switchMap, tap, map, catchError } from 'rxjs/operators';
import { User } from 'src/app/models/user.model';
import { Activity, Travel, Energy } from 'src/app/models/activity.model';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import {
  StatsService,
  MagnoliaState,
  InsightCard,
} from 'src/app/services/stats.service';
import { NavigationComponent } from 'src/app/components/navigation/navigation.component';
import { addIcons } from 'ionicons';
import {
  trendingUpOutline,
  starOutline,
  paperPlaneOutline,
  eyeOutline,
  cameraOutline,
  busOutline,
  cartOutline,
  listOutline,
  flashOutline,
  addOutline,
  flameOutline,
  leafOutline,
  warningOutline,
  carOutline,
  bicycleOutline,
  walkOutline,
  trainOutline,
  waterOutline,
  speedometerOutline,
} from 'ionicons/icons';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonIcon,
  IonContent,
  IonCard,
  IonCardContent,
  IonProgressBar,
  IonLabel,
  IonList,
  IonItem,
  IonFooter,
  IonSkeletonText,
  ViewWillEnter,
  ViewWillLeave,
} from '@ionic/angular/standalone';
import { FirestoreDatePipe } from 'src/app/pipes/firestore-date.pipe';
import { Observable, of } from 'rxjs';
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
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonIcon,
    IonContent,
    IonCard,
    IonCardContent,
    IonProgressBar,
    IonLabel,
    IonList,
    IonItem,
    IonFooter,
    IonSkeletonText,
    NavigationComponent,
    CommonModule,
    FirestoreDatePipe,
    RouterLink,
  ],
})
export class HomePage
  implements OnInit, OnDestroy, ViewWillEnter, ViewWillLeave
{
  private authService = inject(AuthService);
  private dataService = inject(DataService);
  private statsService = inject(StatsService);

  private activitiesSub?: Subscription;

  userData$!: Observable<UserViewData | null>;
  recentActivities: Activity[] = [];
  todayEmission = 0;
  weeklyStreak = 0;
  magnoliaState: MagnoliaState = 'bloom';
  insight: InsightCard = {
    type: 'success',
    text: 'Rögzítsd az első mai tevékenységedet!',
  };
  readonly DAILY_LIMIT = this.statsService.DAILY_LIMIT_KG;

  constructor() {
    addIcons({
      trendingUpOutline,
      starOutline,
      paperPlaneOutline,
      eyeOutline,
      cameraOutline,
      busOutline,
      cartOutline,
      flashOutline,
      addOutline,
      listOutline,
      flameOutline,
      leafOutline,
      warningOutline,
      carOutline,
      bicycleOutline,
      walkOutline,
      trainOutline,
      waterOutline,
      speedometerOutline,
    });
  }

  ngOnInit() {
    this.initUserData();
  }

  ionViewWillEnter() {
    this.initUserData();
    this.subscribeToActivities();
  }

  ionViewWillLeave() {
    this.unsubscribeFromActivities();
  }

  ngOnDestroy() {
    this.unsubscribeFromActivities();
  }

  private initUserData() {
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
        return { ...user, currentLevel, nextLevel, levelProgress };
      }),
    );
  }

  private subscribeToActivities() {
    this.unsubscribeFromActivities();

    this.activitiesSub = this.authService.user$
      .pipe(
        switchMap((firebaseUser) => {
          if (!firebaseUser) {
            return of([]);
          }
          return this.dataService
            .getUserActivities(firebaseUser.uid)
            .pipe(catchError(() => of([])));
        }),
      )
      .subscribe((acts) => {
        if (acts.length === 0) {
          this.recentActivities = [];
          this.todayEmission = 0;
          this.weeklyStreak = 0;
          this.magnoliaState = 'bloom';
          this.insight = {
            type: 'success',
            text: 'Rögzítsd az első mai tevékenységedet!',
          };
          return;
        }

        const sorted = [...acts].sort((a, b) => {
          const ta =
            a.timestamp instanceof Date
              ? a.timestamp.getTime()
              : ((a.timestamp as any)?.toMillis?.() ?? 0);
          const tb =
            b.timestamp instanceof Date
              ? b.timestamp.getTime()
              : ((b.timestamp as any)?.toMillis?.() ?? 0);
          return tb - ta;
        });

        this.recentActivities = sorted.slice(0, 5);
        this.todayEmission = this.statsService.computeTodayEmission(acts);
        this.weeklyStreak = this.statsService.getWeeklyStreak(acts);
        this.magnoliaState = this.statsService.getTodayMagnoliaState(
          this.todayEmission,
        );
        this.insight = this.statsService.getTodayInsight(
          acts,
          this.weeklyStreak,
        );
      });
  }

  private unsubscribeFromActivities() {
    this.activitiesSub?.unsubscribe();
    this.activitiesSub = undefined;
  }

  getDailyProgressValue(): number {
    return Math.min(1, this.todayEmission / this.DAILY_LIMIT);
  }

  getActivityIcon(activity: Activity): string {
    if (activity.type === 'travel') {
      const icons: Record<string, string> = {
        car: 'car-outline',
        motorbike: 'speedometer-outline',
        bus: 'bus-outline',
        train: 'train-outline',
        bicycling: 'bicycle-outline',
        walking: 'walk-outline',
      };
      return icons[(activity.details as Travel).mode] ?? 'bus-outline';
    }
    if (activity.type === 'energy') {
      const icons: Record<string, string> = {
        electricity: 'flash-outline',
        gas: 'flame-outline',
        water: 'water-outline',
      };
      return icons[(activity.details as Energy).typeEnergy] ?? 'flash-outline';
    }
    return 'cart-outline';
  }

  getActivityLabel(activity: Activity): string {
    if (activity.type === 'travel') {
      const labels: Record<string, string> = {
        car: 'Autó',
        motorbike: 'Motor',
        bus: 'Tömegközlekedés',
        train: 'Vonat',
        bicycling: 'Bicikli',
        walking: 'Gyalog',
      };
      return labels[(activity.details as Travel).mode] ?? 'Utazás';
    }
    if (activity.type === 'energy') {
      const labels: Record<string, string> = {
        electricity: 'Villanyáram',
        gas: 'Gáz',
        water: 'Víz',
      };
      return labels[(activity.details as Energy).typeEnergy] ?? 'Energia';
    }
    return 'Bevásárlás';
  }
}
