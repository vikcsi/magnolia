import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { registerPlugin } from '@capacitor/core';
import type {
  BackgroundGeolocationPlugin,
  Location,
} from '@capacitor-community/background-geolocation';
import { LocalNotifications } from '@capacitor/local-notifications';

const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>(
  'BackgroundGeolocation',
);
import { TransportMode } from './directions.service';
import { CarbonCalculatorService } from './carbon-calculator.service';
import { ActivitySaveResult, DataService } from './data.service';
import { AuthService } from './auth.service';

export interface TrackingState {
  isTracking: boolean;
  distanceKm: number;
  elapsedSeconds: number;
  stopped: boolean;
}

const STOP_SPEED_THRESHOLD_KMH = 2;
const STOP_DURATION_MS = 5 * 60 * 1000; 

@Injectable({ providedIn: 'root' })
export class TrackingService {
  private calcService = inject(CarbonCalculatorService);
  private dataService = inject(DataService);
  private authService = inject(AuthService);

  private points: { lat: number; lon: number }[] = [];
  private lastMovingAt = 0;
  private timerInterval: any = null;
  private stopCheckInterval: any = null;
  private watcherId: string | null = null;

  readonly state$ = new BehaviorSubject<TrackingState>({
    isTracking: false,
    distanceKm: 0,
    elapsedSeconds: 0,
    stopped: false,
  });

  async requestPermissions(): Promise<boolean> {
    try {
      await LocalNotifications.requestPermissions();
      const { Geolocation } = await import('@capacitor/geolocation');
      const result = await Geolocation.requestPermissions();
      return (
        result.location === 'granted' || result.coarseLocation === 'granted'
      );
    } catch {
      return false;
    }
  }

  async start(): Promise<void> {
    const granted = await this.requestPermissions();
    if (!granted) return;

    this.points = [];
    this.lastMovingAt = Date.now();

    this.patchState({
      isTracking: true,
      distanceKm: 0,
      elapsedSeconds: 0,
      stopped: false,
    });

    this.watcherId = await BackgroundGeolocation.addWatcher(
      {
        backgroundMessage: 'Az útvonal rögzítése folyamatban...',
        backgroundTitle: 'Magnolia – Követés aktív',
        requestPermissions: false,
        stale: false,
        distanceFilter: 10,
      },
      (location: Location | undefined, error: Error | undefined) => {
        if (error || !location) return;
        this.handleLocation(location);
      },
    );

    this.timerInterval = setInterval(() => {
      const current = this.state$.value;
      this.patchState({ elapsedSeconds: current.elapsedSeconds + 1 });
    }, 1000);

    this.stopCheckInterval = setInterval(() => {
      if (
        !this.state$.value.stopped &&
        Date.now() - this.lastMovingAt >= STOP_DURATION_MS
      ) {
        this.detectStop();
      }
    }, 30_000);
  }

  private handleLocation(loc: Location): void {
    const speedKmh = (loc.speed ?? 0) * 3.6;
    const newPoint = { lat: loc.latitude, lon: loc.longitude };

    if (this.points.length > 0) {
      const prev = this.points[this.points.length - 1];
      const delta = this.haversineKm(
        prev.lat,
        prev.lon,
        newPoint.lat,
        newPoint.lon,
      );
      const current = this.state$.value;
      this.patchState({
        distanceKm: Math.round((current.distanceKm + delta) * 100) / 100,
      });
    }

    this.points.push(newPoint);

    if (speedKmh >= STOP_SPEED_THRESHOLD_KMH) {
      this.lastMovingAt = Date.now();
    } else if (Date.now() - this.lastMovingAt >= STOP_DURATION_MS) {
      this.detectStop();
    }
  }

  private async detectStop(): Promise<void> {
    if (this.state$.value.stopped) return;
    this.patchState({ stopped: true });
    await this.stop();
    await this.sendStopNotification();
  }

  async stop(): Promise<void> {
    if (this.watcherId) {
      await BackgroundGeolocation.removeWatcher({ id: this.watcherId });
      this.watcherId = null;
    }
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.stopCheckInterval) {
      clearInterval(this.stopCheckInterval);
      this.stopCheckInterval = null;
    }
    this.patchState({ isTracking: false });
  }

  async saveTrip(mode: TransportMode): Promise<ActivitySaveResult> {
    const user = this.authService.currentUser;
    if (!user) return { completedGoals: [], completedChallenges: [], earnedXp: 0 };

    const { distanceKm, elapsedSeconds } = this.state$.value;
    const emission = this.calcService.calculateTravelEmission(distanceKm, mode);
    const durationMin = Math.round(elapsedSeconds / 60);

    const result = await this.dataService.saveTravelActivity(
      user.uid,
      mode,
      distanceKm,
      durationMin,
      emission,
      '',
      '',
    );

    this.patchState({
      isTracking: false,
      distanceKm: 0,
      elapsedSeconds: 0,
      stopped: false,
    });
    this.points = [];

    return result;
  }

  discardTrip(): void {
    this.patchState({
      isTracking: false,
      distanceKm: 0,
      elapsedSeconds: 0,
      stopped: false,
    });
    this.points = [];
  }

  private async sendStopNotification(): Promise<void> {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: 1001,
            title: 'Megálltál! 🛑',
            body: 'Úgy tűnik megérkeztél. Rögzítsd az utazásod a Magnolia appban!',
            schedule: { at: new Date(Date.now() + 500) },
            actionTypeId: 'TRIP_DONE',
          },
        ],
      });
    } catch {
    }
  }

  private patchState(partial: Partial<TrackingState>): void {
    this.state$.next({ ...this.state$.value, ...partial });
  }

  private haversineKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private toRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }
}
