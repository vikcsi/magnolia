export type ChallengeMetric = 
    | 'distance' 
    | 'count' 
    | 'meatless_shopping' 
    | 'low_carbon_shopping';

export interface Challenge {
    id: string;
    name: string;
    desc: string;
    icon: string;
    category: 'travel' | 'shopping' | 'energy' | 'mixed';
    difficulty: 'easy' | 'medium' | 'hard';
    metric: ChallengeMetric;
    targetValue: number;
    targetCondition?: string[];
    xpReward: number;
    durationDays: number;
}

export interface UserChallenge {
    id?: string;
    userId: string;
    challengeId: string;
    progress: number;
    joinedAt: Date;
    expiresAt: Date;
    status: 'active' | 'completed' | 'failed';
}