import { Goal } from '../models/goal.model';

export const FIXED_GOALS: Goal[] = [
  { id: 'goal_meatless_month',   title: 'Növényi fókusz',           description: 'Rögzíts legalább 30 húsmentes bevásárlást egy hónap alatt.',                      targetValue: 30, durationDays: 30, xpReward: 300 },
  { id: 'goal_public_transport', title: 'Tömegközlekedés bajnoka',  description: 'Használj tömegközlekedést (busz vagy vonat) legalább 20 alkalommal 1 hónap alatt.', targetValue: 20, durationDays: 30, xpReward: 250 },
  { id: 'goal_active_travel',    title: 'Aktív utazó',              description: 'Tegyél meg összesen 50 km-t gyalog vagy kerékpárral egy hónap alatt.',              targetValue: 50, durationDays: 30, xpReward: 300 },
  { id: 'goal_co2_reduction',    title: 'Lábnyom zsugorító',        description: 'Tartsd a napi összes CO₂ kibocsátásodat a Párizsi cél (10 kg) alatt 25 napon.',     targetValue: 25, durationDays: 30, xpReward: 400 },
  { id: 'goal_consistent',       title: 'Következetes naplózó',     description: 'Rögzíts valamilyen tevékenységet minden nap, 30 napon keresztül.',                  targetValue: 30, durationDays: 30, xpReward: 200 },
];
