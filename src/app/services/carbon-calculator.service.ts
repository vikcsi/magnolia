import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CarbonCalculatorService {
  
  private categoryFactors: Record<string, number> = {
    meat: 24.0,       
    dairy: 5.0,       
    bakery: 1.2,      
    vegetable: 0.5,   
    drink: 0.8,       
    other: 2.0        
  };

  private ecoScoreFactors: Record<string, number> = {
    'a': 0.5,
    'b': 1.2,
    'c': 2.5,
    'd': 5.0,
    'e': 10.0
  };

  calculateEmission(weightKg: number, category: string, ecoScore?: string, exactCo2PerKg?: number): number {
    let factor = 0;

    if (exactCo2PerKg !== undefined && exactCo2PerKg !== null) {
      factor = exactCo2PerKg;
      console.log(`Kalkuláció pontos CO2 adattal: ${factor}`);
    } 
    else if (ecoScore && this.ecoScoreFactors[ecoScore.toLowerCase()]) {
      factor = this.ecoScoreFactors[ecoScore.toLowerCase()];
      console.log(`Kalkuláció EcoScore alapján (${ecoScore}): ${factor}`);
    } 
    else {
      factor = this.categoryFactors[category] || this.categoryFactors['other'];
      console.log(`Kalkuláció kategória alapján (${category}): ${factor}`);
    }

    return Number((weightKg * factor).toFixed(2));
  }
}