export interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: 'Admin' | 'DevOps' | 'Developer';
}