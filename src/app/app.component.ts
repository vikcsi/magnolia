import { Component, inject, Injector, OnInit } from '@angular/core';
import { runInInjectionContext } from '@angular/core';
import {
  IonApp,
  IonRouterOutlet,
  IonSplitPane,
  IonMenu,
  IonContent,
} from '@ionic/angular/standalone';
import { NavigationComponent } from './components/navigation/navigation.component';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { addIcons } from 'ionicons';
import { CleanupService } from './services/cleanup.service';
import { NotificationService } from './services/notification.service';
import {
  footsteps,
  navigate,
  cart,
  flash,
  flag,
  flame,
  nutrition,
  bus,
  batteryCharging,
  storefront,
  bicycle,
  trashBin,
  earth,
  calendar,
  shieldCheckmark,
  ribbon,
  medal,
  trophy,
  diamond,
  clipboard,
  statsChart,
  star,
  rocket,
  leaf,
  planet,
  bonfire,
  infinite,
} from 'ionicons/icons';
import { NavController } from '@ionic/angular/standalone';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [
    IonApp,
    IonRouterOutlet,
    IonSplitPane,
    IonMenu,
    IonContent,
    NavigationComponent,
  ],
})
export class AppComponent {
  private auth = inject(Auth);
  private injector = inject(Injector);
  private navCtrl = inject(NavController);
  private cleanupService = inject(CleanupService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private previousUid: string | null = null;

  isMenuDisabled = true; 

  constructor() {
    addIcons({
      footsteps,
      navigate,
      cart,
      flash,
      flag,
      flame,
      nutrition,
      bus,
      batteryCharging,
      storefront,
      bicycle,
      trashBin,
      earth,
      calendar,
      shieldCheckmark,
      ribbon,
      medal,
      trophy,
      diamond,
      clipboard,
      statsChart,
      star,
      rocket,
      leaf,
      planet,
      bonfire,
      infinite,
    });

    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        const authPages = ['/login', '/register'];
        this.isMenuDisabled = authPages.some((p) =>
          e.urlAfterRedirects.startsWith(p),
        );
      });
  }

  ngOnInit() {
    runInInjectionContext(this.injector, () => {
      onAuthStateChanged(this.auth, (user) => {
        const currentUid = user?.uid ?? null;
        if (user) {
          this.cleanupService.cleanupExpiredItems();
          this.notificationService.scheduleExpiryNotifications(user.uid);
        }
        if (
          this.previousUid !== null &&
          currentUid !== null &&
          this.previousUid !== currentUid
        ) {
          this.navCtrl.navigateRoot('/home');
        }
        if (this.previousUid !== null && currentUid === null) {
          this.navCtrl.navigateRoot('/login');
        }
        this.previousUid = currentUid;
      });
    });
  }
}
