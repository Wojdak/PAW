import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { db } from '../config/db';

export const getProjects = async (req: Request, res: Response) => {
    try {
        const projects = await db.collection('Projects').find({}).toArray();
        res.status(200).json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).send('Internal Server Error');
    }
};

export const getProjectById = async (req: Request, res: Response) => {
    try {
        const project = await db.collection('Projects').findOne({ _id: new ObjectId(req.params.id) });
        res.status(200).json(project);
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).send('Internal Server Error');
    }
};

export const createProject = async (req: Request, res: Response) => {
    try {
        const result = await db.collection('Projects').insertOne(req.body);
        res.status(201).json(result);
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).send('Internal Server Error');
    }
};

export const updateProject = async (req: Request, res: Response) => {
    try {
        const result = await db.collection('Projects').updateOne({ _id: new ObjectId(req.params.id) }, { $set: req.body });
        res.status(200).json(result);
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).send('Internal Server Error');
    }
};

export const deleteProject = async (req: Request, res: Response) => {
    try {
        const result = await db.collection('Projects').deleteOne({ _id: new ObjectId(req.params.id) });
        res.status(200).json(result);
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).send('Internal Server Error');
    }
};
