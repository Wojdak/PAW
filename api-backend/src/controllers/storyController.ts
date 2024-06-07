import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { db } from '../config/db';

export const getStories = async (req: Request, res: Response) => {
    const { projectId } = req.query;
    console.log(projectId);
    let query = {};

    if (projectId) {
        query = { projectId: new ObjectId(projectId as string) };
    }

    try {
        const stories = await db.collection('Stories').find(query).toArray();
        res.status(200).json(stories);
    } catch (error) {
        console.error('Error fetching stories:', error);
        res.status(500).send('Internal Server Error');
    }
};

export const getStoryById = async (req: Request, res: Response) => {
    try {
        const story = await db.collection('Stories').findOne({ _id: new ObjectId(req.params.id) });
        res.status(200).json(story);
    } catch (error) {
        console.error('Error fetching story:', error);
        res.status(500).send('Internal Server Error');
    }
};

export const createStory = async (req: Request, res: Response) => {
    const story = req.body;

    story.projectId = new ObjectId(story.projectId);
    story.creationDate = new Date(story.creationDate);
    story.ownerId = new ObjectId(story.ownerId);

    try {
        const result = await db.collection('Stories').insertOne(story);
        res.status(201).json(result);
    } catch (error) {
        console.error('Error creating story:', error);
        res.status(500).send('Internal Server Error');
    }
};

export const updateStory = async (req: Request, res: Response) => {
    const { id } = req.params;
    const story = req.body;

    story.projectId = new ObjectId(story.projectId);
    story.creationDate = new Date(story.creationDate);
    story.ownerId = new ObjectId(story.ownerId);

    const updateStory = { ...story };
    delete updateStory._id;

    try {
        const result = await db.collection('Stories').updateOne(
            { _id: new ObjectId(id) },
            { $set: updateStory }
        );
        res.status(200).json(result);
    } catch (error) {
        console.error('Error updating story:', error);
        res.status(500).send('Internal Server Error');
    }
};

export const deleteStory = async (req: Request, res: Response) => {
    try {
        const result = await db.collection('Stories').deleteOne({ _id: new ObjectId(req.params.id) });
        res.status(200).json(result);
    } catch (error) {
        console.error('Error deleting story:', error);
        res.status(500).send('Internal Server Error');
    }
};
