export interface User {
  id: string,
  email: string,
  username: string,
  allXP : number,
  emission : number,
  streak : number,
  friends : string[],
  badges : string[],
  activities : string[]
}

export interface Badge {
    id: string,
    name : string,
    xp : number,
    icon: string
}

export const MOCK_USERS: User[] = [
  {
    id: 'mock-user-123',
    email: 'test@magnolia.hu',
    username: 'vilenaaa',
    allXP : 0,
    emission : 0,
    streak : 0,
    friends : [],
    badges : [],
    activities : []
  }
];