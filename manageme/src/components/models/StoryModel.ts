import { ObjectId} from 'mongodb';

export interface Story {
  _id?: ObjectId;
  name: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  projectId: string;
  creationDate: Date;
  state: 'Todo' | 'Doing' | 'Done';
  ownerId: ObjectId;
}