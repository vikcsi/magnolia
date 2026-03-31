import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonSpinner,
} from '@ionic/angular/standalone';
import { Observable, combineLatest, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { User } from 'src/app/models/user.model';
import { addIcons } from 'ionicons';
import { trendingUp, trendingDown } from 'ionicons/icons';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonSpinner,
  ],
})
export class LeaderboardComponent implements OnInit {
  private authService = inject(AuthService);
  private dataService = inject(DataService);

  selectedTab: 'global' | 'friends' = 'global';

  globalLeaderboard$!: Observable<User[]>;
  friendsLeaderboard$!: Observable<User[]>;

  currentUserId: string | undefined;
  currentUserData$!: Observable<User | null>;

  constructor() {
    addIcons({ trendingUp, trendingDown });
  }

  ngOnInit() {
    this.currentUserId = this.authService.currentUser?.uid;
    this.currentUserData$ = this.authService.currentUserProfile$;

    this.globalLeaderboard$ = this.dataService.getGlobalLeaderboard(100);

    if (this.currentUserId) {
      const uid = this.currentUserId;
      this.friendsLeaderboard$ = this.dataService.getAcceptedFriends(uid).pipe(
        switchMap((friendships) => {
          if (friendships.length === 0) {
            return this.currentUserData$.pipe(map((u) => (u ? [u] : [])));
          }

          const friendIds = friendships.map((f) =>
            f.user1 === uid ? f.user2 : f.user1,
          );
          const allIds = [uid, ...friendIds];

          const userDocs$ = allIds.map((id) =>
            this.dataService.getUserData(id),
          );
          return combineLatest(userDocs$);
        }),
        map((users) =>
          users.filter((u): u is User => !!u).sort((a, b) => b.allXP - a.allXP),
        ),
      );
    }
  }

  setTab(tab: 'global' | 'friends') {
    this.selectedTab = tab;
  }

  getUserRank(users: User[], uid: string): number {
    const index = users.findIndex((u) => u.id === uid);
    return index >= 0 ? index + 1 : 0;
  }
}
