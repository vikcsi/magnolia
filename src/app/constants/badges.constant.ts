import { BadgeDefinition } from '../models/badge.model';

export const BADGES: BadgeDefinition[] = [

  // ═══════════════════════════════════════
  // ELSŐ ALKALMAK (common, 25 XP)
  // ═══════════════════════════════════════

  {
    id: 'first_activity',
    name: 'Első lépés',
    description: 'Rögzítsd az első tevékenységedet.',
    icon: 'footsteps',
    category: 'first',
    rarity: 'common',
    xpReward: 25,
    condition: { type: 'first_activity' },
  },
  {
    id: 'first_travel',
    name: 'Úton-útfélen',
    description: 'Rögzítsd az első utazásodat.',
    icon: 'navigate',
    category: 'first',
    rarity: 'common',
    xpReward: 25,
    condition: { type: 'first_travel' },
  },
  {
    id: 'first_shopping',
    name: 'Tudatos vásárló',
    description: 'Rögzítsd az első bevásárlásodat.',
    icon: 'cart',
    category: 'first',
    rarity: 'common',
    xpReward: 25,
    condition: { type: 'first_shopping' },
  },
  {
    id: 'first_energy',
    name: 'Energia figyelő',
    description: 'Rögzítsd az első energia számlád.',
    icon: 'flash',
    category: 'first',
    rarity: 'common',
    xpReward: 25,
    condition: { type: 'first_energy' },
  },
  {
    id: 'first_goal',
    name: 'Célba értem!',
    description: 'Teljesítsd az első célkitűzésedet.',
    icon: 'flag',
    category: 'first',
    rarity: 'common',
    xpReward: 25,
    condition: { type: 'first_goal_completed' },
  },
  {
    id: 'first_challenge',
    name: 'Kihívás elfogadva',
    description: 'Teljesítsd az első kihívásodat.',
    icon: 'flame',
    category: 'first',
    rarity: 'common',
    xpReward: 25,
    condition: { type: 'first_challenge_completed' },
  },

  // ═══════════════════════════════════════
  // CÉLKITŰZÉS BADGE-EK (rare, célonként)
  // ═══════════════════════════════════════

  {
    id: 'goal_meatless_month',
    name: 'Zöld szakács',
    description: 'Teljesítsd a "Növényi fókusz" célkitűzést.',
    icon: 'nutrition',
    category: 'goal',
    rarity: 'rare',
    xpReward: 50,
    condition: { type: 'specific_goal_completed', targetId: 'goal_meatless_month' },
  },
  {
    id: 'goal_public_transport',
    name: 'BKV bajnok',
    description: 'Teljesítsd a "Tömegközlekedés bajnoka" célkitűzést.',
    icon: 'bus',
    category: 'goal',
    rarity: 'rare',
    xpReward: 50,
    condition: { type: 'specific_goal_completed', targetId: 'goal_public_transport' },
  },
  {
    id: 'goal_active_travel',
    name: 'Aktív mozgó',
    description: 'Teljesítsd az "Aktív utazó" célkitűzést.',
    icon: 'bicycle',
    category: 'goal',
    rarity: 'rare',
    xpReward: 50,
    condition: { type: 'specific_goal_completed', targetId: 'goal_active_travel' },
  },
  {
    id: 'goal_co2_reduction',
    name: 'Lábnyom mester',
    description: 'Teljesítsd a "Lábnyom zsugorító" célkitűzést.',
    icon: 'earth',
    category: 'goal',
    rarity: 'epic',
    xpReward: 75,
    condition: { type: 'specific_goal_completed', targetId: 'goal_co2_reduction' },
  },
  {
    id: 'goal_consistent',
    name: 'Vas szorgalom',
    description: 'Teljesítsd a "Következetes naplózó" célkitűzést.',
    icon: 'calendar',
    category: 'goal',
    rarity: 'rare',
    xpReward: 50,
    condition: { type: 'specific_goal_completed', targetId: 'goal_consistent' },
  },
  {
    id: 'all_goals',
    name: 'Öko mester',
    description: 'Teljesítsd az összes célkitűzést legalább egyszer.',
    icon: 'shield-checkmark',
    category: 'goal',
    rarity: 'legendary',
    xpReward: 200,
    condition: { type: 'all_goals_completed' },
  },

  // ═══════════════════════════════════════
  // KIHÍVÁS MÉRFÖLDKÖVEK
  // ═══════════════════════════════════════

  {
    id: 'challenge_5',
    name: 'Kihívás kezdő',
    description: 'Teljesíts 5 kihívást.',
    icon: 'ribbon',
    category: 'challenge',
    rarity: 'common',
    xpReward: 50,
    condition: { type: 'challenge_count', targetValue: 5 },
  },
  {
    id: 'challenge_10',
    name: 'Kihívás harcos',
    description: 'Teljesíts 10 kihívást.',
    icon: 'medal',
    category: 'challenge',
    rarity: 'rare',
    xpReward: 100,
    condition: { type: 'challenge_count', targetValue: 10 },
  },
  {
    id: 'challenge_20',
    name: 'Kihívás veterán',
    description: 'Teljesíts 20 kihívást.',
    icon: 'trophy',
    category: 'challenge',
    rarity: 'epic',
    xpReward: 150,
    condition: { type: 'challenge_count', targetValue: 20 },
  },
  {
    id: 'challenge_50',
    name: 'Kihívás legenda',
    description: 'Teljesíts 50 kihívást.',
    icon: 'diamond',
    category: 'challenge',
    rarity: 'legendary',
    xpReward: 300,
    condition: { type: 'challenge_count', targetValue: 50 },
  },

  // ═══════════════════════════════════════
  // TEVÉKENYSÉG MÉRFÖLDKÖVEK
  // ═══════════════════════════════════════

  {
    id: 'activity_10',
    name: 'Szorgalmas naplózó',
    description: 'Rögzíts 10 tevékenységet.',
    icon: 'clipboard',
    category: 'activity',
    rarity: 'common',
    xpReward: 50,
    condition: { type: 'activity_count', targetValue: 10 },
  },
  {
    id: 'activity_50',
    name: 'Rutinosodó eco harcos',
    description: 'Rögzíts 50 tevékenységet.',
    icon: 'stats-chart',
    category: 'activity',
    rarity: 'rare',
    xpReward: 100,
    condition: { type: 'activity_count', targetValue: 50 },
  },
  {
    id: 'activity_100',
    name: 'Század vitéz',
    description: 'Rögzíts 100 tevékenységet.',
    icon: 'star',
    category: 'activity',
    rarity: 'epic',
    xpReward: 150,
    condition: { type: 'activity_count', targetValue: 100 },
  },
  {
    id: 'activity_500',
    name: 'Elkötelezett zöld harcos',
    description: 'Rögzíts 500 tevékenységet.',
    icon: 'rocket',
    category: 'activity',
    rarity: 'legendary',
    xpReward: 300,
    condition: { type: 'activity_count', targetValue: 500 },
  },

  // ═══════════════════════════════════════
  // SZINT BADGE-EK
  // ═══════════════════════════════════════

  {
    id: 'level_5',
    name: 'Fiatal fa',
    description: 'Érj el az 5. szintre.',
    icon: 'leaf',
    category: 'level',
    rarity: 'epic',
    xpReward: 100,
    condition: { type: 'level_reached', targetValue: 5 },
  },
  {
    id: 'level_max',
    name: 'Gaia bajnoka',
    description: 'Érd el a maximális szintet.',
    icon: 'planet',
    category: 'level',
    rarity: 'legendary',
    xpReward: 500,
    condition: { type: 'max_level' },
  },

  // ═══════════════════════════════════════
  // STREAK BADGE-EK
  // ═══════════════════════════════════════

  {
    id: 'streak_7',
    name: 'Heti hős',
    description: 'Tarts fenn 7 napos sorozatot.',
    icon: 'bonfire',
    category: 'streak',
    rarity: 'rare',
    xpReward: 75,
    condition: { type: 'streak_days', targetValue: 7 },
  },
  {
    id: 'streak_30',
    name: 'Havi megállíthatatlan',
    description: 'Tarts fenn 30 napos sorozatot.',
    icon: 'infinite',
    category: 'streak',
    rarity: 'epic',
    xpReward: 150,
    condition: { type: 'streak_days', targetValue: 30 },
  },
];