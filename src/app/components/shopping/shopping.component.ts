import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  inject,
} from '@angular/core';
import { CommonModule, AsyncPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, of, firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { Shopping } from 'src/app/models/activity.model';
import { Platform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { Html5QrcodeScanner } from 'html5-qrcode';
import {
  IonIcon,
  IonButton,
  IonSpinner,
  ToastController,
  ModalController,
  IonInput,
  IonLabel,
  IonSelect,
  IonSelectOption,
} from '@ionic/angular/standalone';
import { LevelUpModalComponent } from 'src/app/components/level-up-modal/level-up-modal.component';
import { GoalCompletedModalComponent } from 'src/app/components/goal-completed-modal/goal-completed-modal.component';
import { ChallengeCompletedModalComponent } from 'src/app/components/challenge-completed-modal/challenge-completed-modal.component';
import { getCurrentLevel, LevelDefinition } from 'src/app/constants/leveling.constant';
import { CapacitorBarcodeScanner } from '@capacitor/barcode-scanner';
import {
  OpenFoodFactsService,
  OffProduct,
} from 'src/app/services/open-food-facts.service';
import { CarbonCalculatorService } from 'src/app/services/carbon-calculator.service';
import { DataService } from 'src/app/services/data.service';
import { AuthService } from 'src/app/services/auth.service';
import {
  alertCircleOutline,
  cameraOutline,
  cartOutline,
  checkmarkCircleOutline,
  trophyOutline,
} from 'ionicons/icons';
import { addIcons } from 'ionicons';

export interface ShoppingItem {
  barcode: string;
  name: string;
  brands: string;
  ecoScore?: string;
  category: string;
  weight: number;
  emission: number;
  exactCo2?: number;
  isCommunityNew?: boolean;
}

@Component({
  selector: 'app-shopping',
  templateUrl: './shopping.component.html',
  styleUrls: ['./shopping.component.scss'],
  imports: [
    IonIcon,
    IonButton,
    IonSpinner,
    IonInput,
    IonLabel,
    IonSelect,
    IonSelectOption,
    CommonModule,
    FormsModule,
    AsyncPipe,
    DatePipe,
  ],
})
export class ShoppingComponent implements OnInit, OnDestroy {
  private offService = inject(OpenFoodFactsService);
  private calcService = inject(CarbonCalculatorService);
  private dataService = inject(DataService);
  private authService = inject(AuthService);
  private toastController = inject(ToastController);
  private modalCtrl = inject(ModalController);
  private platform = inject(Platform);
  isWebScannerActive = false;
  private html5QrcodeScanner: Html5QrcodeScanner | null = null;

  activeMode: 'scan' | 'manual' = 'scan';
  isLoading = false;
  isSaving = false;

  scannedProduct: OffProduct | null = null;
  pendingProducts: ShoppingItem[] = [];
  recentProducts$: Observable<any[]> = of([]);

  scannedForm = { weight: 1, category: 'other' };
  manualProduct = {
    barcode: '',
    name: '',
    brands: '',
    weight: 1,
    category: '',
  };

  constructor() {
    addIcons({
      alertCircleOutline,
      cameraOutline,
      cartOutline,
      checkmarkCircleOutline,
      trophyOutline,
    });
  }

  ngOnInit() {
    const user = this.authService.currentUser;
    if (user) {
      this.recentProducts$ = this.dataService.getUserActivities(user.uid).pipe(
        map((activities) => {
          const shoppingActivities = activities.filter(
            (a) => a.type === 'shopping',
          );

          shoppingActivities.sort((a, b) => {
            const dateA = (a.timestamp as any)?.toDate?.()?.getTime() || 0;
            const dateB = (b.timestamp as any)?.toDate?.()?.getTime() || 0;
            return dateB - dateA;
          });

          const latestShopping = shoppingActivities[0];
          if (!latestShopping || !latestShopping.details) return [];

          const details = latestShopping.details as Shopping;
          const activityDate =
            (latestShopping.timestamp as any)?.toDate?.() || new Date();

          return (details.products || []).slice(0, 5).map((p: any) => ({
            name: p.name,
            emission: p.emission,
            weight: p.weight,
            date: activityDate,
          }));
        }),
      );
    }
  }

  ngOnDestroy() {
    this.stopWebScanner();
  }

  @ViewChild('reader') set readerElement(element: ElementRef) {
    if (element && this.isWebScannerActive && !this.html5QrcodeScanner) {
      this.initScanner();
    }
  }

  setMode(mode: 'scan' | 'manual') {
    this.activeMode = mode;
  }

  async startSmartScan() {
    if (Capacitor.isNativePlatform()) {
      await this.startNativeCapacitorScan();
    } else {
      if (this.platform.is('mobileweb') || this.platform.is('tablet')) {
        await this.startWebFallbackScan();
      } else {
        this.setMode('manual');
        const toast = await this.toastController.create({
          message: 'Asztali gépen a manuális hozzáadást javasoljuk.',
          duration: 3000,
          color: 'primary',
          position: 'top',
        });
        await toast.present();
      }
    }
  }

  private async startNativeCapacitorScan() {
    try {
      const result = await CapacitorBarcodeScanner.scanBarcode({ hint: 17 });
      if (result && result.ScanResult) {
        await this.handleScannedBarcode(result.ScanResult);
      }
    } catch (error) {
      console.error('Natív szkennelés megszakítva:', error);
    }
  }

  private async startWebFallbackScan() {
    this.isWebScannerActive = true;
  }

  private initScanner() {
    this.html5QrcodeScanner = new Html5QrcodeScanner(
      'reader',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false,
    );

    this.html5QrcodeScanner.render(
      async (decodedText) => {
        this.stopWebScanner();
        await this.handleScannedBarcode(decodedText);
      },
      (errorMessage) => {},
    );
  }

  stopWebScanner() {
    if (this.html5QrcodeScanner) {
      this.html5QrcodeScanner.clear().catch((error) => {
        console.error('Hiba a szkenner leállításakor.', error);
      });
      this.html5QrcodeScanner = null;
    }
    this.isWebScannerActive = false;
  }

  async handleScannedBarcode(barcode: string) {
    this.isLoading = true;

    try {
      let product = await this.offService.getProductByBarcode(barcode);

      if (!product) {
        const communityProd =
          await this.dataService.getCommunityProduct(barcode);

        if (communityProd) {
          product = {
            barcode: communityProd.barcode,
            name: communityProd.name,
            brands: communityProd.brands,
            category: communityProd.category,
          };
        }
      }

      if (product) {
        this.scannedProduct = product;

        let finalCategory = 'other';
        if ((product as any).category) {
          finalCategory = (product as any).category;
        } else if (product.offCategories && product.offCategories.length > 0) {
          finalCategory = this.calcService.mapApiCategoriesToLocal(
            product.offCategories,
          );
        }

        this.scannedForm = {
          weight: 1,
          category: finalCategory,
        };
      } else {
        const toast = await this.toastController.create({
          message: `Ismeretlen vonalkód. Segíts bővíteni az adatbázist!`,
          duration: 3000,
          color: 'warning',
          icon: 'alert-circle-outline',
        });
        await toast.present();

        this.manualProduct.barcode = barcode;
        this.setMode('manual');
      }
    } catch (error) {
      console.error('Kritikus hiba a vonalkód feldolgozásánál:', error);
    } finally {
      this.isLoading = false;
    }
  }

  approveProduct() {
    if (this.scannedProduct && this.scannedForm.weight > 0) {
      const emission = this.calcService.calculateEmission(
        this.scannedForm.weight,
        this.scannedForm.category,
        this.scannedProduct.ecoScore,
        this.scannedProduct.exactCo2,
      );

      this.pendingProducts.push({
        barcode: this.scannedProduct.barcode,
        name: this.scannedProduct.name,
        brands: this.scannedProduct.brands || '',
        ecoScore: this.scannedProduct.ecoScore,
        category: this.scannedForm.category,
        weight: this.scannedForm.weight,
        emission: emission,
        exactCo2: this.scannedProduct.exactCo2,
        isCommunityNew: false,
      });
      this.scannedProduct = null;
    }
  }

  async addManualProduct() {
    if (!this.manualProduct.name.trim() || this.manualProduct.weight <= 0)
      return;

    const emission = this.calcService.calculateEmission(
      this.manualProduct.weight,
      this.manualProduct.category,
    );

    const newItem = {
      barcode: this.manualProduct.barcode || 'manual-' + Date.now(),
      name: this.manualProduct.name,
      brands: this.manualProduct.brands,
      category: this.manualProduct.category,
      weight: this.manualProduct.weight,
      emission: emission,
      isCommunityNew: !!this.manualProduct.barcode,
    };

    this.pendingProducts.push(newItem);

    if (this.manualProduct.barcode) {
      await this.dataService.saveCommunityProducts([newItem]);
    }

    this.manualProduct = {
      barcode: '',
      name: '',
      brands: '',
      weight: 1,
      category: 'other',
    };
    this.setMode('scan');
  }

  discardProduct() {
    this.scannedProduct = null;
  }

  async saveActivity() {
    const user = this.authService.currentUser;
    if (!user || this.pendingProducts.length === 0) return;

    this.isSaving = true;

    try {
      const userProfile = await firstValueFrom(this.authService.currentUserProfile$);
      const xpBefore = userProfile?.allXP ?? 0;
      const oldLevel = getCurrentLevel(xpBefore);

      const totalEmission = Number(
        this.pendingProducts
          .reduce((sum, item) => sum + item.emission, 0)
          .toFixed(2),
      );

      const { completedGoals, completedChallenges, earnedXp } = await this.dataService.saveShoppingActivity(
        user.uid,
        totalEmission,
        this.pendingProducts,
      );

      const toast = await this.toastController.create({
        message: `Vásárlás rögzítve! +${totalEmission} kg CO₂, +${earnedXp} XP szerzett.`,
        duration: 3000,
        color: 'success',
        icon: 'checkmark-circle-outline',
      });
      await toast.present();

      if (completedGoals && completedGoals.length > 0) {
        for (const goal of completedGoals) {
          const modal = await this.modalCtrl.create({
            component: GoalCompletedModalComponent,
            componentProps: { goal },
            cssClass: 'celebration-modal',
            backdropDismiss: true,
          });
          await modal.present();
          await modal.onDidDismiss();
        }
      }

      if (completedChallenges && completedChallenges.length > 0) {
        for (const challenge of completedChallenges) {
          const modal = await this.modalCtrl.create({
            component: ChallengeCompletedModalComponent,
            componentProps: { challenge },
            cssClass: 'celebration-modal',
            backdropDismiss: true,
          });
          await modal.present();
          await modal.onDidDismiss();
        }
      }

      const newLevel = getCurrentLevel(xpBefore + earnedXp);
      if (newLevel.level > oldLevel.level) {
        await this.showLevelUpModal(oldLevel, newLevel, earnedXp);
      }

      this.pendingProducts = [];
    } catch (error) {
      console.error('Mentési hiba:', error);
      const toast = await this.toastController.create({
        message: `Hiba történt a mentés során.`,
        duration: 3000,
        color: 'danger',
      });
      await toast.present();
    } finally {
      this.isSaving = false;
    }
  }

  private async showLevelUpModal(
    oldLevel: LevelDefinition,
    newLevel: LevelDefinition,
    earnedXp: number,
  ): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: LevelUpModalComponent,
      componentProps: { oldLevel, newLevel, earnedXp },
      cssClass: 'celebration-modal',
      backdropDismiss: true,
    });
    await modal.present();
    await modal.onDidDismiss();
  }
}
