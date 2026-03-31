import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  trophyOutline,
  flashOutline,
  leafOutline,
  flagOutline,
  flameOutline,
  ribbonOutline,
} from 'ionicons/icons';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { User } from 'src/app/models/user.model';
import { getCurrentLevel } from 'src/app/constants/leveling.constant';

interface CompareStats {
  emission: number;
  allXP: number;
  completedGoals: number;
  completedChallenges: number;
  currentStreak: number;
}

@Component({
  selector: 'app-compare',
  templateUrl: './compare.page.html',
  styleUrls: ['./compare.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class ComparePage implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private dataService = inject(DataService);
  private location = inject(Location);

  isLoading = true;
  currentUser: User | null = null;
  friendUser: User | null = null;

  currentStats: CompareStats | null = null;
  friendStats: CompareStats | null = null;

  constructor() {
    addIcons({
      arrowBackOutline,
      trophyOutline,
      flashOutline,
      leafOutline,
      flagOutline,
      flameOutline,
      ribbonOutline,
    });
  }

  async ngOnInit() {
    const friendId = this.route.snapshot.paramMap.get('id');
    const currentId = this.authService.currentUser?.uid;

    if (!friendId || !currentId) {
      this.goBack();
      return;
    }

    try {
      const [currentUserDoc, friendUserDoc, currentUserStats, friendUserStats] =
        await Promise.all([
          new Promise<User>((resolve) =>
            this.dataService.getUserData(currentId).subscribe(resolve),
          ),
          new Promise<User>((resolve) =>
            this.dataService.getUserData(friendId).subscribe(resolve),
          ),
          this.dataService.getUserComparisonStats(currentId),
          this.dataService.getUserComparisonStats(friendId),
        ]);

      this.currentUser = currentUserDoc;
      this.friendUser = friendUserDoc;
      this.currentStats = currentUserStats;
      this.friendStats = friendUserStats;
    } catch (error) {
      console.error('Hiba az adatok betöltésekor', error);
      this.goBack();
    } finally {
      this.isLoading = false;
    }
  }

  getCurrentLevelName(xp: number): string {
    return getCurrentLevel(xp).name;
  }

  getCurrentLevelNumber(xp: number): number {
    return getCurrentLevel(xp).level;
  }

  goBack() {
    this.location.back();
  }
}
