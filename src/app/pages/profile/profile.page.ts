import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationComponent } from 'src/app/components/navigation/navigation.component';
import { addIcons } from 'ionicons';
import {
  settingsOutline,
  star,
  flash,
  ribbon,
  chevronForward,
  people,
  radioButtonOn,
  leaf,
  trophy,
  person,
  playForward,
} from 'ionicons/icons';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';
import { User } from 'src/app/models/user.model';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonProgressBar,
  IonFooter,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonProgressBar,
    IonFooter,
    NavigationComponent,
    CommonModule,
    FormsModule,
  ],
})
export class ProfilePage implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  userData$!: Observable<User | null>;

  constructor() {
    addIcons({
      settingsOutline,
      star,
      flash,
      ribbon,
      chevronForward,
      people,
      radioButtonOn,
      leaf,
      trophy,
      person,
      playForward,
    });
  }

  ngOnInit() {
    this.userData$ = this.authService.currentUserProfile$;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
