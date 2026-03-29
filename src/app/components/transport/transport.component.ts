import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonIcon,
  IonLabel,
  IonButton,
  IonSpinner,
  IonInput,
  ToastController,
} from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, stopCircleOutline, playCircleOutline, navigateOutline } from 'ionicons/icons';
import { TransportMode } from 'src/app/services/directions.service';
import { CarbonCalculatorService } from 'src/app/services/carbon-calculator.service';
import { DataService } from 'src/app/services/data.service';
import { AuthService } from 'src/app/services/auth.service';
import { TrackingService, TrackingState } from 'src/app/services/tracking.service';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-transport',
  templateUrl: './transport.component.html',
  styleUrls: ['./transport.component.scss'],
  imports: [IonIcon, IonLabel, IonButton, IonSpinner, IonInput, FormsModule],
})
export class TransportComponent implements OnInit, OnDestroy {
  private calcService = inject(CarbonCalculatorService);
  private dataService = inject(DataService);
  private authService = inject(AuthService);
  private toastController = inject(ToastController);
  readonly trackingService = inject(TrackingService);

  activeTab: 'manual' | 'tracking' = 'manual';

  manualMode: TransportMode = 'car';
  manualDistanceKm: number = 1;
  manualEmission: number | null = null;
  isSavingManual = false;

  trackingState: TrackingState = { isTracking: false, distanceKm: 0, elapsedSeconds: 0, stopped: false };
  showModeModal = false;
  selectedTrackingMode: TransportMode = 'car';
  isSavingTrip = false;
  private trackingSub?: Subscription;

  readonly modeConfig: Record<TransportMode, { label: string; icon: string }> = {
    car: { label: 'Autó', icon: '🚗' },
    motorbike: { label: 'Motor', icon: '🏍️' },
    bus: { label: 'Tömeg-\nközlekedés', icon: '🚌' },
    train: { label: 'Vonat', icon: '🚆' },
    bicycling: { label: 'Bicikli', icon: '🚲' },
    walking: { label: 'Gyalog', icon: '🚶' },
  };

  readonly manualModes: TransportMode[] = ['car', 'motorbike', 'bus', 'bicycling', 'walking'];
  readonly trackingModes: TransportMode[] = ['car', 'motorbike', 'bus', 'train', 'bicycling', 'walking'];

  constructor() {
    addIcons({ checkmarkCircleOutline, stopCircleOutline, playCircleOutline, navigateOutline });
  }

  ngOnInit(): void {
    this.trackingSub = this.trackingService.state$.subscribe((state) => {
      const wasStopped = this.trackingState.stopped;
      this.trackingState = state;
      if (!wasStopped && state.stopped) {
        this.showModeModal = true;
      }
    });
  }

  ngOnDestroy(): void {
    this.trackingSub?.unsubscribe();
  }

  setTab(tab: 'manual' | 'tracking'): void {
    this.activeTab = tab;
    this.manualEmission = null;
  }

  calculateManual(): void {
    if (this.manualDistanceKm > 0) {
      this.manualEmission = this.calcService.calculateTravelEmission(this.manualDistanceKm, this.manualMode);
    }
  }

  async saveManual(): Promise<void> {
    const user = this.authService.currentUser;
    if (!user || this.manualEmission === null || this.manualDistanceKm <= 0) return;

    this.isSavingManual = true;
    try {
      await this.dataService.saveTravelActivity(
        user.uid, this.manualMode, this.manualDistanceKm, 0, this.manualEmission, '', '',
      );

      const toast = await this.toastController.create({
        message: `Utazás rögzítve! +${this.manualEmission} kg CO₂ adódott a lábnyomodhoz.`,
        duration: 3000,
        color: 'success',
        icon: 'checkmark-circle-outline',
        position: 'top',
      });
      await toast.present();

      this.manualDistanceKm = 1;
      this.manualEmission = null;
    } catch {
      const toast = await this.toastController.create({
        message: 'Hiba történt a mentés során.',
        duration: 3000,
        color: 'danger',
        position: 'top',
      });
      await toast.present();
    } finally {
      this.isSavingManual = false;
    }
  }

  get isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  async startTracking(): Promise<void> {
    await this.trackingService.start();
  }

  async stopTrackingManually(): Promise<void> {
    await this.trackingService.stop();
    this.showModeModal = true;
  }

  async saveTrip(): Promise<void> {
    this.isSavingTrip = true;
    try {
      await this.trackingService.saveTrip(this.selectedTrackingMode);
      this.showModeModal = false;

      const toast = await this.toastController.create({
        message: 'Utazás rögzítve!',
        duration: 3000,
        color: 'success',
        icon: 'checkmark-circle-outline',
        position: 'top',
      });
      await toast.present();
    } catch {
      const toast = await this.toastController.create({
        message: 'Hiba történt a mentés során.',
        duration: 3000,
        color: 'danger',
        position: 'top',
      });
      await toast.present();
    } finally {
      this.isSavingTrip = false;
    }
  }

  discardTrip(): void {
    this.trackingService.discardTrip();
    this.showModeModal = false;
  }

  formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
}
