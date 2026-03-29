import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, forkJoin, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { environment } from 'src/environments/environment';

export type TransportMode = 'car' | 'motorbike' | 'bus' | 'train' | 'bicycling' | 'walking';

export interface RouteResult {
  distanceKm: number;
  durationMin: number;
  polyline?: string;
}

export interface RouteComparison {
  mode: TransportMode;
  distanceKm: number;
  durationMin: number;
  polyline?: string;
}

const USE_MOCK = false;

const MOCK_RESULT: RouteResult = { distanceKm: 5.2, durationMin: 18 };

@Injectable({ providedIn: 'root' })
export class DirectionsService {
  private http = inject(HttpClient);

  private readonly nativeApiUrl = 'https://maps.googleapis.com/maps/api/directions/json';
  private readonly browserApiUrl = '/maps-api/maps/api/directions/json';

  getDirections(origin: string, destination: string, mode: TransportMode): Observable<RouteResult | null> {
    if (USE_MOCK) {
      return of(MOCK_RESULT);
    }

    const googleMode = this.toGoogleMode(mode);
    const params: Record<string, string> = {
      origin,
      destination,
      mode: googleMode,
      key: environment.googleMapsApiKey,
    };
    if (mode === 'train') {
      params['transit_mode'] = 'rail';
    }

    if (Capacitor.isNativePlatform()) {
      return from(CapacitorHttp.get({ url: this.nativeApiUrl, params })).pipe(
        map((response) => this.parseDirectionsResponse(response.data)),
        catchError(() => of(null)),
      );
    }

    let httpParams = new HttpParams();
    Object.entries(params).forEach(([k, v]) => { httpParams = httpParams.set(k, v); });

    return this.http.get<any>(this.browserApiUrl, { params: httpParams }).pipe(
      map((res) => this.parseDirectionsResponse(res)),
      catchError(() => of(null)),
    );
  }

  private parseDirectionsResponse(res: any): RouteResult | null {
    if (res.status !== 'OK' || !res.routes?.length) return null;
    const leg = res.routes[0].legs[0];
    return {
      distanceKm: Number((leg.distance.value / 1000).toFixed(2)),
      durationMin: Math.round(leg.duration.value / 60),
      polyline: res.routes[0].overview_polyline?.points,
    };
  }

  compareAllModes(origin: string, destination: string): Observable<RouteComparison[]> {
    if (USE_MOCK) {
      const mockItems: RouteComparison[] = [
        { mode: 'car', distanceKm: 12.4, durationMin: 22 },
        { mode: 'motorbike', distanceKm: 12.4, durationMin: 20 },
        { mode: 'bus', distanceKm: 14.1, durationMin: 38 },
        { mode: 'bicycling', distanceKm: 11.8, durationMin: 52 },
        { mode: 'walking', distanceKm: 11.5, durationMin: 138 },
      ];
      return of(mockItems);
    }

    return forkJoin([
      this.getDirections(origin, destination, 'car'),
      this.getDirections(origin, destination, 'bus'),
      this.getDirections(origin, destination, 'bicycling'),
      this.getDirections(origin, destination, 'walking'),
    ]).pipe(
      map(([drivingResult, transitResult, bicyclingResult, walkingResult]) => {
        const items: RouteComparison[] = [];

        if (drivingResult) {
          items.push({ mode: 'car', distanceKm: drivingResult.distanceKm, durationMin: drivingResult.durationMin, polyline: drivingResult.polyline });
          items.push({ mode: 'motorbike', distanceKm: drivingResult.distanceKm, durationMin: drivingResult.durationMin, polyline: drivingResult.polyline });
        }
        if (transitResult) {
          items.push({ mode: 'bus', distanceKm: transitResult.distanceKm, durationMin: transitResult.durationMin, polyline: transitResult.polyline });
        }
        if (bicyclingResult) {
          items.push({ mode: 'bicycling', distanceKm: bicyclingResult.distanceKm, durationMin: bicyclingResult.durationMin, polyline: bicyclingResult.polyline });
        }
        if (walkingResult) {
          items.push({ mode: 'walking', distanceKm: walkingResult.distanceKm, durationMin: walkingResult.durationMin, polyline: walkingResult.polyline });
        }

        return items;
      }),
      catchError(() => of([])),
    );
  }

  private toGoogleMode(mode: TransportMode): string {
    switch (mode) {
      case 'car':
      case 'motorbike':
        return 'driving';
      case 'bus':
      case 'train':
        return 'transit';
      case 'bicycling':
        return 'bicycling';
      case 'walking':
        return 'walking';
    }
  }
}
