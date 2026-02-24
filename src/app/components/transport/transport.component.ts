import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonIcon, IonLabel, IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-transport',
  templateUrl: './transport.component.html',
  styleUrls: ['./transport.component.scss'],
  imports: [IonIcon, IonLabel, IonButton, CommonModule]
})
export class TransportComponent implements OnInit {
  selectedTransport: string = '';

  constructor() { }

  ngOnInit() { }

  selectTransport(transport: string) {
    this.selectedTransport = transport;
  }
}
