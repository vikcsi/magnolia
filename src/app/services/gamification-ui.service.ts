import { Injectable, inject } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { GoalCompletedModalComponent } from '../components/goal-completed-modal/goal-completed-modal.component';
import { ChallengeCompletedModalComponent } from '../components/challenge-completed-modal/challenge-completed-modal.component';
import { BadgeEarnedModalComponent } from '../components/badge-earned-modal/badge-earned-modal.component';
import { LevelUpModalComponent } from '../components/level-up-modal/level-up-modal.component';
import { LevelDefinition } from '../constants/leveling.constant';
import { BadgeService } from './badge.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class GamificationUiService {
  private modalCtrl = inject(ModalController);
  private badgeService = inject(BadgeService);
  private authService = inject(AuthService);

  async showCelebrations(
    completedGoals: any[],
    completedChallenges: any[],
    earnedBadges: any[],
    oldLevel: LevelDefinition,
    newLevel: LevelDefinition,
    earnedXp: number,
  ): Promise<void> {
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

    if (earnedBadges && earnedBadges.length > 0) {
      for (const badge of earnedBadges) {
        const modal = await this.modalCtrl.create({
          component: BadgeEarnedModalComponent,
          componentProps: { badge },
          cssClass: 'celebration-modal',
          backdropDismiss: true,
        });
        await modal.present();
        await modal.onDidDismiss();
      }
    }

    if (newLevel.level > oldLevel.level) {
      const user = this.authService.currentUser;
      let levelBadges: any[] = [];

      if (user) {
        levelBadges = await this.badgeService.checkAndAwardBadges(user.uid, {
          trigger: 'level_up',
          currentLevel: newLevel.level,
        });
      }

      const levelModal = await this.modalCtrl.create({
        component: LevelUpModalComponent,
        componentProps: { oldLevel, newLevel, earnedXp },
        cssClass: 'celebration-modal',
        backdropDismiss: true,
      });
      await levelModal.present();
      await levelModal.onDidDismiss();

      for (const badge of levelBadges) {
        const badgeModal = await this.modalCtrl.create({
          component: BadgeEarnedModalComponent,
          componentProps: { badge },
          cssClass: 'celebration-modal',
          backdropDismiss: true,
        });
        await badgeModal.present();
        await badgeModal.onDidDismiss();
      }
    }
  }
}
