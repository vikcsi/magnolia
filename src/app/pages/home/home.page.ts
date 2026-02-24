import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationComponent } from 'src/app/components/navigation/navigation.component';
import { addIcons } from 'ionicons';
import {
  notificationsOutline,
  trendingUpOutline,
  starOutline,
  paperPlaneOutline,
  eyeOutline,
  cameraOutline,
  busOutline,
  cartOutline,
} from 'ionicons/icons';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonCard,
  IonCardContent,
  IonProgressBar,
  IonGrid,
  IonRow,
  IonCol,
  IonLabel,
  IonList,
  IonItem,
  IonFooter,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonCard,
    IonCardContent,
    IonProgressBar,
    IonLabel,
    IonList,
    IonItem,
    IonFooter,
    NavigationComponent,
    CommonModule,
    FormsModule,
  ],
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
      cartOutline,
    });
  }
}
