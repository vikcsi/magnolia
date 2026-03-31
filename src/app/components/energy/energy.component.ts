import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonIcon,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonButton,
  ToastController,
  ModalController,
  IonDatetime, 
  IonDatetimeButton, 
  IonModal
} from '@ionic/angular/standalone';
import { Subscription, firstValueFrom } from 'rxjs';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline } from 'ionicons/icons';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { getCurrentLevel, LevelDefinition } from 'src/app/constants/leveling.constant';
import { LevelUpModalComponent } from 'src/app/components/level-up-modal/level-up-modal.component';
import { GoalCompletedModalComponent } from 'src/app/components/goal-completed-modal/goal-completed-modal.component';
import { ChallengeCompletedModalComponent } from 'src/app/components/challenge-completed-modal/challenge-completed-modal.component';
import { Activity, Energy } from 'src/app/models/activity.model';

@Component({
  selector: 'app-energy',
  templateUrl: './energy.component.html',
  styleUrls: ['./energy.component.scss'],
  imports: [
    IonIcon,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonInput,
    IonButton,
    CommonModule,
    FormsModule,
    IonDatetime,
    IonDatetimeButton,
    IonModal
  ],
})
export class EnergyComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private dataService = inject(DataService);
  private toastController = inject(ToastController);
  private modalCtrl = inject(ModalController);

  typeEnergy: 'electricity' | 'gas' | 'water' = 'electricity';
  amount: number = 0;
  period: 'month' | 'year' = 'month';

  calculatedEmission: number | null = null;
  isSaving = false;
  recentEnergyActivities: Activity[] = [];

  selectedDate: string = new Date().toISOString();
  maxDate: string = new Date().toISOString();

  private sub?: Subscription;

  private readonly EMISSION_FACTORS: Record<string, number> = {
    electricity: 0.233,
    gas: 2.0,
    water: 0.149,
  };

  readonly unitLabels: Record<string, string> = {
    electricity: 'kWh',
    gas: 'm³',
    water: 'm³',
  };

  readonly typeLabels: Record<string, string> = {
    electricity: 'Villany',
    gas: 'Gáz',
    water: 'Víz',
  };

  readonly periodLabels: Record<string, string> = {
    month: 'Ez a hónap',
    year: 'Ez az év',
  };

  constructor() {
    addIcons({ checkmarkCircleOutline });
  }

  ngOnInit(): void {
    const user = this.authService.currentUser;
    if (user) {
      this.sub = this.dataService
        .getUserActivities(user.uid)
        .subscribe((acts) => {
          this.recentEnergyActivities = acts
            .filter((a) => a.type === 'energy')
            .sort((a, b) => {
              const ta =
                a.timestamp instanceof Date
                  ? a.timestamp.getTime()
                  : ((a.timestamp as any)?.toMillis?.() ?? 0);
              const tb =
                b.timestamp instanceof Date
                  ? b.timestamp.getTime()
                  : ((b.timestamp as any)?.toMillis?.() ?? 0);
              return tb - ta;
            })
            .slice(0, 2);
        });
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get unit(): string {
    return this.unitLabels[this.typeEnergy];
  }

  onTypeChange(): void {
    this.calculatedEmission = null;
  }

  calculateEmission(): void {
    if (this.amount > 0) {
      const factor = this.EMISSION_FACTORS[this.typeEnergy];
      this.calculatedEmission = Math.round(this.amount * factor * 10) / 10;
    }
  }

  async save(): Promise<void> {
    const user = this.authService.currentUser;
    if (!user || this.amount <= 0) return;

    this.calculateEmission();
    if (this.calculatedEmission === null) return;

    this.isSaving = true;

    try {
      const userProfile = await firstValueFrom(this.authService.currentUserProfile$);
      const xpBefore = userProfile?.allXP ?? 0;
      const oldLevel = getCurrentLevel(xpBefore);
      const billingDate = new Date(this.selectedDate);

      const { completedGoals, completedChallenges, earnedXp } = await this.dataService.saveEnergyActivity(
        user.uid,
        this.typeEnergy,
        this.amount,
        this.period,
        this.calculatedEmission,
        billingDate
      );

      const toast = await this.toastController.create({
        message: `Fogyasztás rögzítve! +${this.calculatedEmission} kg CO₂, +${earnedXp} XP szerzett.`,
        duration: 3000,
        color: 'success',
        icon: 'checkmark-circle-outline',
        position: 'top',
      });
      await toast.present();

      if (completedGoals && completedGoals.length > 0) {
        for (const goal of completedGoals) {
          const modal = await this.modalCtrl.create({
            component: GoalCompletedModalComponent,
            componentProps: { goal },
            cssClass: 'celebration-modal',
            backdropDismiss: true,
          });
          await modal.present();
          await modal.onDidDismiss();
        }
      }

      if (completedChallenges && completedChallenges.length > 0) {
        for (const challenge of completedChallenges) {
          const modal = await this.modalCtrl.create({
            component: ChallengeCompletedModalComponent,
            componentProps: { challenge },
            cssClass: 'celebration-modal',
            backdropDismiss: true,
          });
          await modal.present();
          await modal.onDidDismiss();
        }
      }

      const newLevel = getCurrentLevel(xpBefore + earnedXp);
      if (newLevel.level > oldLevel.level) {
        await this.showLevelUpModal(oldLevel, newLevel, earnedXp);
      }

      this.amount = 0;
      this.calculatedEmission = null;
    } catch {
      const toast = await this.toastController.create({
        message: 'Hiba történt a mentés során.',
        duration: 3000,
        color: 'danger',
        position: 'top',
      });
      await toast.present();
    } finally {
      this.isSaving = false;
    }
  }

  private async showLevelUpModal(
    oldLevel: LevelDefinition,
    newLevel: LevelDefinition,
    earnedXp: number,
  ): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: LevelUpModalComponent,
      componentProps: { oldLevel, newLevel, earnedXp },
      cssClass: 'celebration-modal',
      backdropDismiss: true,
    });
    await modal.present();
    await modal.onDidDismiss();
  }

  getDetails(activity: Activity): Energy {
    return activity.details as Energy;
  }

  formatBillingDate(energy: Energy): string {
    const raw = energy.billingDate;
    if (!raw) return '';
    const d = raw instanceof Date ? raw : new Date((raw as any).seconds * 1000);
    if (energy.period === 'year') {
      return d.getFullYear().toString();
    }
    return d.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long' });
  }
}
