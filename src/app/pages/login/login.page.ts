import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
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

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
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
    const foundUser = MOCK_USERS.find(u => u.username === this.username);
    if (foundUser) {
      this.authService.login(foundUser);
      this.router.navigate(['/home']);
    } else {
      alert('Hibás azonosító vagy jelszó!');
    }
  }
}