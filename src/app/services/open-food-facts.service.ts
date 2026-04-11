import { Injectable } from '@angular/core';
import { CapacitorHttp, HttpResponse } from '@capacitor/core';

export interface OffProduct {
  barcode: string;
  name: string;
  brands?: string;
  imageUrl?: string;
  ecoScore?: string;
  exactCo2?: number;
  category?: string;
  offCategories?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class OpenFoodFactsService {
  private readonly baseUrl = 'https://world.openfoodfacts.org/api/v2/product';

  async getProductByBarcode(barcode: string): Promise<OffProduct | null> {
    try {
      const response: HttpResponse = await CapacitorHttp.get({
        url: `${this.baseUrl}/${barcode}.json`,
        params: {
          fields: 'product_name,brands,image_front_url,ecoscore_grade,ecoscore_data,categories_tags',
        },
      });
      const data = response.data;

      if (data.status === 1 && data.product) {
        let co2Value: number | undefined = undefined;
        if (data.product.ecoscore_data && data.product.ecoscore_data.agribalyse) {
          const raw = data.product.ecoscore_data.agribalyse.co2_total;
          // Csak reális értéket fogadunk el (0.01–50 kg CO₂/kg)
          if (typeof raw === 'number' && raw >= 0.01 && raw <= 50) {
            co2Value = raw;
          }
        }

        return {
          barcode: barcode,
          name: data.product.product_name || 'Ismeretlen termék',
          brands: data.product.brands || 'Ismeretlen márka',
          imageUrl: data.product.image_front_url,
          ecoScore: data.product.ecoscore_grade,
          exactCo2: co2Value,
          offCategories: data.product.categories_tags || [],
        };
      }
      return null;
    } catch (error) {
      console.error('Hiba történt az API hívásakor:', error);
      return null;
    }
  }
}