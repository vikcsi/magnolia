import { Goal } from '../models/goal.model';

export const FIXED_GOALS: Goal[] = [
  { id: 'goal_meatless_month', title: 'Növényi fókusz', description: 'Vásárolj kizárólag növényi alapú (húsmentes) élelmiszereket 30 napig.', targetValue: 30, durationDays: 30, xpReward: 300 },
  { id: 'goal_public_transport', title: 'Tömegközlekedés bajnoka', description: 'Használj tömegközlekedést legalább 20 alkalommal a következő 1 hónapban.', targetValue: 20, durationDays: 30, xpReward: 250 },
  { id: 'goal_energy_saver', title: 'Energia diéta', description: 'Csökkentsd az áramfogyasztásodat 10%-kal az előző havi átlagodhoz képest.', targetValue: 10, durationDays: 30, xpReward: 200 },
  { id: 'goal_local_produce', title: 'Helyi termékek', description: 'Vásárolj helyi/hazai termékeket legalább 10 alkalommal egy hónap alatt.', targetValue: 10, durationDays: 30, xpReward: 150 },
  { id: 'goal_active_travel', title: 'Aktív utazó', description: 'Tegyél meg összesen 50 km-t gyalog vagy kerékpárral egy hónap alatt.', targetValue: 50, durationDays: 30, xpReward: 300 },
  { id: 'goal_zero_waste', title: 'Tudatos csomagolás', description: 'Kerüld a műanyag csomagolású termékeket 30 bevásárlás alkalmával.', targetValue: 30, durationDays: 30, xpReward: 250 },
  { id: 'goal_co2_reduction', title: 'Lábnyom zsugorító', description: 'Tartsd a napi átlagos CO₂ kibocsátásodat a Párizsi cél (10kg) alatt 25 napig.', targetValue: 25, durationDays: 30, xpReward: 400 },
  { id: 'goal_consistent', title: 'Következetes naplózó', description: 'Rögzíts valamilyen tevékenységet minden nap, 30 napon keresztül.', targetValue: 30, durationDays: 30, xpReward: 200 }
];