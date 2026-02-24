import { Component, OnInit } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss'],
  imports: [IonIcon]
})
export class FriendsComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
