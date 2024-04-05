import { v4 as uuidv4 } from 'uuid';
import { ApiService } from '../api/ApiService';
import { Story, Priority, Status } from '../models/StoryModel';
import { ActiveProjectService } from '../api/ActiveProjectService';
import { Project } from '../models/ProjectModel';

export class StoryController {
    private storageService: ApiService<Story>;
    private projectService: ApiService<Project>;

    constructor() {
        this.storageService = new ApiService<Story>('stories');
        this.projectService = new ApiService<Story>('projects');
        this.attachStoryFormListener();
    }

    private attachStoryFormListener() {
        const storyForm = document.getElementById('story-form');
        if (storyForm) {
            storyForm.addEventListener('submit', (event) => this.saveStory(event));
        }
    }

    public renderStories() {
        const activeProjectId = ActiveProjectService.getActiveProjectId();
        if (!activeProjectId) return;

        const stories = this.storageService.getAllItems().filter(story => story.project.id === activeProjectId);
        const storiesList = document.getElementById('stories-list');
        if (storiesList) {
            storiesList.innerHTML = '';

            stories.forEach(story => {
                const storyElement = document.createElement('div');
                storyElement.innerHTML = `
                    <h4>${story.name}</h4>
                    <p>${story.description}</p>
                    <p>Priority: ${story.priority}</p>
                    <p>Status: ${story.status}</p>
                    <button onclick="storyController.editStory('${story.id}')">Edit</button>
                    <button onclick="storyController.deleteStory('${story.id}')">Delete</button>
                `;
                storiesList.appendChild(storyElement);
            });
        }
    }

    public saveStory(event: Event) {
        event.preventDefault();

        const nameInput = document.getElementById('story-name') as HTMLInputElement;
        const descriptionInput = document.getElementById('story-description') as HTMLTextAreaElement;
        const prioritySelect = document.getElementById('story-priority') as HTMLSelectElement;
        const statusSelect = document.getElementById('story-status') as HTMLSelectElement;
        const storyIdInput = document.getElementById('story-id') as HTMLInputElement;
        const activeProjectId = ActiveProjectService.getActiveProjectId();

        if (!activeProjectId) {
            alert('No active project selected.');
            return;
        }

        const activeProject = this.projectService.getItemById(activeProjectId)

        const storyData: Story = {
            id: storyIdInput.value || uuidv4(),
            name: nameInput.value,
            description: descriptionInput.value,
            priority: prioritySelect.value as Priority,
            status: statusSelect.value as Status,
            creationDate: new Date(),
            owner: { id: 'user-id', firstName: 'User Name', lastName: 'test' } 
            ,
            project: activeProject
        };

        if (storyIdInput.value) {
            this.storageService.updateItem(storyData);
        } else {
            this.storageService.addItem(storyData);
        }

        this.resetForm();
        this.renderStories();
    }

    public editStory(id: string) {
        const story = this.storageService.getItemById(id);
        if (story) {
            (document.getElementById('story-id') as HTMLInputElement).value = story.id;
            (document.getElementById('story-name') as HTMLInputElement).value = story.name;
            (document.getElementById('story-description') as HTMLTextAreaElement).value = story.description;
            (document.getElementById('story-priority') as HTMLSelectElement).value = story.priority;
            (document.getElementById('story-status') as HTMLSelectElement).value = story.status;
        }
    }

    private resetForm() {
        const storyForm = document.getElementById('story-form');
    }
}
