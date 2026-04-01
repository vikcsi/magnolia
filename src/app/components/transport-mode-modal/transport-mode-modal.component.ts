import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonButton,
  IonIcon,
  IonLabel,
  IonSpinner,
  ModalController,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
} from '@ionic/angular/standalone';
import { TransportMode } from 'src/app/services/directions.service';
import { addIcons } from 'ionicons';
import {
  closeOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-transport-mode-modal',
  templateUrl: './transport-mode-modal.component.html',
  styleUrls: ['./transport-mode-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonButton,
    IonIcon,
    IonLabel,
    IonSpinner,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
  ],
})
export class TransportModeModalComponent {
  @Input() elapsedSeconds: number = 0;
  @Input() distanceKm: number = 0;

  private modalCtrl = inject(ModalController);

  selectedMode: TransportMode = 'car';
  isConfirming = false;

  constructor() {
    addIcons({
      closeOutline
    });
  }

  readonly trackingModes: TransportMode[] = [
    'car',
    'motorbike',
    'bus',
    'train',
    'bicycling',
    'walking',
  ];

  readonly modeConfig: Record<TransportMode, { label: string; icon: string }> =
    {
      car: { label: 'Autó', icon: '🚗' },
      motorbike: { label: 'Motor', icon: '🏍️' },
      bus: { label: 'Tömeg-\nközlekedés', icon: '🚌' },
      train: { label: 'Vonat', icon: '🚆' },
      bicycling: { label: 'Bicikli', icon: '🚲' },
      walking: { label: 'Gyalog', icon: '🚶' },
    };

  formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0)
      return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  cancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    this.isConfirming = true;
    setTimeout(() => {
      this.modalCtrl.dismiss({ mode: this.selectedMode }, 'confirm');
    }, 150);
  }
}
