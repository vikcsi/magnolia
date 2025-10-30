export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
}

export const MOCK_USERS: User[] = [
  {
    id: 'mock-user-123',
    email: 'test@magnolia.hu',
    username: 'vilenaaa',
    password: 'jelszo'
  }
];