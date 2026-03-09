import {
  Injectable,
  inject,
  Injector,
  runInInjectionContext,
} from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  signOut,
  authState,
  User as FirebaseUser,
} from '@angular/fire/auth';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { DataService } from './data.service';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private dataService = inject(DataService);
  private injector = inject(Injector);

  public user$: Observable<FirebaseUser | null> = authState(this.auth);

  public currentUserProfile$: Observable<User | null> = this.user$.pipe(
    switchMap((firebaseUser) => {
      if (firebaseUser) {
        return this.dataService.getUserData(firebaseUser.uid);
      } else {
        return of(null);
      }
    }),
  );

  async login(email: string, password: string): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      await signInWithEmailAndPassword(this.auth, email, password);
    });
  }

  async logout(): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      await signOut(this.auth);
    });
  }

  get currentUser(): FirebaseUser | null {
    return this.auth.currentUser;
  }
}
