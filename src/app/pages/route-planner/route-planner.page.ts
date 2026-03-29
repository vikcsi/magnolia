import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
  IonIcon,
  IonButton,
  IonSpinner,
  IonInput,
  ToastController,
} from '@ionic/angular/standalone';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { lastValueFrom } from 'rxjs';
import { addIcons } from 'ionicons';
import {
  locationOutline,
  navigateOutline,
  checkmarkCircleOutline,
  swapVerticalOutline,
} from 'ionicons/icons';
import { Capacitor } from '@capacitor/core';
import { environment } from 'src/environments/environment';
import { DirectionsService, RouteComparison, TransportMode } from 'src/app/services/directions.service';
import { LocationSearchService, LocationSearchResult } from 'src/app/services/location-search.service';
import { CarbonCalculatorService } from 'src/app/services/carbon-calculator.service';
import { DataService } from 'src/app/services/data.service';
import { AuthService } from 'src/app/services/auth.service';

export interface ComparisonItem {
  mode: TransportMode;
  label: string;
  icon: string;
  distanceKm: number;
  durationMin: number;
  emissionKg: number;
  isGreenest: boolean;
  isFastest: boolean;
  polyline?: string;
}

@Component({
  selector: 'app-route-planner',
  templateUrl: './route-planner.page.html',
  styleUrls: ['./route-planner.page.scss'],
  imports: [
    IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
    IonContent, IonIcon, IonButton, IonSpinner, IonInput, FormsModule,
  ],
})
export class RoutePlannerPage implements OnInit, OnDestroy {
  private directionsService = inject(DirectionsService);
  private locationSearchService = inject(LocationSearchService);
  private calcService = inject(CarbonCalculatorService);
  private dataService = inject(DataService);
  private authService = inject(AuthService);
  private toastController = inject(ToastController);

  fromQuery = '';
  toQuery = '';
  fromCoords: string | null = null;
  toCoords: string | null = null;
  fromSuggestions: LocationSearchResult[] = [];
  toSuggestions: LocationSearchResult[] = [];
  isSearchingFrom = false;
  isSearchingTo = false;

  isComparing = false;
  comparisonItems: ComparisonItem[] = [];
  selectedItem: ComparisonItem | null = null;
  isSaving = false;
  staticMapUrl: string | null = null;

  private fromSearch$ = new Subject<string>();
  private toSearch$ = new Subject<string>();
  private subs: Subscription[] = [];

  readonly modeConfig: Record<TransportMode, { label: string; icon: string }> = {
    car: { label: 'Autó', icon: '🚗' },
    motorbike: { label: 'Motor', icon: '🏍️' },
    bus: { label: 'Tömegközlekedés', icon: '🚌' },
    train: { label: 'Vonat', icon: '🚆' },
    bicycling: { label: 'Bicikli', icon: '🚲' },
    walking: { label: 'Gyalog', icon: '🚶' },
  };

  constructor() {
    addIcons({ locationOutline, navigateOutline, checkmarkCircleOutline, swapVerticalOutline });
  }

  ngOnInit(): void {
    const fromSub = this.fromSearch$
      .pipe(
        debounceTime(600),
        distinctUntilChanged(),
        tap(() => (this.isSearchingFrom = true)),
        switchMap((q) => this.locationSearchService.search(q)),
      )
      .subscribe((results) => {
        this.fromSuggestions = results;
        this.isSearchingFrom = false;
      });

    const toSub = this.toSearch$
      .pipe(
        debounceTime(600),
        distinctUntilChanged(),
        tap(() => (this.isSearchingTo = true)),
        switchMap((q) => this.locationSearchService.search(q)),
      )
      .subscribe((results) => {
        this.toSuggestions = results;
        this.isSearchingTo = false;
      });

    this.subs.push(fromSub, toSub);
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  onFromInput(value: string): void {
    this.fromCoords = null;
    this.fromSearch$.next(value);
  }

  onToInput(value: string): void {
    this.toCoords = null;
    this.toSearch$.next(value);
  }

  selectFrom(result: LocationSearchResult): void {
    this.fromQuery = result.displayName;
    this.fromCoords = `${result.lat},${result.lon}`;
    this.fromSuggestions = [];
  }

  selectTo(result: LocationSearchResult): void {
    this.toQuery = result.displayName;
    this.toCoords = `${result.lat},${result.lon}`;
    this.toSuggestions = [];
  }

  swapAddresses(): void {
    const tempQuery = this.fromQuery;
    const tempCoords = this.fromCoords;
    this.fromQuery = this.toQuery;
    this.fromCoords = this.toCoords;
    this.toQuery = tempQuery;
    this.toCoords = tempCoords;
    this.comparisonItems = [];
    this.selectedItem = null;
    this.staticMapUrl = null;
    this.fromSuggestions = [];
    this.toSuggestions = [];
  }

  async useCurrentLocation(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      const toast = await this.toastController.create({
        message: 'GPS csak mobilon érhető el. Írj be egy címet!',
        duration: 2500,
        color: 'primary',
        position: 'top',
      });
      await toast.present();
      return;
    }

    try {
      const { Geolocation } = await import('@capacitor/geolocation');
      await Geolocation.requestPermissions();
      const pos = await Geolocation.getCurrentPosition({ timeout: 10000 });
      this.fromCoords = `${pos.coords.latitude.toFixed(5)},${pos.coords.longitude.toFixed(5)}`;
      this.fromQuery = 'Jelenlegi helyzet';
      this.fromSuggestions = [];
    } catch {
      const toast = await this.toastController.create({
        message: 'Nem sikerült lekérni a helyzeted.',
        duration: 2500,
        color: 'danger',
        position: 'top',
      });
      await toast.present();
    }
  }

  async compare(): Promise<void> {
    if (!this.fromCoords || !this.toCoords) return;

    this.isComparing = true;
    this.comparisonItems = [];
    this.selectedItem = null;
    this.staticMapUrl = null;

    try {
      const routes: RouteComparison[] = await lastValueFrom(
        this.directionsService.compareAllModes(this.fromCoords, this.toCoords),
      );

      if (!routes || routes.length === 0) {
        const toast = await this.toastController.create({
          message: 'Nem találtunk útvonalat. Ellenőrizd a megadott helyszíneket!',
          duration: 3000,
          color: 'warning',
          position: 'top',
        });
        await toast.present();
        return;
      }

      const items: ComparisonItem[] = routes.map((r) => {
        const cfg = this.modeConfig[r.mode];
        return {
          mode: r.mode,
          label: cfg.label,
          icon: cfg.icon,
          distanceKm: r.distanceKm,
          durationMin: r.durationMin,
          emissionKg: this.calcService.calculateTravelEmission(r.distanceKm, r.mode),
          isGreenest: false,
          isFastest: false,
          polyline: r.polyline,
        };
      });

      const minDuration = Math.min(...items.map((i) => i.durationMin));
      items.forEach((i) => (i.isFastest = i.durationMin === minDuration));

      const nonZeroEmissions = items.filter((i) => i.emissionKg > 0).map((i) => i.emissionKg);
      if (nonZeroEmissions.length === 0) {
        items.forEach((i) => (i.isGreenest = true));
      } else {
        const minEmission = Math.min(...nonZeroEmissions);
        items.forEach((i) => (i.isGreenest = i.emissionKg === minEmission || i.emissionKg === 0));
      }

      items.sort((a, b) => {
        if (a.emissionKg === 0 && b.emissionKg > 0) return -1;
        if (a.emissionKg > 0 && b.emissionKg === 0) return 1;
        return a.emissionKg - b.emissionKg;
      });

      this.comparisonItems = items;
    } catch {
      const toast = await this.toastController.create({
        message: 'Hiba az összehasonlítás során.',
        duration: 3000,
        color: 'danger',
        position: 'top',
      });
      await toast.present();
    } finally {
      this.isComparing = false;
    }
  }

  selectItem(item: ComparisonItem): void {
    if (this.selectedItem?.mode === item.mode) {
      this.selectedItem = null;
      this.staticMapUrl = null;
    } else {
      this.selectedItem = item;
      this.staticMapUrl = null;
    }
  }

  showRouteMap(): void {
    if (!this.selectedItem?.polyline || !this.fromCoords || !this.toCoords) return;
    const key = environment.googleMapsApiKey;
    const polyline = this.selectedItem.polyline;
    this.staticMapUrl =
      `https://maps.googleapis.com/maps/api/staticmap` +
      `?size=600x350&scale=2` +
      `&path=color:0x4CAF50ff%7Cweight:4%7Cenc:${encodeURIComponent(polyline)}` +
      `&markers=color:green%7Clabel:A%7C${this.fromCoords}` +
      `&markers=color:red%7Clabel:B%7C${this.toCoords}` +
      `&key=${key}`;
  }

  openInGoogleMaps(): void {
    if (!this.selectedItem || !this.fromCoords || !this.toCoords) return;
    const modeMap: Record<TransportMode, string> = {
      car: 'driving', motorbike: 'driving',
      bus: 'transit', train: 'transit',
      bicycling: 'bicycling', walking: 'walking',
    };
    const url =
      `https://www.google.com/maps/dir/?api=1` +
      `&origin=${this.fromCoords}` +
      `&destination=${this.toCoords}` +
      `&travelmode=${modeMap[this.selectedItem.mode]}`;
    window.open(url, '_system');
  }

  async saveRoute(): Promise<void> {
    const user = this.authService.currentUser;
    if (!user || !this.selectedItem) return;

    this.isSaving = true;
    try {
      await this.dataService.saveTravelActivity(
        user.uid,
        this.selectedItem.mode,
        this.selectedItem.distanceKm,
        this.selectedItem.durationMin,
        this.selectedItem.emissionKg,
        this.fromQuery,
        this.toQuery,
      );

      const toast = await this.toastController.create({
        message: `Utazás rögzítve! +${this.selectedItem.emissionKg} kg CO₂ adódott a lábnyomodhoz.`,
        duration: 3000,
        color: 'success',
        icon: 'checkmark-circle-outline',
        position: 'top',
      });
      await toast.present();

      this.comparisonItems = [];
      this.selectedItem = null;
      this.staticMapUrl = null;
      this.fromQuery = '';
      this.toQuery = '';
      this.fromCoords = null;
      this.toCoords = null;
    } catch {
      const toast = await this.toastController.create({
        message: 'Hiba történt a mentés során.',
        duration: 3000,
        color: 'danger',
        position: 'top',
      });
      await toast.present();
    } finally {
      this.isSaving = false;
    }
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} perc`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h} ó ${m} perc` : `${h} óra`;
  }
}
