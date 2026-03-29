import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
    FirestoreDatePipe,
    RouterLink,
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
      this.activities$ = this.dataService.getUserActivities(firebaseUser.uid).pipe(
        map((activities) =>
          [...activities]
            .sort((a, b) => {
              const aTime = a.timestamp instanceof Date ? a.timestamp.getTime() : (a.timestamp as any)?.toMillis?.() ?? 0;
              const bTime = b.timestamp instanceof Date ? b.timestamp.getTime() : (b.timestamp as any)?.toMillis?.() ?? 0;
              return bTime - aTime;
            })
            .slice(0, 5)
        )
      );
    }
  }
}
