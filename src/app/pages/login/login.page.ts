import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { addIcons } from 'ionicons';
import { checkmark, leaf, mail, lockClosed, eye, eyeOff, person } from 'ionicons/icons';
import { IonCheckbox, IonContent, IonInput, IonIcon, IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonInput, IonIcon, IonButton, IonContent, IonCheckbox]
})
export class LoginPage {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  rememberMe: boolean = false;
  errorMessage: string = '';

  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    addIcons({ checkmark, leaf, mail, lockClosed, eye, eyeOff, person });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async login() {
    try {
      this.errorMessage = '';
      await this.authService.login(this.email, this.password);
      this.router.navigate(['/home']);
    } catch (error: any) {
      console.error('Login error:', error);
      this.errorMessage = 'Hibás e-mail cím vagy jelszó!';
    }
  }
}