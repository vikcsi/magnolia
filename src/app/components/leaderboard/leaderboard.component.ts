import { Component, OnInit } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss'],
  imports: [IonIcon]
})
export class LeaderboardComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
