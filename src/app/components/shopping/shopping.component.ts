import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonIcon, IonButton, IonSpinner, ToastController, IonInput, IonLabel, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { CapacitorBarcodeScanner } from '@capacitor/barcode-scanner';
import { OpenFoodFactsService, OffProduct } from 'src/app/services/open-food-facts.service';
import { CarbonCalculatorService } from 'src/app/services/carbon-calculator.service';
import { DataService } from 'src/app/services/data.service';
import { AuthService } from 'src/app/services/auth.service';
import { alertCircleOutline, cameraOutline, cartOutline, checkmarkCircleOutline } from 'ionicons/icons';
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
  imports: [IonIcon, IonButton, IonSpinner, IonInput, IonLabel, IonSelect, IonSelectOption, CommonModule, FormsModule],
})
export class ShoppingComponent implements OnInit {
  private offService = inject(OpenFoodFactsService);
  private calcService = inject(CarbonCalculatorService);
  private dataService = inject(DataService);
  private authService = inject(AuthService);
  private toastController = inject(ToastController);

  activeMode: 'scan' | 'manual' = 'scan';
  isLoading = false;
  isSaving = false;
  
  scannedProduct: OffProduct | null = null;
  pendingProducts: ShoppingItem[] = [];

  scannedForm = { weight: 1, category: 'other' };
  manualProduct = { barcode: '', name: '', brands: '', weight: 1, category: 'other' };

  constructor() {
    addIcons({ alertCircleOutline, cameraOutline, cartOutline, checkmarkCircleOutline });
  }

  ngOnInit() {}

  setMode(mode: 'scan' | 'manual') {
    this.activeMode = mode;
  }

  async startScan() {
    try {
      const result = await CapacitorBarcodeScanner.scanBarcode({ hint: 17 });
      if (result && result.ScanResult) {
        await this.handleScannedBarcode(result.ScanResult);
      }
    } catch (error) {
      console.log('Szkennelés megszakítva:', error);
    }
  }

  async handleScannedBarcode(barcode: string) {
    this.isLoading = true;
    const product = await this.offService.getProductByBarcode(barcode);
    this.isLoading = false;

    if (product) {
      this.scannedProduct = product;
      this.scannedForm = { weight: 1, category: 'other' };
    } else {
      const toast = await this.toastController.create({
        message: `Ismeretlen vonalkód. Segíts bővíteni az adatbázist!`,
        duration: 3000, color: 'warning', icon: 'alert-circle-outline'
      });
      await toast.present();
      this.manualProduct.barcode = barcode;
      this.setMode('manual');
    }
  }

  approveProduct() {
    if (this.scannedProduct && this.scannedForm.weight > 0) {
      const emission = this.calcService.calculateEmission(
        this.scannedForm.weight, this.scannedForm.category, this.scannedProduct.ecoScore, this.scannedProduct.exactCo2
      );

      this.pendingProducts.push({
        barcode: this.scannedProduct.barcode, name: this.scannedProduct.name,
        brands: this.scannedProduct.brands || '', ecoScore: this.scannedProduct.ecoScore,
        category: this.scannedForm.category, weight: this.scannedForm.weight,
        emission: emission, exactCo2: this.scannedProduct.exactCo2, isCommunityNew: false
      });
      this.scannedProduct = null;
    }
  }

  addManualProduct() {
    if (!this.manualProduct.name.trim() || this.manualProduct.weight <= 0) return;

    const emission = this.calcService.calculateEmission(this.manualProduct.weight, this.manualProduct.category);

    this.pendingProducts.push({
      barcode: this.manualProduct.barcode || 'manual-' + Date.now(),
      name: this.manualProduct.name, brands: this.manualProduct.brands,
      category: this.manualProduct.category, weight: this.manualProduct.weight,
      emission: emission, isCommunityNew: !!this.manualProduct.barcode
    });

    this.manualProduct = { barcode: '', name: '', brands: '', weight: 1, category: 'other' };
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
      const totalEmission = Number(this.pendingProducts.reduce((sum, item) => sum + item.emission, 0).toFixed(2));
      
      await this.dataService.saveShoppingActivity(user.uid, totalEmission, this.pendingProducts);

      const communityItems = this.pendingProducts.filter(p => p.isCommunityNew);
      if (communityItems.length > 0) {
        await this.dataService.saveCommunityProducts(communityItems);
      }

      const toast = await this.toastController.create({
        message: `Vásárlás rögzítve! +${totalEmission} kg CO₂ adódott a lábnyomodhoz.`,
        duration: 3000, color: 'success', icon: 'checkmark-circle-outline'
      });
      await toast.present();

      this.pendingProducts = [];
    } catch (error) {
      console.error('Mentési hiba:', error);
      const toast = await this.toastController.create({
        message: `Hiba történt a mentés során.`, duration: 3000, color: 'danger'
      });
      await toast.present();
    } finally {
      this.isSaving = false;
    }
  }
}