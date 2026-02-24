import { Component, OnInit } from '@angular/core';
import { IonIcon, IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-shopping',
  templateUrl: './shopping.component.html',
  styleUrls: ['./shopping.component.scss'],
  imports: [IonIcon, IonButton]
})
export class ShoppingComponent implements OnInit {

  constructor() { }

  ngOnInit() { }

}
