import { Component, Input, OnInit, inject } from '@angular/core';
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
import {
  closeOutline,
  lockClosed,
  leaf,
  rocket,
  bagHandle,
  flash,
  car,
  train,
  bus,
  walk,
  bicycle,
  airplane,
  shirt,
  book,
  construct,
  nutrition,
  barbell,
  bulb,
  flame,
  checkmarkCircle,
  trophy,
  medal,
  star,
  flameSharp,
} from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { BADGES } from 'src/app/constants/badges.constant';
import { BadgeDefinition } from 'src/app/models/badge.model';

interface BadgeCategoryGroup {
  category: string;
  title: string;
  badges: (BadgeDefinition & { isEarned: boolean })[];
}

@Component({
  selector: 'app-badge-gallery-modal',
  templateUrl: './badge-gallery-modal.component.html',
  styleUrls: ['./badge-gallery-modal.component.scss'],
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
export class BadgeGalleryModalComponent implements OnInit {
  @Input() earnedBadgeIds: string[] = [];
  private modalCtrl = inject(ModalController);
  totalBadges: number = 0;
  groupedBadges: BadgeCategoryGroup[] = [];

  constructor() {
    addIcons({
      closeOutline,
      lockClosed,
      leaf,
      rocket,
      bagHandle,
      flash,
      car,
      train,
      bus,
      walk,
      bicycle,
      airplane,
      shirt,
      book,
      construct,
      nutrition,
      barbell,
      bulb,
      flame,
      checkmarkCircle,
      trophy,
      medal,
      star,
      flameSharp,
    });
  }

  ngOnInit() {
    const categoryMapping: Record<string, string> = {
      first: 'Első alkalmak',
      goal: 'Célkitűzések',
      challenge: 'Kihívások',
      activity: 'Tevékenységek',
      level: 'Szintfejlődés',
      streak: 'Sorozatok',
    };

    const grouped = BADGES.reduce(
      (acc, badge) => {
        if (!acc[badge.category]) {
          acc[badge.category] = {
            category: badge.category,
            title: categoryMapping[badge.category] || badge.category,
            badges: [],
          };
        }

        acc[badge.category].badges.push({
          ...badge,
          isEarned: this.earnedBadgeIds.includes(badge.id),
        });

        return acc;
      },
      {} as Record<string, BadgeCategoryGroup>,
    );

    this.totalBadges = BADGES.length;

    this.groupedBadges = Object.values(grouped);
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
