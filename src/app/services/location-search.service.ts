import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface LocationSearchResult {
  displayName: string;
  lat: string;
  lon: string;
}

@Injectable({ providedIn: 'root' })
export class LocationSearchService {
  private http = inject(HttpClient);

  search(query: string): Observable<LocationSearchResult[]> {
    if (!query || query.trim().length < 3) {
      return of([]);
    }

    const params = new HttpParams()
      .set('q', query.trim())
      .set('limit', '5')
      .set('lat', '46.253') 
      .set('lon', '20.148');

    return this.http
      .get<any>('https://photon.komoot.io/api/', { params })
      .pipe(
        map((response) =>
          response.features.map((f: any) => {
            const props = f.properties;
            const displayName = [props.name, props.city, props.street]
              .filter(Boolean)
              .join(', ');

            return {
              displayName: displayName || 'Ismeretlen hely',
              lat: f.geometry.coordinates[1].toString(),
              lon: f.geometry.coordinates[0].toString(),
            };
          })
        ),
        catchError((error) => {
          console.error('Photon API hiba a címkeresésnél:', error);
          return of([]);
        })
      );
  }
}