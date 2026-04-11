import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  closeOutline,
  checkmarkCircleOutline,
  trophyOutline,
} from 'ionicons/icons';
import { Observable, of } from 'rxjs';
import { switchMap, map, take, catchError } from 'rxjs/operators';
import { DataService } from 'src/app/services/data.service';
import { AuthService } from 'src/app/services/auth.service';
import { FIXED_GOALS } from 'src/app/constants/goals.constant';
import { Goal } from 'src/app/models/goal.model';

interface GoalSelectionDisplay extends Goal {
  isActive: boolean;
  isCompleted: boolean;
  isLocked: boolean;
}

@Component({
  selector: 'app-goal-selector-modal',
  templateUrl: './goal-selector-modal.component.html',
  styleUrls: ['./goal-selector-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonButtons,
    IonIcon,
  ],
})
export class GoalSelectorModalComponent implements OnInit {
  private modalCtrl = inject(ModalController);
  private dataService = inject(DataService);
  private authService = inject(AuthService);

  goalsDisplay$!: Observable<GoalSelectionDisplay[]>;

  constructor() {
    addIcons({ closeOutline, checkmarkCircleOutline, trophyOutline });
  }

  ngOnInit() {
    this.goalsDisplay$ = this.authService.user$.pipe(
      switchMap((firebaseUser) => {
        if (!firebaseUser) return of([]);
        return this.dataService
          .getUserGoals(firebaseUser.uid)
          .pipe(catchError(() => of([])));
      }),
      map((userGoals) => {
        const activeCount = userGoals.filter(
          (ug) => ug.status === 'active',
        ).length;
        const limitReached = activeCount >= 2;

        const mappedGoals = FIXED_GOALS.map((goal) => {
          const userGoal = userGoals.find((ug) => ug.goalId === goal.id);
          const isActive = (() => {
            if (userGoal?.status !== 'active') return false;
            const startDate =
              userGoal.startDate instanceof Date
                ? userGoal.startDate
                : (userGoal.startDate as any)?.toDate?.();
            if (startDate) {
              const deadlineMs =
                startDate.getTime() + goal.durationDays * 24 * 60 * 60 * 1000;
              if (new Date().getTime() > deadlineMs) return false;
            }
            return true;
          })();
          const isCompleted = userGoal?.status === 'completed';
          const isLocked = limitReached && !isActive && !isCompleted;
          return { ...goal, isActive, isCompleted, isLocked };
        });

        return mappedGoals.sort((a, b) => {
          if (a.isActive && !b.isActive) return -1;
          if (!a.isActive && b.isActive) return 1;
          if (a.isCompleted && !b.isCompleted) return 1;
          if (!a.isCompleted && b.isCompleted) return -1;
          return 0;
        });
      }),
    );
  }

  async startGoal(goalId: string) {
    const firebaseUser = await this.authService.user$.pipe(take(1)).toPromise();

    if (firebaseUser) {
      await this.dataService.startNewGoal(firebaseUser.uid, goalId);
      this.close();
    }
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
