import { UserBadge } from './badge.model';

export interface User {
  id: string;
  password: string;
  email: string;
  username: string;
  allXP: number;
  emission: number;
  badges: UserBadge[];
}