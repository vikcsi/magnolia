import { Injectable } from '@angular/core';

export interface OffProduct {
  barcode: string;
  name: string;
  brands?: string;
  imageUrl?: string;
  ecoScore?: string;
  exactCo2?: number;
}

@Injectable({
  providedIn: 'root'
})
export class OpenFoodFactsService {
  private readonly baseUrl = 'https://world.openfoodfacts.org/api/v2/product';

  async getProductByBarcode(barcode: string): Promise<OffProduct | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${barcode}.json?fields=product_name,brands,image_front_url,ecoscore_grade,ecoscore_data`);
      const data = await response.json();

      if (data.status === 1 && data.product) {
        let co2Value: number | undefined = undefined;
        if (data.product.ecoscore_data && data.product.ecoscore_data.agribalyse) {
          co2Value = data.product.ecoscore_data.agribalyse.co2_total;
        }

        return {
          barcode: barcode,
          name: data.product.product_name || 'Ismeretlen termék',
          brands: data.product.brands || 'Ismeretlen márka',
          imageUrl: data.product.image_front_url,
          ecoScore: data.product.ecoscore_grade,
          exactCo2: co2Value
        };
      }
      return null;
    } catch (error) {
      console.error('Hiba történt az API hívásakor:', error);
      return null;
    }
  }
}