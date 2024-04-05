
export class ActiveProjectService {
    static setActiveProjectId(projectId: string): void {
        localStorage.setItem('activeProjectId', projectId);
    }

    static getActiveProjectId(): string | null {
        return localStorage.getItem('activeProjectId');
    }
}