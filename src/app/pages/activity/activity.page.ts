import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationComponent } from "src/app/components/navigation/navigation.component";
import { EnergyComponent } from 'src/app/components/energy/energy.component';
import { TransportComponent } from 'src/app/components/transport/transport.component';
import { ShoppingComponent } from 'src/app/components/shopping/shopping.component';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  locationOutline,
  cartOutline,
  flashOutline,
  cameraOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.page.html',
  styleUrls: ['./activity.page.scss'],
  standalone: true,
  imports: [IonicModule, NavigationComponent, EnergyComponent, ShoppingComponent, TransportComponent, CommonModule, FormsModule]
})
export class ActivityPage implements OnInit {
  selectedCategory: string = 'transport';

  constructor() {
    addIcons({
      locationOutline,
      cartOutline,
      flashOutline,
      cameraOutline
    });
  }

  ngOnInit() {
  }

  selectCategory(segment: string) {
    this.selectedCategory = segment;
  }

}
