export class ActiveProjectService {
    private static activeProjectId: string | null = null;

    static setActiveProjectId(projectId: string): void {
        this.activeProjectId = projectId;
    }

    static getActiveProjectId(): string | null {
        return this.activeProjectId;
    }
}