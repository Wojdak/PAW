import express from 'express'
import jwt from 'jsonwebtoken'
import { JwtPayload } from 'jsonwebtoken';
import 'dotenv/config'
import cors from 'cors'
import passport from 'passport';
import session from 'express-session';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

const app = express()
const port = 3000

const tokenSecret = process.env.TOKEN_SECRET as string
const users = [
    {username: "jkowal", password: "123"}
];

app.use(cors())
app.use(express.json())

app.use(session({
    secret: process.env.TOKEN_SECRET as string, 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
  }));
  
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req,res)=>{
    console.log(req.user);
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

//GOOGLE AUTHENTICATION
interface User {
    id: string;
    username: string;
    email?: string;
}

declare module 'express-session' {
    interface SessionData {
      user?: User;
    }
  }

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID as string,
    clientSecret: process.env.CLIENT_SECRET as string,
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    const user = {
        id: profile.id,
        username: profile.displayName,
        email: profile.emails ? profile.emails[0].value : undefined
      };
  
    done(null, user);
  }
));

passport.serializeUser((user, done) => {
  done(null, user as User);
});

passport.deserializeUser((user, done) => {
  done(null, user as User);
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    function(req, res) {
        req.session.user = req.user as User; 
        console.log(req.user);
        res.json(req.session.user);
});

app.get('/userinfo', (req, res) => {
    if (req.session && req.session.user) {
        res.json(req.session.user);
    } else {
        res.status(401).send('No user is currently logged in.');
    }
});

//Helper functions
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

app.listen(port, () => {
    console.log(`API listening on port: ${port}`)
})
