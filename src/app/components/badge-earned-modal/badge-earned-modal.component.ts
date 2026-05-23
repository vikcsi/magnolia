import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton } from '@ionic/angular/standalone';
import { ModalController } from '@ionic/angular/standalone';
import { BadgeDefinition } from 'src/app/models/badge.model';
import { BadgeIconComponent } from 'src/app/components/badge-icon/badge-icon.component';

@Component({
  selector: 'app-badge-earned-modal',
  templateUrl: './badge-earned-modal.component.html',
  styleUrls: ['./badge-earned-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonButton, BadgeIconComponent],
})
export class BadgeEarnedModalComponent {
  @Input() badge!: BadgeDefinition;

  private modalCtrl = inject(ModalController);

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
