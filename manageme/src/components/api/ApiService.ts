interface Identifiable {
    id: string;
}

export class ApiService<T extends Identifiable> {
    constructor(private storageKey: string) {}

    getAllItems(): T[] {
        const items = localStorage.getItem(this.storageKey);
        return items ? JSON.parse(items) : [];
    }

    getItemById(id: string): T | undefined {
        const items = this.getAllItems();
        return items.find((item: any) => item.id === id);
    }

    addItem(item: T): void {
        const items = this.getAllItems();
        items.push(item);
        localStorage.setItem(this.storageKey, JSON.stringify(items));
    }

    updateItem(updatedItem: T): void {
        let items = this.getAllItems();
        items = items.map((item: any) => item.id === updatedItem.id ? updatedItem : item);
        localStorage.setItem(this.storageKey, JSON.stringify(items));
    }

    deleteItem(id: string): void {
        const items = this.getAllItems().filter((item: any) => item.id !== id);
        localStorage.setItem(this.storageKey, JSON.stringify(items));
    }

    setActiveProjectId(projectId: string): void {
        localStorage.setItem('activeProjectId', projectId);
    }
    
    getActiveProjectId(): string | null {
        return localStorage.getItem('activeProjectId');
    }
    
    setActiveStoryId(storyId: string): void {
        localStorage.setItem('activeStoryId', storyId);
    }
    
    getActiveStoryId(): string | null {
        return localStorage.getItem('activeStoryId');
    }
}