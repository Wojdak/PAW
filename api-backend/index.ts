import express from 'express';
import session from 'express-session';
import cors from 'cors';
import 'dotenv/config';
import passport from './src/config/passport';
import authRoutes from './src/routes/authRoutes';
import projectRoutes from './src/routes/projectRoutes';
import storyRoutes from './src/routes/storyRoutes';
import taskRoutes from './src/routes/taskRoutes';
import { connectToDatabase } from './src/config/db';

const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use(session({
    secret: process.env.TOKEN_SECRET as string,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);
app.use('/projects', projectRoutes);
app.use('/stories', storyRoutes);
app.use('/tasks', taskRoutes);

const initializeApp = async () => {
  try {
      await connectToDatabase();
      app.listen(port, () => {
          console.log(`Server running on port ${port}`);
      });
  } catch (error) {
      console.error('Failed to initialize app', error);
      process.exit(1);
  }
};

initializeApp();