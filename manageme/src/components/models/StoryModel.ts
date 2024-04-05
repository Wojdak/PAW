import { Project } from "./ProjectModel";
import { User } from "./UserModel";

export enum Priority {
    Low = "low",
    Medium = "medium",
    High = "high",
  }
  
export enum Status {
    Todo = "todo",
    Doing = "doing",
    Done = "done",
}

export interface Story {
    id: string;
    name: string;
    description: string;
    priority: Priority;
    project: Project;
    creationDate: Date;
    status: Status;
    owner: User; 
  }