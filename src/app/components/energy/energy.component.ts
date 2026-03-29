import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonIcon, IonLabel, IonSelect, IonSelectOption,
  IonInput, IonButton, ToastController,
} from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline } from 'ionicons/icons';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { Activity, Energy } from 'src/app/models/activity.model';

@Component({
  selector: 'app-energy',
  templateUrl: './energy.component.html',
  styleUrls: ['./energy.component.scss'],
  imports: [
    IonIcon, IonLabel, IonSelect, IonSelectOption,
    IonInput, IonButton,
    CommonModule, FormsModule,
  ],
})
export class EnergyComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private dataService = inject(DataService);
  private toastController = inject(ToastController);

  typeEnergy: 'electricity' | 'gas' | 'water' = 'electricity';
  amount: number = 0;
  period: 'week' | 'month' | 'year' = 'month';

  calculatedEmission: number | null = null;
  isSaving = false;
  recentEnergyActivities: Activity[] = [];

  private sub?: Subscription;

  private readonly EMISSION_FACTORS: Record<string, number> = {
    electricity: 0.233,  // kg CO₂/kWh (EU átlag)
    gas: 2.0,            // kg CO₂/m³ (földgáz)
    water: 0.149,        // kg CO₂/m³ (vízellátás + kezelés)
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
    week: 'Ez a hét',
    month: 'Ez a hónap',
    year: 'Ez az év',
  };

  constructor() {
    addIcons({ checkmarkCircleOutline });
  }

  ngOnInit(): void {
    const user = this.authService.currentUser;
    if (user) {
      this.sub = this.dataService.getUserActivities(user.uid).subscribe(acts => {
        this.recentEnergyActivities = acts
          .filter(a => a.type === 'energy')
          .sort((a, b) => {
            const ta = a.timestamp instanceof Date ? a.timestamp.getTime()
                        : (a.timestamp as any)?.toMillis?.() ?? 0;
            const tb = b.timestamp instanceof Date ? b.timestamp.getTime()
                        : (b.timestamp as any)?.toMillis?.() ?? 0;
            return tb - ta;
          })
          .slice(0, 5);
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
      await this.dataService.saveEnergyActivity(
        user.uid,
        this.typeEnergy,
        this.amount,
        this.period,
        this.calculatedEmission,
      );

      const toast = await this.toastController.create({
        message: `Fogyasztás rögzítve! +${this.calculatedEmission} kg CO₂ adódott a lábnyomodhoz.`,
        duration: 3000,
        color: 'success',
        icon: 'checkmark-circle-outline',
        position: 'top',
      });
      await toast.present();

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

  getDetails(activity: Activity): Energy {
    return activity.details as Energy;
  }
}
