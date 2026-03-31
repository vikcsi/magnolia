import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  footsteps, navigate, cart, flash, flag, flame, nutrition,
  bus, batteryCharging, storefront, bicycle, trashBin, earth,
  calendar, shieldCheckmark, ribbon, medal, trophy, diamond,
  clipboard, statsChart, star, rocket, leaf, planet, bonfire, infinite
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor() {
    addIcons({
      footsteps, navigate, cart, flash, flag, flame, nutrition,
      bus, batteryCharging, storefront, bicycle, trashBin, earth,
      calendar, shieldCheckmark, ribbon, medal, trophy, diamond,
      clipboard, statsChart, star, rocket, leaf, planet, bonfire, infinite
    });
  }
}
