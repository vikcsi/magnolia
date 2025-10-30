import { Injectable } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private loggedIn = false;
  private currentUser: User | null = null;

  isLoggedIn(): boolean {
    return this.loggedIn || !!localStorage.getItem('loggedIn');
  }

  getUser(): User | null {
    if (this.currentUser) return this.currentUser;
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }

  login(user?: User): void {
    this.loggedIn = true;
    localStorage.setItem('loggedIn', 'true');
    if (user) {
      this.currentUser = user;
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  logout(): void {
    this.loggedIn = false;
    this.currentUser = null;
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('user');
  }
}
