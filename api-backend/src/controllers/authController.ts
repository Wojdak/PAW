import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { generateToken } from '../utils/generateToken';
import { db } from '../config/db';

export const login = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    try {
        const user = await db.collection('Users').findOne({ username });
        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).send("Wrong login details!");
        }

        const token = generateToken(300, { username });
        const refreshToken = generateToken(600, { username });

        res.status(200).send({ token, refreshToken, user });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Internal Server Error');
    }
};

export const register = async (req: Request, res: Response) => {
    const { username, password, firstName, lastName, role } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = {
            username,
            password: hashedPassword,
            firstName,
            lastName,
            role
        };

        const result = await db.collection('Users').insertOne(user);
        res.status(201).json(result);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('Internal Server Error');
    }
};

export const logout = (req: Request, res: Response) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).send("Failed to log out properly");
        }

        res.clearCookie("connect.sid", { path: "/" });
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).send("Failed to destroy session");
            }

            res.status(200).send("Logged out successfully");
        });
    });
};

export const validateToken = (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('Authorization header required');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.TOKEN_SECRET as string, (err, decoded) => {
        if (err) {
            return res.status(401).send({ valid: false });
        }

        res.status(200).send({ valid: true });
    });
};

export const refreshToken = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).send("Refresh token is required.");
    }

    try {
        const payload = jwt.verify(refreshToken, process.env.TOKEN_SECRET as string) as JwtPayload;
        const user = await db.collection('Users').findOne({ username: payload.username, rToken: refreshToken });

        if (!user) {
            return res.status(403).send("Token is invalid or expired.");
        }

        const newToken = generateToken(300, { username: payload.username });
        const newRefreshToken = generateToken(600, { username: payload.username });

        res.status(200).send({ newToken, newRefreshToken });
    } catch (error) {
        console.error('Error during token refresh:', error);
        res.status(403).send("Token is invalid or expired.");
    }
};

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await db.collection('Users').find({}).toArray();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('Internal Server Error');
    }
  };

  
  export const getUserById = async (req: Request, res: Response) => {
    try {
        const user = await db.collection('Users').findOne({ _id: new ObjectId(req.params.id) });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user with the given Id:', error);
        res.status(500).send('Internal Server Error');
    }
};