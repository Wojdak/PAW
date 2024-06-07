import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { db } from '../config/db';

export const getTasks = async (req: Request, res: Response) => {
    const { storyId, userId } = req.query;
    let query: any = {};

    if (storyId) {
        query.storyId = new ObjectId(storyId as string);
    }

    if (userId) {
        query.userId = new ObjectId(userId as string);
    }

    try {
        const tasks = await db.collection('Tasks').find(query).toArray();
        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).send('Internal Server Error');
    }
};

export const getTaskById = async (req: Request, res: Response) => {
    try {
        const task = await db.collection('Tasks').findOne({ _id: new ObjectId(req.params.id) });
        res.status(200).json(task);
    } catch (error) {
        console.error('Error fetching task:', error);
        res.status(500).send('Internal Server Error');
    }
};

export const createTask = async (req: Request, res: Response) => {
    const task = req.body;

    task.storyId = new ObjectId(task.storyId);
    task.creationDate = new Date(task.creationDate);

    try {
        const result = await db.collection('Tasks').insertOne(task);
        res.status(201).json(result);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).send('Internal Server Error');
    }
};

export const updateTask = async (req: Request, res: Response) => {
    const { id } = req.params;
    const task = req.body;

    try {
        task.storyId = new ObjectId(task.storyId);
        task.creationDate = new Date(task.creationDate);

        if (task.userId) {
            task.userId = new ObjectId(task.userId);
        } else {
            task.userId = null;
        }

        if (task.startDate) {
            task.startDate = new Date(task.startDate);
        } else {
            task.startDate = null;
        }

        if (task.endDate) {
            task.endDate = new Date(task.endDate);
        } else {
            task.endDate = null;
        }

        const updateTask = { ...task };
        delete updateTask._id;

        const result = await db.collection('Tasks').updateOne(
            { _id: new ObjectId(id) },
            { $set: updateTask }
        );
        res.status(200).json(result);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).send('Internal Server Error');
    }
};

export const deleteTask = async (req: Request, res: Response) => {
    try {
        const result = await db.collection('Tasks').deleteOne({ _id: new ObjectId(req.params.id) });
        res.status(200).json(result);
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).send('Internal Server Error');
    }
};
