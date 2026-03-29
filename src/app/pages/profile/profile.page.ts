import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { Observable, combineLatest, map } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { FIXED_GOALS } from 'src/app/constants/goals.constant';
import { UserGoal, Goal } from 'src/app/models/goal.model';
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
    FormsModule,
  ],
})
export class ProfilePage implements OnInit {
  private dataService = inject(DataService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private modalCtrl = inject(ModalController);

  userData$!: Observable<User | null>;
  activeGoalsDisplay$!: Observable<any[]>;

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
      timeOutline
    });
  }

  ngOnInit() {
    this.userData$ = this.authService.currentUserProfile$;

    const user = this.authService.currentUser;
    if (user) {
      this.loadActiveGoals(user.uid);
    }
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
      cssClass: 'rounded-card-modal'
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
