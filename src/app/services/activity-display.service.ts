import { Injectable } from '@angular/core';
import { Activity, Travel, Energy } from 'src/app/models/activity.model';

@Injectable({ providedIn: 'root' })
export class ActivityDisplayService {
  getIcon(activity: Activity): string {
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

  getLabel(activity: Activity): string {
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
}
