import { ObjectId} from 'mongodb';

export interface Project{
    _id?: ObjectId;
    name: string;
    description: string;
}