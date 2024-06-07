import { ObjectId} from 'mongodb';

export interface User {
  _id?: ObjectId;
  username: string;
  firstName: string;
  lastName: string;
  role: 'Admin' | 'DevOps' | 'Developer';
}