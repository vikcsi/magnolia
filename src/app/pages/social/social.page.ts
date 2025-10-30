import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NavigationComponent } from "src/app/components/navigation/navigation.component";
import { LeaderboardComponent } from 'src/app/components/leaderboard/leaderboard.component';
import { FriendsComponent } from 'src/app/components/friends/friends.component';
import { ChallengesComponent } from 'src/app/components/challenges/challenges.component';
import { addIcons } from 'ionicons';
import { 
  trendingUp,
  trendingDown,
  leaf,
  checkmark,
  chevronForward,
  flame,
  trophy,
  radioButtonOn,
  people,
  flash
} from 'ionicons/icons';

@Component({
  selector: 'app-social',
  templateUrl: './social.page.html',
  styleUrls: ['./social.page.scss'],
  standalone: true,
  imports: [IonicModule, NavigationComponent, LeaderboardComponent, FriendsComponent, ChallengesComponent, CommonModule, FormsModule]
})
export class SocialPage implements OnInit {
 selectedTab: string = 'leaderboard';

  constructor() {
    addIcons({
      trendingUp,
      trendingDown,
      leaf,
      checkmark,
      chevronForward,
      flame,
      trophy,
      radioButtonOn,
      people,
      flash
    });
  }

  ngOnInit() {
  }

  selectTab(tab: string) {
    this.selectedTab = tab;
  }

}
