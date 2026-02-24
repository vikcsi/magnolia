import { Component, OnInit } from '@angular/core';
import { IonIcon, IonProgressBar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-challenges',
  templateUrl: './challenges.component.html',
  styleUrls: ['./challenges.component.scss'],
  imports: [IonIcon, IonProgressBar]
})
export class ChallengesComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
