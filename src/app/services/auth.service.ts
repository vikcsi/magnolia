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
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  deleteUser,
  verifyBeforeUpdateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from '@angular/fire/auth';
import { Observable, of, BehaviorSubject, Subscription } from 'rxjs';
import { switchMap, filter, take } from 'rxjs/operators';
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
  private emailSyncSub?: Subscription;

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

    this.emailSyncSub = this.user$.pipe(
      filter((u): u is FirebaseUser => !!u),
      switchMap((firebaseUser) =>
        this.dataService.getUserData(firebaseUser.uid).pipe(
          take(1),
          switchMap((profile) => {
            if (profile && firebaseUser.email && profile.email !== firebaseUser.email) {
              return this.dataService.syncUserEmail(firebaseUser.uid, firebaseUser.email);
            }
            return of(undefined);
          }),
        ),
      ),
    ).subscribe();
  }

  ngOnDestroy() {
    this.emailSyncSub?.unsubscribe();
  }

  async login(email: string, password: string, rememberMe: boolean = false): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      try {
        const persistence = rememberMe
          ? browserLocalPersistence
          : browserSessionPersistence;
        await setPersistence(this.auth, persistence);
      } catch {
      }
      await signInWithEmailAndPassword(this.auth, email, password);
      this.isAuthenticated$.next(true);
    });
  }

  async sendPasswordReset(email: string): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      await sendPasswordResetEmail(this.auth, email);
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

  async updateUserEmail(newEmail: string, currentPassword: string): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      const user = this.auth.currentUser;
      if (!user || !user.email) throw new Error('Nincs bejelentkezett felhasználó.');
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await verifyBeforeUpdateEmail(user, newEmail);
    });
  }

  async updateUserPassword(currentPassword: string, newPassword: string): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      const user = this.auth.currentUser;
      if (!user || !user.email) throw new Error('Nincs bejelentkezett felhasználó.');
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
    });
  }

  async deleteAccount(password: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user || !user.email) throw new Error('Nincs bejelentkezett felhasználó.');
    const credential = EmailAuthProvider.credential(user.email, password);
    await runInInjectionContext(this.injector, () =>
      reauthenticateWithCredential(user, credential),
    );
    const uid = user.uid;
    await this.dataService.deleteUserActivities(uid);
    await this.dataService.deleteUserRelatedData(uid);
    await this.dataService.deleteUserDocument(uid);
    await runInInjectionContext(this.injector, () => deleteUser(user));
    this.isAuthenticated$.next(false);
  }

  get currentUser(): FirebaseUser | null {
    return this.auth.currentUser;
  }
}
