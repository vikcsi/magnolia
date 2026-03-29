import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { Activity } from 'src/app/models/activity.model';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { StatsService, MagnoliaState, InsightCard } from 'src/app/services/stats.service';
import { NavigationComponent } from 'src/app/components/navigation/navigation.component';
import { addIcons } from 'ionicons';
import {
  notificationsOutline,
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
} from 'ionicons/icons';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
  IonContent, IonCard, IonCardContent, IonProgressBar,
  IonLabel, IonList, IonItem, IonFooter,
} from '@ionic/angular/standalone';
import { FirestoreDatePipe } from 'src/app/pipes/firestore-date.pipe';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
    IonContent, IonCard, IonCardContent, IonProgressBar,
    IonLabel, IonList, IonItem, IonFooter,
    NavigationComponent, CommonModule, FormsModule, FirestoreDatePipe, RouterLink,
  ],
})
export class HomePage implements OnInit, OnDestroy {
  private authService  = inject(AuthService);
  private dataService  = inject(DataService);
  private statsService = inject(StatsService);

  private sub?: Subscription;

  userData$!: Observable<User | null>;
  recentActivities: Activity[] = [];

  todayEmission  = 0;
  weeklyStreak   = 0;
  magnoliaState: MagnoliaState = 'bloom';
  insight: InsightCard = { type: 'success', text: 'Rögzítsd az első mai tevékenységedet!' };

  readonly DAILY_LIMIT = this.statsService.DAILY_LIMIT_KG;

  constructor() {
    addIcons({
      notificationsOutline, trendingUpOutline, starOutline,
      paperPlaneOutline, eyeOutline, cameraOutline, busOutline,
      cartOutline, flashOutline, addOutline, listOutline,
      flameOutline, leafOutline, warningOutline,
    });
  }

  ngOnInit() {
    this.userData$ = this.authService.currentUserProfile$;

    const firebaseUser = this.authService.currentUser;
    if (firebaseUser) {
      this.sub = this.dataService.getUserActivities(firebaseUser.uid).subscribe(acts => {
        const sorted = [...acts].sort((a, b) => {
          const ta = a.timestamp instanceof Date ? a.timestamp.getTime()
                      : (a.timestamp as any)?.toMillis?.() ?? 0;
          const tb = b.timestamp instanceof Date ? b.timestamp.getTime()
                      : (b.timestamp as any)?.toMillis?.() ?? 0;
          return tb - ta;
        });

        this.recentActivities = sorted.slice(0, 5);
        this.todayEmission    = this.statsService.computeTodayEmission(acts);
        this.weeklyStreak     = this.statsService.getWeeklyStreak(acts);
        this.magnoliaState    = this.statsService.getTodayMagnoliaState(this.todayEmission);
        this.insight          = this.statsService.getTodayInsight(acts, this.weeklyStreak);
      });
    }
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  getDailyProgressValue(): number {
    return Math.min(1, this.todayEmission / this.DAILY_LIMIT);
  }
}
