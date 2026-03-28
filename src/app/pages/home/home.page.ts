import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { Activity } from 'src/app/models/activity.model';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
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
  listOutline,
  flashOutline,
  addOutline,
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
  IonLabel,
  IonList,
  IonItem,
  IonFooter,
} from '@ionic/angular/standalone';
import { FirestoreDatePipe } from 'src/app/pipes/firestore-date.pipe';

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
    FirestoreDatePipe
  ],
})
export class HomePage implements OnInit {
  private authService = inject(AuthService);
  private dataService = inject(DataService);

  userData$!: Observable<User | null>;
  activities$!: Observable<Activity[]>;

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
      flashOutline,
      addOutline,
      listOutline
    });
  }

  ngOnInit() {
    this.userData$ = this.authService.currentUserProfile$;
    
    const firebaseUser = this.authService.currentUser;
    if (firebaseUser) {
      this.activities$ = this.dataService.getUserActivities(firebaseUser.uid);
    }
  }
}
