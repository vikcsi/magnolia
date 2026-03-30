export interface LevelDefinition {
  level: number;
  name: string;
  requiredXp: number;
}

export const LEVELS: LevelDefinition[] = [
  { level: 1, name: 'Mag', requiredXp: 0 },
  { level: 2, name: 'Csíra', requiredXp: 150 },
  { level: 3, name: 'Palánta', requiredXp: 400 },
  { level: 4, name: 'Csemete', requiredXp: 800 },
  { level: 5, name: 'Fiatal Fa', requiredXp: 1500 },
  { level: 6, name: 'Virágzó Fakorona', requiredXp: 3000 },
  { level: 7, name: 'Stabil Tölgy', requiredXp: 5500 },
  { level: 8, name: 'Védelmező Lombkorona', requiredXp: 10000 },
  { level: 9, name: 'Ősi Rengeteg', requiredXp: 18000 },
  { level: 10, name: 'Gaia Bajnoka', requiredXp: 30000 }
];

export function getCurrentLevel(xp: number): LevelDefinition {
  return LEVELS.slice().reverse().find(l => xp >= l.requiredXp) || LEVELS[0];
}

export function getNextLevel(xp: number): LevelDefinition | null {
  const current = getCurrentLevel(xp);
  return LEVELS.find(l => l.level === current.level + 1) || null;
}