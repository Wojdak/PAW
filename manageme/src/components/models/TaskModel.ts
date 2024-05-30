import { ObjectId} from 'mongodb';

export interface Task {
    _id?: ObjectId;
    name: string;
    description: string;
    priority: 'Low' | 'Medium' | 'High';
    storyId: string; 
    estimatedTime: string; 
    state: 'Todo' | 'Doing' | 'Done';
    creationDate: Date;
    startDate?: Date;
    endDate?: Date;
    userId?: string;
}