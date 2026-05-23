import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationComponent } from 'src/app/components/navigation/navigation.component';
import { EnergyComponent } from 'src/app/components/energy/energy.component';
import { TransportComponent } from 'src/app/components/transport/transport.component';
import { ShoppingComponent } from 'src/app/components/shopping/shopping.component';
import { addIcons } from 'ionicons';
import {
  locationOutline,
  cartOutline,
  flashOutline,
  cameraOutline,
  personOutline,
} from 'ionicons/icons';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonLabel,
  IonIcon,
  IonFooter,
  IonButtons,
  IonButton,
  NavController,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.page.html',
  styleUrls: ['./activity.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonLabel,
    IonIcon,
    IonFooter,
    IonButtons,
    IonButton,
    NavigationComponent,
    EnergyComponent,
    ShoppingComponent,
    TransportComponent,
    CommonModule,
    FormsModule,
  ],
})
export class ActivityPage {
  selectedCategory: string = 'transport';
  private navCtrl = inject(NavController);

  constructor() {
    addIcons({
      locationOutline,
      cartOutline,
      flashOutline,
      cameraOutline,
      personOutline,
    });
  }

  selectCategory(segment: string) {
    this.selectedCategory = segment;
  }

  openProfile(): void {
    this.navCtrl.navigateForward('/profile');
  }
}
