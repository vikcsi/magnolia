import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationComponent } from "src/app/components/navigation/navigation.component";
import { addIcons } from 'ionicons';
import { 
  notificationsOutline, 
  trendingUpOutline, 
  starOutline, 
  paperPlaneOutline, 
  eyeOutline, 
  cameraOutline, 
  busOutline, 
  cartOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonicModule, NavigationComponent, CommonModule, FormsModule],
})
export class HomePage {
  constructor() {
    addIcons({
      notificationsOutline,
      trendingUpOutline,
      starOutline,
      paperPlaneOutline,
      eyeOutline,
      cameraOutline,
      busOutline,
      cartOutline
    });
  }
}
