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
  createUserWithEmailAndPassword,
} from '@angular/fire/auth';
import { Observable, of, BehaviorSubject } from 'rxjs';
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

  private isAuthenticated$ = new BehaviorSubject<boolean>(true);

  public user$!: Observable<FirebaseUser | null>;
  public currentUserProfile$!: Observable<User | null>;

  constructor() {
    const authState$ = runInInjectionContext(this.injector, () =>
      authState(this.auth),
    );

    this.user$ = this.isAuthenticated$.pipe(
      switchMap((isAuth) => {
        if (!isAuth) return of(null);
        return authState$;
      }),
    );

    this.currentUserProfile$ = this.user$.pipe(
      switchMap((firebaseUser) => {
        if (firebaseUser) {
          return this.dataService.getUserData(firebaseUser.uid);
        }
        return of(null);
      }),
    );
  }

  async login(email: string, password: string): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      await signInWithEmailAndPassword(this.auth, email, password);
      this.isAuthenticated$.next(true);
    });
  }

  async logout(): Promise<void> {
    await runInInjectionContext(this.injector, async () => {
      await signOut(this.auth);
    });
    this.isAuthenticated$.next(false);
  }

  async register(email: string, password: string): Promise<FirebaseUser> {
    return runInInjectionContext(this.injector, async () => {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password,
      );
      this.isAuthenticated$.next(true);
      return userCredential.user;
    });
  }

  get currentUser(): FirebaseUser | null {
    return this.auth.currentUser;
  }
}
