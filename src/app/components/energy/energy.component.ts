import { Component, OnInit } from '@angular/core';
import { IonIcon, IonLabel, IonSelect, IonSelectOption, IonInput, IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-energy',
  templateUrl: './energy.component.html',
  styleUrls: ['./energy.component.scss'],
  imports: [IonIcon, IonLabel, IonSelect, IonSelectOption, IonInput, IonButton]
})
export class EnergyComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
