import { Router } from 'express';
import { getStories, getStoryById, createStory, updateStory, deleteStory } from '../controllers/storyController';

const router = Router();

router.get('/', getStories);
router.get('/:id', getStoryById);
router.post('/', createStory);
router.put('/:id', updateStory);
router.delete('/:id', deleteStory);

export default router;
