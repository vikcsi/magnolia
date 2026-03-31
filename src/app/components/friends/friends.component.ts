import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  IonIcon,
  IonSpinner,
  IonButton,
  IonInput,
} from '@ionic/angular/standalone';
import { Observable, combineLatest, of } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { Friendship } from 'src/app/models/friendship.model';
import { User } from 'src/app/models/user.model';
import { switchMap, map } from 'rxjs/operators';
import {
  searchOutline,
  chevronForward,
  checkmarkOutline,
  closeOutline,
  personAddOutline,
} from 'ionicons/icons';
import { addIcons } from 'ionicons';

export interface FriendRequestDisplay {
  request: Friendship;
  user: User;
}

export interface FriendDisplay {
  friendship: Friendship;
  user: User;
}

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss'],
  standalone: true,
  imports: [
    IonButton,
    CommonModule,
    FormsModule,
    IonIcon,
    IonSpinner,
    IonInput,
  ],
})
export class FriendsComponent implements OnInit {
  private authService = inject(AuthService);
  private dataService = inject(DataService);

  pendingRequestsDisplay$!: Observable<FriendRequestDisplay[]>;
  acceptedFriendsDisplay$!: Observable<FriendDisplay[]>;
  friendshipStatusMap$!: Observable<Map<string, 'pending' | 'accepted'>>;

  currentUserId: string | undefined;
  isProcessing: Record<string, boolean> = {};

  searchUsername: string = '';
  searchResults$: Observable<User[]> | null = null; 
  hasSearched: boolean = false;

  constructor() {
    addIcons({
      searchOutline,
      chevronForward,
      checkmarkOutline,
      closeOutline,
      personAddOutline,
    });
  }

  ngOnInit() {
    this.currentUserId = this.authService.currentUser?.uid;

    if (this.currentUserId) {
      const uid = this.currentUserId;

      this.pendingRequestsDisplay$ = this.dataService
        .getPendingRequests(uid)
        .pipe(
          switchMap((requests) => {
            if (requests.length === 0) return of([]);
            const combined$ = requests.map((req) =>
              this.dataService
                .getUserData(req.requesterId)
                .pipe(map((user) => ({ request: req, user: user as User }))),
            );
            return combineLatest(combined$);
          }),
        );

      this.acceptedFriendsDisplay$ = this.dataService
        .getAcceptedFriends(uid)
        .pipe(
          switchMap((friendships) => {
            if (friendships.length === 0) return of([]);
            const combined$ = friendships.map((friendship) => {
              const otherUserId =
                friendship.user1 === uid ? friendship.user2 : friendship.user1;
              return this.dataService
                .getUserData(otherUserId)
                .pipe(map((user) => ({ friendship, user: user as User })));
            });
            return combineLatest(combined$);
          }),
        );

      this.friendshipStatusMap$ = this.dataService.getAllFriendships(uid).pipe(
        map((friendships) => {
          const statusMap = new Map<string, 'pending' | 'accepted'>();
          friendships.forEach((f) => {
            const otherId = f.user1 === uid ? f.user2 : f.user1;
            statusMap.set(otherId, f.status);
          });
          return statusMap;
        }),
      );
    }
  }

  handleSearch() {
    const username = this.searchUsername.trim();
    if (!username) {
      this.searchResults$ = null;
      this.hasSearched = false;
      return;
    }

    this.hasSearched = true;
    this.searchResults$ = this.dataService.searchUsersByUsername(username);
  }

  async sendRequest(receiverId: string) {
    if (!this.currentUserId) return;
    this.isProcessing[receiverId] = true;
    try {
      await this.dataService.sendFriendRequest(this.currentUserId, receiverId);
      this.handleSearch();
    } catch (error) {
      console.error('Hiba a barátkérés küldésekor:', error);
    } finally {
      this.isProcessing[receiverId] = false;
    }
  }

  async acceptRequest(friendship: Friendship) {
    if (!this.currentUserId || !friendship.id) return;
    this.isProcessing[friendship.id] = true;
    try {
      await this.dataService.acceptFriendRequest(
        this.currentUserId,
        friendship.requesterId,
      );
    } catch (error) {
      console.error('Hiba az elfogadáskor:', error);
    } finally {
      this.isProcessing[friendship.id] = false;
    }
  }

  async declineRequest(friendship: Friendship) {
    if (!friendship.id) return;
    this.isProcessing[friendship.id] = true;
    try {
      await this.dataService.removeFriendOrCancelRequest(
        friendship.user1,
        friendship.user2,
      );
    } catch (error) {
      console.error('Hiba az elutasításkor:', error);
    } finally {
      this.isProcessing[friendship.id] = false;
    }
  }
}
