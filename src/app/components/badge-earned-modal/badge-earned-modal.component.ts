import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { ModalController } from '@ionic/angular/standalone';
import { BadgeDefinition } from 'src/app/models/badge.model';
import { addIcons } from 'ionicons';
import { ribbonOutline } from 'ionicons/icons';

@Component({
  selector: 'app-badge-earned-modal',
  templateUrl: './badge-earned-modal.component.html',
  styleUrls: ['./badge-earned-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonButton, IonIcon],
})
export class BadgeEarnedModalComponent {
  @Input() badge!: BadgeDefinition;

  private modalCtrl = inject(ModalController);

  constructor() {
    addIcons({ ribbonOutline });
  }

  get rarityLabel(): string {
    const labels: Record<string, string> = {
      common: 'Általános',
      rare: 'Ritka',
      epic: 'Epikus',
      legendary: 'Legendás',
    };
    return labels[this.badge.rarity] || '';
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
