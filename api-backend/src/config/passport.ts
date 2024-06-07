import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { db } from './db';
import { ObjectId } from 'mongodb';

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID as string,
    clientSecret: process.env.CLIENT_SECRET as string,
    callbackURL: "http://localhost:3000/auth/google/callback"
},
async (accessToken: string, refreshToken: string, profile: any, done: Function) => {
    try {
        const collection = db.collection('Users');
        let user = await collection.findOne({ googleId: profile.id });

        if (!user) {
            const newUser = {
                googleId: profile.id,
                username: profile.displayName,
                email: profile.emails[0].value,
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                role: 'Developer',
            };

            const result = await collection.insertOne(newUser);
            user = { ...newUser, _id: result.insertedId };
        }

        done(null, user);
    } catch (err) {
        done(err);
    }
}));

passport.serializeUser((user: any, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
    try {
        const collection = db.collection('Users');
        const user = await collection.findOne({ _id: new ObjectId(id) });
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

export default passport;
