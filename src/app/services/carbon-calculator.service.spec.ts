import { TestBed } from '@angular/core/testing';
import { CarbonCalculatorService } from './carbon-calculator.service';

describe('CarbonCalculatorService', () => {
  let service: CarbonCalculatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CarbonCalculatorService);
  });

  // --- calculateTravelEmission ---

  it('should calculate car emission correctly', () => {
    // 100 km * 0.171 kg/km = 17.1 kg
    expect(service.calculateTravelEmission(100, 'car')).toBeCloseTo(17.1, 2);
  });

  it('should return 0 for bicycle and walking', () => {
    expect(service.calculateTravelEmission(50, 'bicycling')).toBe(0);
    expect(service.calculateTravelEmission(50, 'walking')).toBe(0);
  });

  it('should fall back to car factor for unknown travel mode', () => {
    const car = service.calculateTravelEmission(10, 'car');
    const unknown = service.calculateTravelEmission(10, 'spaceship');
    expect(unknown).toBeCloseTo(car, 2);
  });

  it('train emission should be lower than bus, which is lower than car', () => {
    const km = 100;
    const train = service.calculateTravelEmission(km, 'train');
    const bus = service.calculateTravelEmission(km, 'bus');
    const car = service.calculateTravelEmission(km, 'car');
    expect(train).toBeLessThan(bus);
    expect(bus).toBeLessThan(car);
  });

  // --- mapApiCategoriesToLocal ---

  it('should map beef keyword to meat_beef category', () => {
    expect(service.mapApiCategoriesToLocal(['beef', 'en:meats'])).toBe('meat_beef');
  });

  it('should map water keyword to drink_water category', () => {
    expect(service.mapApiCategoriesToLocal(['mineral-waters', 'beverages'])).toBe('drink_water');
  });

  it('should return "other" for empty tag list', () => {
    expect(service.mapApiCategoriesToLocal([])).toBe('other');
  });

  it('should return "other" for unrecognised tags', () => {
    expect(service.mapApiCategoriesToLocal(['en:unknown-category', 'xyz'])).toBe('other');
  });

  // --- calculateEmission ---

  it('should use exactCo2PerKg when provided', () => {
    // 0.5 kg * 5 kg CO2/kg = 2.5 kg CO2
    expect(service.calculateEmission(0.5, 'other', undefined, 5)).toBeCloseTo(2.5, 2);
  });

  it('should apply ecoScore multiplier (A = 0.8) to base factor', () => {
    const withoutEco = service.calculateEmission(1, 'dairy_milk');
    const withEcoA = service.calculateEmission(1, 'dairy_milk', 'a');
    expect(withEcoA).toBeCloseTo(withoutEco * 0.8, 2);
  });

  it('should apply ecoScore multiplier (E = 1.2) to base factor', () => {
    const withoutEco = service.calculateEmission(1, 'fruit');
    const withEcoE = service.calculateEmission(1, 'fruit', 'e');
    expect(withEcoE).toBeCloseTo(withoutEco * 1.2, 2);
  });

  it('should fall back to "other" factor for unknown category', () => {
    // other = 2.0 kg CO2/kg
    expect(service.calculateEmission(2, 'totally_unknown_category')).toBeCloseTo(4.0, 2);
  });

  it('exactCo2PerKg should take precedence over ecoScore', () => {
    // If exactCo2PerKg is provided, ecoScore multiplier must NOT be applied
    expect(service.calculateEmission(1, 'meat_beef', 'a', 3.0)).toBeCloseTo(3.0, 2);
  });
});
