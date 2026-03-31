export interface Friendship {
  id?: string;
  user1: string;
  user2: string;
  requesterId: string;
  status: 'pending' | 'accepted';
  createdAt: any;
  updatedAt?: any;
}
