import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken'
import { JwtPayload } from 'jsonwebtoken';
import 'dotenv/config'
import cors from 'cors'
import passport from 'passport';
import session from 'express-session';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
const { MongoClient, ObjectId } = require('mongodb');
import { Db, MongoError } from 'mongodb';
import bcrypt from 'bcrypt';

const app = express()
const port = 3000

const tokenSecret = process.env.TOKEN_SECRET as string

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



//BASIC AUTHENTICATION
app.post('/login', async (req: Request, res: Response) => {
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
});

app.post('/register', async (req: Request, res: Response) => {
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
});

app.post('/validate-token', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
      return res.status(401).send('Authorization header required');
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, tokenSecret, (err, decoded) => {
      if (err) {
          return res.status(401).send({ valid: false });
      }

      res.status(200).send({ valid: true });
  });
});

app.post('/refresh-token', async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
      return res.status(401).send("Refresh token is required.");
  }

  try {
      const payload = jwt.verify(refreshToken, tokenSecret) as JwtPayload;
      const user = await db.collection('Users').findOne({ username: payload.username, rToken: refreshToken });

      if (!user) {
          return res.status(403).send("Token is invalid or expired.");
      }

      const newToken = generateToken(300, { username: payload.username });
      const newRefreshToken = generateToken(600, { username: payload.username });

      res.status(200).send({ newToken, newRefreshToken});
  } catch (error) {
      console.error('Error during token refresh:', error);
      res.status(403).send("Token is invalid or expired.");
  }
});

app.get('/users', async (req: Request, res: Response) => {
  try {
      const users = await db.collection('Users').find({}).toArray();
      res.status(200).json(users);
  } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).send('Internal Server Error');
  }
});

//GOOGLE AUTHENTICATION
interface User {
    _id: string;
    username: string;
    email?: string;
    aToken?: string;
    rToken?: string;
}

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID as string,
    clientSecret: process.env.CLIENT_SECRET as string,
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
function(accessToken, refreshToken, profile, done) {
    const user = {
            _id: profile.id,
            username: profile.displayName,
            email: profile.emails ? profile.emails[0].value : undefined,
            aToken: accessToken,
            rToken: refreshToken
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
          _id: (req.user as User)._id,
          username: (req.user as User).username,
          email: (req.user as User).email,
          aToken: (req.user as User).aToken,
          rToken: (req.user as User).rToken,
        })
      );
      res.redirect(`http://localhost:5173/?data=${userData}`);
    }
);
  

//Helper functions
function generateToken(expirationInSeconds: number, claims: object) {
    const exp = Math.floor(Date.now() / 1000) + expirationInSeconds;
    return jwt.sign({ exp, ...claims }, tokenSecret, { algorithm: 'HS256' });
}

//MongoDB connection
const uri = 'mongodb+srv://wojdak:rVnvh5SwRJZ4wOg6@cluster0.fvgvlvv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri);
let db: Db;

client.connect()
    .then(() => {
        db = client.db('ManageMe');
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    })
    .catch((err: MongoError) => {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    });


// PROJECT ENDPOINTS
app.get('/projects', async (req: Request, res: Response) => {
  const projects = await db.collection('Projects').find({}).toArray();
  res.status(200).json(projects);
});

app.get('/projects/:id', async (req: Request, res: Response) => {
  const project = await db.collection('Projects').findOne({ _id: new ObjectId(req.params.id) });
  res.status(200).json(project);
});

app.post('/projects', async (req: Request, res: Response) => {
  const result = await db.collection('Projects').insertOne(req.body);
  res.status(201).json(result);
});

app.put('/projects/:id', async (req: Request, res: Response) => {
  const result = await db.collection('Projects').updateOne({ _id: new ObjectId(req.params.id) }, { $set: req.body });
  res.status(200).json(result);
});

app.delete('/projects/:id', async (req: Request, res: Response) => {
  const result = await db.collection('Projects').deleteOne({ _id: new ObjectId(req.params.id) });
  res.status(200).json(result);
});

// STORY ENDPOINTS
app.get('/stories', async (req: Request, res: Response) => {
  const { _projectId } = req.query;
  let query = {};

  if (_projectId) {
    query = { projectId: new ObjectId(_projectId as string) };
  }

  try {
    const stories = await db.collection('Stories').find(query).toArray();
    res.status(200).json(stories);
  } catch (error) {
    console.error('Error fetching stories:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/stories/:id', async (req: Request, res: Response) => {
  const story = await db.collection('Stories').findOne({ _id: new ObjectId(req.params.id) });
  res.status(200).json(story);
});

app.post('/stories', async (req: Request, res: Response) => {
  const story = req.body;

  story.projectId = new ObjectId(story.projectId);
  story.creationDate = new Date(story.creationDate);
  story.ownerId = new ObjectId(story.ownerId);
  
  const result = await db.collection('Stories').insertOne(req.body);
  res.status(201).json(result);
});

app.put('/stories/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const story = req.body;

  story.projectId = new ObjectId(story.projectId);
  story.creationDate = new Date(story.creationDate);
  story.ownerId = new ObjectId(story.ownerId);

  const updateStory = { ...story };
  delete updateStory._id;

  const result = await db.collection('Stories').updateOne(
    { _id: new ObjectId(id) },
    { $set: updateStory }
);
  res.status(200).json(result);
});

app.delete('/stories/:id', async (req: Request, res: Response) => {
  const result = await db.collection('Stories').deleteOne({ _id: new ObjectId(req.params.id) });
  res.status(200).json(result);
});

// TASK ENDPOINTS
app.get('/tasks', async (req: Request, res: Response) => {
  const { _storyId } = req.query;
  let query = {};

  if (_storyId) {
      query = { storyId: new ObjectId(_storyId as string) };
  }

  try {
      const tasks = await db.collection('Tasks').find(query).toArray();
      res.status(200).json(tasks);
  } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).send('Internal Server Error');
  }
});

app.get('/tasks/:id', async (req: Request, res: Response) => {
  const story = await db.collection('Tasks').findOne({ _id: new ObjectId(req.params.id) });
  res.status(200).json(story);
});

app.post('/tasks', async (req: Request, res: Response) => {
  const task = req.body;

  task.storyId = new ObjectId(task.storyId);
  task.creationDate = new Date(task.creationDate);

  const result = await db.collection('Tasks').insertOne(task);
  res.status(201).json(result);
});

app.put('/tasks/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const task = req.body;

  try {
      // Convert necessary fields to ObjectId
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
});

app.delete('/tasks/:id', async (req: Request, res: Response) => {
  const result = await db.collection('Tasks').deleteOne({ _id: new ObjectId(req.params.id) });
  res.status(200).json(result);
});
