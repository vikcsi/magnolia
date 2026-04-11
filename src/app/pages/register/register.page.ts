import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { FIXED_GOALS } from '../../constants/goals.constant';
import { Goal } from '../../models/goal.model';
import { addIcons } from 'ionicons';
import { checkmark, leaf, mail, lockClosed, eye, eyeOff, person } from 'ionicons/icons';
import { IonContent, IonInput, IonIcon, IonButton, IonSpinner, NavController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonInput, IonIcon, IonButton, IonContent, IonSpinner, RouterLink]
})
export class RegisterPage implements OnInit {
  email = '';
  password = '';
  username = '';
  showPassword = false;
  isLoading = false;
  errorMessage = '';

  availableGoals: Goal[] = [];
  selectedGoalIds: string[] = [];

  private authService = inject(AuthService);
  private dataService = inject(DataService);
  private router = inject(Router);
  private navCtrl = inject(NavController);

  constructor() {
    addIcons({ checkmark, leaf, mail, lockClosed, eye, eyeOff, person });
  }

  ngOnInit() {
    this.availableGoals = FIXED_GOALS;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleGoal(goalId: string) {
    const index = this.selectedGoalIds.indexOf(goalId);
    if (index > -1) {
      this.selectedGoalIds.splice(index, 1);
    } else {
      if (this.selectedGoalIds.length < 2) {
        this.selectedGoalIds.push(goalId);
      } else {
        this.errorMessage = 'Maximum 2 célkitűzést választhatsz induláskor!';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    }
  }

  async register() {
    const email = this.email.trim();
    const password = this.password.trim();
    const username = this.username.trim();

    if (!username || !email || !password) {
      this.errorMessage = 'Kérlek tölts ki minden mezőt!';
      return;
    }

    if (username.length < 3) {
      this.errorMessage = 'A felhasználónév legalább 3 karakter legyen!';
      return;
    }

    if (password.length < 6) {
      this.errorMessage = 'A jelszó legalább 6 karakter legyen!';
      return;
    }

    try {
      this.isLoading = true;
      this.errorMessage = '';
      const user = await this.authService.register(email, password);
      await this.dataService.createUserProfile(user.uid, username, email, this.selectedGoalIds);
      this.navCtrl.navigateRoot('/home', { animated: true, animationDirection: 'forward' });
    } catch (error: any) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          this.errorMessage = 'Ezzel az e-mail címmel már regisztráltak!';
          break;
        case 'auth/invalid-email':
          this.errorMessage = 'Érvénytelen e-mail cím formátum!';
          break;
        case 'auth/weak-password':
          this.errorMessage = 'A jelszó túl gyenge! Legalább 6 karaktert adj meg.';
          break;
        case 'auth/network-request-failed':
          this.errorMessage = 'Hálózati hiba. Ellenőrizd az internetkapcsolatod!';
          break;
        default:
          this.errorMessage = 'Váratlan hiba történt. Kérlek, próbáld újra!';
          console.error('Registration error:', error);
      }
    } finally {
      this.isLoading = false;
    }
  }
}