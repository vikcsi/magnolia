import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { addIcons } from 'ionicons';
import {
  checkmark,
  leaf,
  mail,
  lockClosed,
  eye,
  eyeOff,
  person,
} from 'ionicons/icons';
import {
  IonCheckbox,
  IonContent,
  IonInput,
  IonIcon,
  IonButton,
  IonSpinner,
  NavController
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonInput,
    IonIcon,
    IonButton,
    IonContent,
    IonCheckbox,
    IonSpinner,
    RouterLink,
  ],
})
export class LoginPage {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  rememberMe: boolean = false;
  errorMessage: string = '';
  isLoading: boolean = false;

  private authService = inject(AuthService);
  private router = inject(Router);
  private navCtrl = inject(NavController);

  constructor() {
    addIcons({ checkmark, leaf, mail, lockClosed, eye, eyeOff, person });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async login() {
    const email = this.email.trim();
    const password = this.password.trim();

    if (!email || !password) {
      this.errorMessage = 'Kérlek töltsd ki az e-mail és jelszó mezőket!';
      return;
    }

    try {
      this.isLoading = true;
      this.errorMessage = '';
      await this.authService.login(email, password);
      this.navCtrl.navigateRoot('/home', { animated: true, animationDirection: 'forward' });
    } catch (error: any) {
      switch (error.code) {
        case 'auth/invalid-email':
          this.errorMessage = 'Érvénytelen e-mail cím formátum!';
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          this.errorMessage = 'Hibás e-mail cím vagy jelszó!';
          break;
        case 'auth/too-many-requests':
          this.errorMessage = 'Túl sok sikertelen kísérlet. Próbáld újra később!';
          break;
        case 'auth/network-request-failed':
          this.errorMessage = 'Hálózati hiba. Ellenőrizd az internetkapcsolatod!';
          break;
        default:
          this.errorMessage = 'Váratlan hiba történt. Kérlek, próbáld újra!';
          console.error(error);
      }
    } finally {
      this.isLoading = false;
    }
  }
}
