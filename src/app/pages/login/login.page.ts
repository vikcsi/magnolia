import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User, MOCK_USERS } from 'src/app/models/user.model';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { 
  checkmark, 
  leaf, 
  mail, 
  lockClosed, 
  eye, 
  eyeOff, 
  person
} from 'ionicons/icons';
import { IonCheckbox, IonContent, IonInput } from '@ionic/angular/standalone';
import { IonIcon } from '@ionic/angular/standalone';
import { IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonInput, IonIcon, IonButton, IonContent, IonCheckbox]
})
export class LoginPage implements OnInit {
  username: string = '';
  password: string = '';
  showPassword: boolean = false;
  rememberMe: boolean = false;

  constructor(private router: Router, private authService: AuthService) {
    addIcons({
      checkmark,
      leaf,
      mail,
      lockClosed,
      eye,
      eyeOff,
      person
    });
  }

  ngOnInit() {
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  login() {
    const foundUser = MOCK_USERS.find(u => u.username === this.username && u.password === this.password);
    if (foundUser) {
      this.authService.login(foundUser);
      this.router.navigate(['/home']);
    } else {
      alert('Hibás azonosító vagy jelszó!');
    }
  }
}