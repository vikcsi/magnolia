import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CarbonCalculatorService {
  private categoryFactors: Record<string, number> = {
    meat_beef: 60.0,
    meat_pork: 7.6,
    meat_poultry: 6.9,
    fish: 6.0,
    dairy_cheese: 21.0,
    dairy_milk: 3.2,
    egg: 4.5,
    bakery: 1.6,
    fruit: 1.5,
    vegetable: 2.0,
    legumes: 1.8,
    nuts: 2.3,
    rice: 4.0,
    coffee: 28.5,
    snack_sweet: 11.0,
    snack_salty: 2.5,
    drink_water: 0.2,
    drink_soda: 0.5,
    drink_juice: 0.9,
    drink_alcohol: 1.5,
    other: 2.0,
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
    {
      category: 'coffee',
      keywords: ['coffee', 'kávé', 'café', 'espresso', 'cappuccino', 'latte'],
    },
    { category: 'rice', keywords: ['rice', 'rizs', 'riz'] },
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
    {
      category: 'legumes',
      keywords: [
        'bean',
        'bab',
        'lentil',
        'lencse',
        'chickpea',
        'csicseriborsó',
        'legume',
      ],
    },
    {
      category: 'nuts',
      keywords: [
        'nut',
        'dió',
        'almond',
        'mandula',
        'cashew',
        'peanut',
        'mogyoró',
        'pistachio',
      ],
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
    car: 0.17,
    motorbike: 0.103,
    bus: 0.089,
    train: 0.035,
    bicycling: 0,
    walking: 0,
  };

  calculateTravelEmission(distanceKm: number, mode: string): number {
    const factor = this.travelFactors[mode] ?? this.travelFactors['car'];
    return Number((distanceKm * factor).toFixed(3));
  }

  // kg CO2 / egység (electricity: kWh, gas: m³, water: m³)
  private energyFactors: Record<string, number> = {
    electricity: 0.170,
    gas: 2.04,
    water: 0.35,
  };

  calculateEnergyEmission(amount: number, type: string): number {
    const factor = this.energyFactors[type] ?? 0;
    return Math.round(amount * factor * 10) / 10;
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
