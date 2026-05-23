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
import { closeOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { BADGES } from 'src/app/constants/badges.constant';
import { LEVELS } from 'src/app/constants/leveling.constant';
import { BadgeConditionType, BadgeDefinition, BadgeProgressStats } from 'src/app/models/badge.model';
import { BadgeIconComponent } from 'src/app/components/badge-icon/badge-icon.component';

export interface BadgeProgress {
  current: number;
  target: number;
}

type GalleryBadge = BadgeDefinition & {
  isEarned: boolean;
  progress: BadgeProgress | null;
};

interface BadgeCategoryGroup {
  category: string;
  title: string;
  badges: GalleryBadge[];
}

const TIERED_TYPES: BadgeConditionType[] = [
  'activity_count',
  'challenge_count',
  'level_reached',
  'max_level',
  'streak_days',
];

const MAX_LEVEL = LEVELS[LEVELS.length - 1].level;

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
    BadgeIconComponent,
  ],
})
export class BadgeGalleryModalComponent implements OnInit {
  @Input() earnedBadgeIds: string[] = [];
  @Input() progressStats: BadgeProgressStats | null = null;

  private modalCtrl = inject(ModalController);
  totalBadges: number = 0;
  groupedBadges: BadgeCategoryGroup[] = [];

  constructor() {
    addIcons({ closeOutline });
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
          progress: null,
        });
        return acc;
      },
      {} as Record<string, BadgeCategoryGroup>,
    );

    this.totalBadges = BADGES.length;

    this.groupedBadges = Object.values(grouped).map((group) => ({
      ...group,
      badges: this.progressStats
        ? this.attachProgress(group.badges, this.progressStats)
        : group.badges,
    }));
  }

  close() {
    this.modalCtrl.dismiss();
  }

  progressPercent(p: BadgeProgress): number {
    if (p.target === 0) return 100;
    return Math.min(100, Math.round((p.current / p.target) * 100));
  }

  
  private attachProgress(
    badges: GalleryBadge[],
    stats: BadgeProgressStats,
  ): GalleryBadge[] {
    const hasTiered = badges.some((b) => TIERED_TYPES.includes(b.condition.type));
    if (!hasTiered) return badges;

    const nextTarget = badges.find(
      (b) => !b.isEarned && TIERED_TYPES.includes(b.condition.type),
    );
    if (!nextTarget) return badges;

    return badges.map((b) => {
      if (b !== nextTarget) return b;
      const current = this.getCurrentValue(b, stats);
      const target = this.getTargetValue(b);
      return { ...b, progress: { current, target } };
    });
  }

  private getCurrentValue(badge: BadgeDefinition, stats: BadgeProgressStats): number {
    switch (badge.condition.type) {
      case 'activity_count':  return stats.totalActivities;
      case 'challenge_count': return stats.completedChallenges;
      case 'level_reached':
      case 'max_level':       return stats.currentLevel;
      case 'streak_days':     return stats.currentStreak;
      default:                return 0;
    }
  }

  private getTargetValue(badge: BadgeDefinition): number {
    if (badge.condition.type === 'max_level') return MAX_LEVEL;
    return badge.condition.targetValue ?? 0;
  }
}
