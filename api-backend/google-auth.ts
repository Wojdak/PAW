import express from 'express'
import jwt from 'jsonwebtoken'
import { JwtPayload } from 'jsonwebtoken';
import 'dotenv/config'
import cors from 'cors'
import passport from 'passport';
import session from 'express-session';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

interface User {
    id: string;
    username: string;
    email?: string;
}

const app = express()
app.use(cors())
app.use(express.json())


passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID as string,
    clientSecret: process.env.CLIENT_SECRET as string,
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : undefined;

    const user: User = {
      id: profile.id,
      username: profile.displayName,
      email: email
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

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    const userData = encodeURIComponent(
      JSON.stringify({
        id: (req.user as User).id,
        username: (req.user as User).username,
        email: (req.user as User).email,
      })
    );
    res.redirect(`http://localhost:5173/?data=${userData}`);
  }
);

