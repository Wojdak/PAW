import jwt from 'jsonwebtoken';

const tokenSecret = process.env.TOKEN_SECRET as string;

export function generateToken(expirationInSeconds: number, claims: object) {
    const exp = Math.floor(Date.now() / 1000) + expirationInSeconds;
    return jwt.sign({ exp, ...claims }, tokenSecret, { algorithm: 'HS256' });
}