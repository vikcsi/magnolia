export interface Goal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  durationDays: number;
  xpReward: number;
}

export interface UserGoal {
  id?: string;
  userId: string;
  goalId: string;
  progress: number;
  startDate: Date;
  completedAt?: Date;
  lastUpdatedDate?: Date;
  status: 'active' | 'completed' | 'failed';
}
