import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { addIcons } from 'ionicons';
import {
  mailOutline,
  lockClosedOutline,
  logOutOutline,
  trashOutline,
  chevronDownOutline,
  chevronUpOutline,
  chevronBackOutline,
  chevronForwardOutline,
  locationOutline,
  cartOutline,
  flashOutline,
  carOutline,
  bicycleOutline,
  walkOutline,
  trainOutline,
  waterOutline,
  speedometerOutline,
  flameOutline,
  eyeOutline,
  eyeOffOutline,
  checkboxOutline,
  squareOutline,
  personOutline,
  leafOutline,
  shieldOutline,
  warningOutline,
  arrowBackOutline,
} from 'ionicons/icons';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonContent,
  IonIcon,
  IonButton,
  IonInput,
  IonSpinner,
  AlertController,
  NavController,
} from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { Activity, Travel, Energy } from '../../models/activity.model';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonContent,
    IonIcon,
    IonButton,
    IonInput,
    IonSpinner,
  ],
})
export class SettingsPage implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private dataService = inject(DataService);
  private alertCtrl = inject(AlertController);
  private navCtrl = inject(NavController);
  private location = inject(Location);

  // Form visibility flags
  showEmailForm = false;
  showPasswordForm = false;
  showActivities = false;

  // Email form
  newEmail = '';
  emailPassword = '';
  emailLoading = false;
  emailError = '';
  emailSuccess = '';

  // Password form
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  showCurrentPw = false;
  showNewPw = false;
  showConfirmPw = false;
  passwordLoading = false;
  passwordError = '';
  passwordSuccess = '';

  // Activities
  allActivities: Activity[] = [];
  selectedIds = new Set<string>();
  activitiesLoading = false;
  currentPage = 0;
  readonly pageSize = 10;
  private activitiesSub?: Subscription;

  get pagedActivities(): Activity[] {
    const start = this.currentPage * this.pageSize;
    return this.allActivities.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.allActivities.length / this.pageSize);
  }

  constructor() {
    addIcons({
      mailOutline,
      lockClosedOutline,
      logOutOutline,
      trashOutline,
      chevronDownOutline,
      chevronUpOutline,
      chevronBackOutline,
      chevronForwardOutline,
      locationOutline,
      cartOutline,
      flashOutline,
      carOutline,
      bicycleOutline,
      walkOutline,
      trainOutline,
      waterOutline,
      speedometerOutline,
      flameOutline,
      eyeOutline,
      eyeOffOutline,
      checkboxOutline,
      squareOutline,
      personOutline,
      leafOutline,
      shieldOutline,
      warningOutline,
      arrowBackOutline,
    });
  }

  ngOnInit() {
    const uid = this.authService.currentUser?.uid;
    if (uid) {
      this.activitiesSub = this.dataService.getUserActivities(uid).subscribe((acts) => {
        this.allActivities = acts.sort(
          (a, b) => this.toMs(b.timestamp) - this.toMs(a.timestamp),
        );
        // Ha törlés után az aktuális oldal üres lett, lépj vissza
        if (this.currentPage >= this.totalPages && this.totalPages > 0) {
          this.currentPage = this.totalPages - 1;
        }
      });
    }
  }

  ngOnDestroy() {
    this.activitiesSub?.unsubscribe();
  }

  goBack(): void {
    this.location.back();
  }

  get currentEmail(): string {
    return this.authService.currentUser?.email ?? '';
  }

  // --- Email ---

  toggleEmailForm() {
    this.showEmailForm = !this.showEmailForm;
    this.emailError = '';
    this.emailSuccess = '';
  }

  async saveEmailChange() {
    this.emailError = '';
    this.emailSuccess = '';
    if (!this.newEmail.trim() || !this.emailPassword) {
      this.emailError = 'Töltsd ki mindkét mezőt!';
      return;
    }
    this.emailLoading = true;
    try {
      await this.authService.updateUserEmail(this.newEmail.trim(), this.emailPassword);
      this.emailSuccess = 'Ellenőrző e-mail elküldve az új címre. A módosítás a megerősítés után lép életbe.';
      this.newEmail = '';
      this.emailPassword = '';
      setTimeout(() => { this.showEmailForm = false; this.emailSuccess = ''; }, 2000);
    } catch (err: any) {
      this.emailError = this.mapAuthError(err.code);
    } finally {
      this.emailLoading = false;
    }
  }

  // --- Password ---

  togglePasswordForm() {
    this.showPasswordForm = !this.showPasswordForm;
    this.passwordError = '';
    this.passwordSuccess = '';
  }

  async savePasswordChange() {
    this.passwordError = '';
    this.passwordSuccess = '';
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.passwordError = 'Töltsd ki az összes mezőt!';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'Az új jelszavak nem egyeznek!';
      return;
    }
    if (this.newPassword.length < 6) {
      this.passwordError = 'Az új jelszónak legalább 6 karakter hosszúnak kell lennie!';
      return;
    }
    this.passwordLoading = true;
    try {
      await this.authService.updateUserPassword(this.currentPassword, this.newPassword);
      this.passwordSuccess = 'Jelszó sikeresen megváltoztatva!';
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';
      setTimeout(() => { this.showPasswordForm = false; this.passwordSuccess = ''; }, 2000);
    } catch (err: any) {
      this.passwordError = this.mapAuthError(err.code);
    } finally {
      this.passwordLoading = false;
    }
  }

  // --- Activities ---

  toggleActivities() {
    this.showActivities = !this.showActivities;
    this.selectedIds.clear();
    this.currentPage = 0;
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.selectedIds.clear();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.selectedIds.clear();
    }
  }

  toggleSelect(id: string) {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
  }

  toggleSelectAll() {
    const pageIds = this.pagedActivities.map((a) => a.id);
    const allSelected = pageIds.every((id) => this.selectedIds.has(id));
    if (allSelected) {
      pageIds.forEach((id) => this.selectedIds.delete(id));
    } else {
      pageIds.forEach((id) => this.selectedIds.add(id));
    }
  }

  get currentPageAllSelected(): boolean {
    return (
      this.pagedActivities.length > 0 &&
      this.pagedActivities.every((a) => this.selectedIds.has(a.id))
    );
  }

  async deleteSelected() {
    if (this.selectedIds.size === 0) return;
    const count = this.selectedIds.size;
    const confirm = await this.alertCtrl.create({
      header: 'Tevékenységek törlése',
      message: `Biztosan törölni szeretnéd a kiválasztott ${count} tevékenységet? Ez visszavonhatatlan.`,
      buttons: [
        { text: 'Mégse', role: 'cancel' },
        {
          text: 'Törlés',
          role: 'destructive',
          handler: async () => {
            this.activitiesLoading = true;
            try {
              await this.dataService.deleteActivities([...this.selectedIds]);
              this.selectedIds.clear();
            } finally {
              this.activitiesLoading = false;
            }
          },
        },
      ],
    });
    await confirm.present();
  }

  getActivityIcon(activity: Activity): string {
    if (activity.type === 'travel') {
      const icons: Record<string, string> = {
        car: 'car-outline',
        motorbike: 'speedometer-outline',
        bus: 'bus-outline',
        train: 'train-outline',
        bicycling: 'bicycle-outline',
        walking: 'walk-outline',
      };
      return icons[(activity.details as Travel).mode] ?? 'bus-outline';
    }
    if (activity.type === 'energy') {
      const icons: Record<string, string> = {
        electricity: 'flash-outline',
        gas: 'flame-outline',
        water: 'water-outline',
      };
      return icons[(activity.details as Energy).typeEnergy] ?? 'flash-outline';
    }
    return 'cart-outline';
  }

  getActivityLabel(activity: Activity): string {
    if (activity.type === 'travel') {
      const labels: Record<string, string> = {
        car: 'Autó',
        motorbike: 'Motor',
        bus: 'Tömegközlekedés',
        train: 'Vonat',
        bicycling: 'Bicikli',
        walking: 'Gyalog',
      };
      return labels[(activity.details as Travel).mode] ?? 'Utazás';
    }
    if (activity.type === 'energy') {
      const labels: Record<string, string> = {
        electricity: 'Villanyáram',
        gas: 'Gáz',
        water: 'Víz',
      };
      return labels[(activity.details as Energy).typeEnergy] ?? 'Energia';
    }
    return 'Bevásárlás';
  }

  getActivityDate(activity: Activity): Date {
    return this.toDate(activity.timestamp);
  }

  private toDate(value: any): Date {
    if (value instanceof Date) return value;
    if (typeof value?.toDate === 'function') return value.toDate();
    return new Date(value);
  }

  private toMs(value: any): number {
    return this.toDate(value).getTime();
  }

  // --- Account ---

  async logout() {
    await this.authService.logout();
    this.navCtrl.navigateRoot('/login', { animated: true, animationDirection: 'back' });
  }

  async deleteAccount() {
    const confirm = await this.alertCtrl.create({
      header: 'Fiók törlése',
      message: 'Biztosan törölni szeretnéd a fiókodat? Ez a művelet visszavonhatatlan — minden adatod véglegesen törlődik.',
      buttons: [
        { text: 'Mégse', role: 'cancel' },
        {
          text: 'Törlés',
          role: 'destructive',
          handler: async () => {
            try {
              await this.authService.deleteAccount();
              this.navCtrl.navigateRoot('/login', { animated: true, animationDirection: 'back' });
            } catch {
              const err = await this.alertCtrl.create({
                header: 'Hiba',
                message: 'A fiók törlése nem sikerült. Lehet, hogy újra be kell jelentkezned a művelet elvégzéséhez.',
                buttons: ['OK'],
              });
              await err.present();
            }
          },
        },
      ],
    });
    await confirm.present();
  }

  private mapAuthError(code: string): string {
    switch (code) {
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Helytelen jelszó!';
      case 'auth/email-already-in-use':
        return 'Ez az e-mail cím már foglalt!';
      case 'auth/invalid-email':
        return 'Érvénytelen e-mail cím formátum!';
      case 'auth/weak-password':
        return 'A jelszó túl gyenge! Legalább 6 karakter szükséges.';
      case 'auth/requires-recent-login':
        return 'A művelethez újra be kell jelentkezned!';
      case 'auth/network-request-failed':
        return 'Hálózati hiba. Ellenőrizd az internetkapcsolatod!';
      default:
        return 'Váratlan hiba történt. Kérlek, próbáld újra!';
    }
  }
}
