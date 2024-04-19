import express from 'express'
import jwt from 'jsonwebtoken'
import { JwtPayload } from 'jsonwebtoken';
import 'dotenv/config'
import cors from 'cors'

const app = express()
const port = 3000

const tokenSecret = process.env.TOKEN_SECRET as string
const users = [
    {username: "jkowal", password: "123"}
];

app.use(cors())
app.use(express.json())

app.get('/', (req,res)=>{
    res.send('test')
})

app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (validateUser(username, password)) {
        const token = generateToken(300, { username });
        const refreshToken = generateToken(600, { username });

        res.status(200).send({ token, refreshToken });
    } else {
        res.status(401).send("Wrong login details!");
    }
});

app.post('/refresh-token', (req, res) => {
    const refreshToken = req.body.refreshToken;

    if (!refreshToken) {
        return res.status(401).send("Refresh token is required.");
    }

    try {
        const payload = jwt.verify(refreshToken, tokenSecret) as JwtPayload;

        const newToken = generateToken(300, { username: payload.username });
        const newRefreshToken = generateToken(600, { username: payload.username }); 
        res.status(200).send({ newToken, newRefreshToken});
    } catch (error) {
        res.status(403).send("Token is invalid or expired.");
    }
});

app.listen(port, () => {
    console.log(`API listening on port: ${port}`)
})

function validateUser(username: string, password: string): boolean {
    let isValidUser = false;  
    users.forEach(user => {
        if (user.username == username && user.password == password) {
            isValidUser = true;  
        }
    });

    return isValidUser; 
}

function generateToken(expirationInSeconds: number, claims: object) {
    const exp = Math.floor(Date.now() / 1000) + expirationInSeconds;
    return jwt.sign({ exp, ...claims }, tokenSecret, { algorithm: 'HS256' });
}