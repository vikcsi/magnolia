import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CarbonCalculatorService {
  private categoryFactors: Record<string, number> = {
    meat_beef: 27.0, // Marha és bárány (nagyon magas)
    meat_pork: 12.1, // Sertés
    meat_poultry: 6.9, // Baromfi
    fish: 6.0, // Halak, tenger gyümölcsei
    dairy_cheese: 21.2, // Sajtok (magas)
    dairy_milk: 2.8, // Tej, joghurt, kefir
    egg: 4.5, // Tojás
    bakery: 1.2, // Pékáru, tészta
    fruit: 0.4, // Gyümölcsök
    vegetable: 0.5, // Zöldségek
    snack_sweet: 3.4, // Csokoládé, édesség (kakaó miatt magasabb)
    snack_salty: 2.5, // Chips, sós rágcsálnivalók
    drink_water: 0.2, // Ásványvíz
    drink_soda: 0.5, // Cukros üdítők (kóla, energiaital)
    drink_juice: 0.9, // Gyümölcslevek (mezőgazdasági teher miatt)
    drink_alcohol: 1.5, // Sör, bor, rövidital
    other: 2.0, // Általános biztonsági tartalék
  };

  private readonly categoryMappings = [
    { category: 'meat_beef', keywords: ['beef', 'marha', 'bœuf', 'lamb'] },
    {
      category: 'meat_pork',
      keywords: [
        'pork',
        'sertés',
        'porc',
        'ham',
        'meat',
        'hús',
        'viande',
        'sausage',
      ],
    },
    {
      category: 'meat_poultry',
      keywords: ['chicken', 'poultry', 'csirke', 'baromfi'],
    },
    { category: 'fish', keywords: ['fish', 'hal', 'seafood', 'poisson'] },
    { category: 'dairy_cheese', keywords: ['cheese', 'sajt', 'fromage'] },
    {
      category: 'dairy_milk',
      keywords: [
        'milk',
        'tej',
        'lait',
        'yogurt',
        'joghurt',
        'kefir',
        'dairy',
        'tejtermék',
      ],
    },
    { category: 'egg', keywords: ['egg', 'tojás', 'œuf'] },
    {
      category: 'drink_water',
      keywords: [
        'water',
        'víz',
        'eau',
        'mineral-waters',
        'ásványvizek',
        'spring',
      ],
    },
    {
      category: 'drink_juice',
      keywords: ['juice', 'gyümölcslé', 'jus', 'nectar', 'fruit-juices'],
    },
    {
      category: 'drink_soda',
      keywords: [
        'soda',
        'cola',
        'üdítő',
        'beverage',
        'drink',
        'szénsavas',
        'energy',
        'tutti',
      ],
    },
    {
      category: 'drink_alcohol',
      keywords: ['alcohol', 'beer', 'wine', 'sör', 'bor', 'vodka', 'spirit'],
    },
    { category: 'fruit', keywords: ['fruit', 'gyümölcs', 'fruits'] },
    {
      category: 'vegetable',
      keywords: ['vegetable', 'zöldség', 'légumes', 'plant'],
    },
    {
      category: 'bakery',
      keywords: [
        'bread',
        'kenyér',
        'bakery',
        'pékáru',
        'pasta',
        'tészta',
        'pastries',
        'sütemény',
      ],
    },
    {
      category: 'snack_sweet',
      keywords: [
        'chocolate',
        'csoki',
        'chocolat',
        'sweet',
        'dessert',
        'édesség',
        'candy',
        'cukorka',
      ],
    },
    {
      category: 'snack_salty',
      keywords: ['chips', 'snack', 'crisps', 'salty', 'sós'],
    },
  ];

  private ecoScoreMultipliers: Record<string, number> = {
    a: 0.8,
    b: 0.9,
    c: 1.0,
    d: 1.1,
    e: 1.2,
  };

  // kg CO2 / km / utas (EU átlagok alapján)
  private travelFactors: Record<string, number> = {
    car: 0.171,
    motorbike: 0.113,
    bus: 0.089,
    train: 0.035,
    bicycling: 0,
    walking: 0,
  };

  calculateTravelEmission(distanceKm: number, mode: string): number {
    const factor = this.travelFactors[mode] ?? this.travelFactors['car'];
    return Number((distanceKm * factor).toFixed(3));
  }

  mapApiCategoriesToLocal(tags: string[]): string {
    if (!tags || tags.length === 0) return 'other';

    const combinedTags = tags.join(' ').toLowerCase();

    for (const mapping of this.categoryMappings) {
      if (mapping.keywords.some((keyword) => combinedTags.includes(keyword))) {
        return mapping.category;
      }
    }

    return 'other';
  }

  calculateEmission(
    weightKg: number,
    category: string,
    ecoScore?: string,
    exactCo2PerKg?: number,
  ): number {
    let finalFactor = 0;

    if (exactCo2PerKg !== undefined && exactCo2PerKg !== null) {
      finalFactor = exactCo2PerKg;
    } else {
      const baseFactor =
        this.categoryFactors[category] || this.categoryFactors['other'];

      if (ecoScore && this.ecoScoreMultipliers[ecoScore.toLowerCase()]) {
        const multiplier = this.ecoScoreMultipliers[ecoScore.toLowerCase()];
        finalFactor = baseFactor * multiplier;
      } else {
        finalFactor = baseFactor;
      }
    }

    return Number((weightKg * finalFactor).toFixed(2));
  }
}
