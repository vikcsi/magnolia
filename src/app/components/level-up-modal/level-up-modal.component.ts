import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonIcon, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { starOutline, leafOutline, arrowForwardOutline } from 'ionicons/icons';
import {
  LevelDefinition,
} from 'src/app/constants/leveling.constant';

@Component({
  selector: 'app-level-up-modal',
  templateUrl: './level-up-modal.component.html',
  styleUrls: ['./level-up-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonButton, IonIcon],
})
export class LevelUpModalComponent {
  @Input() newLevel!: LevelDefinition;
  @Input() oldLevel!: LevelDefinition;
  @Input() earnedXp: number = 0;

  private modalCtrl = inject(ModalController);

  constructor() {
    addIcons({ starOutline, leafOutline, arrowForwardOutline });
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
