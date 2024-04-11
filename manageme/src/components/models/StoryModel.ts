export interface Story {
  id: string;
  name: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  projectId: string;
  creationDate: Date;
  state: 'Todo' | 'Doing' | 'Done';
  ownerId: string;
}