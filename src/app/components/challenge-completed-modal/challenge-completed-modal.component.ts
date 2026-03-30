import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonIcon, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { flameOutline } from 'ionicons/icons';
import { Challenge } from 'src/app/models/challenge.model';

@Component({
  selector: 'app-challenge-completed-modal',
  templateUrl: './challenge-completed-modal.component.html',
  styleUrls: ['./challenge-completed-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonButton, IonIcon],
})
export class ChallengeCompletedModalComponent {
  @Input() challenge!: Challenge;
  private modalCtrl = inject(ModalController);

  constructor() {
    addIcons({ flameOutline });
  }

  close() {
    this.modalCtrl.dismiss();
  }
}