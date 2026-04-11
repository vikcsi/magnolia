import { UserBadge } from './badge.model';

export interface User {
  id: string;
  email: string;
  username: string;
  allXP: number;
  emission: number;
  badges: UserBadge[];
}