import { Router } from 'express';
import { login, register, logout, validateToken, refreshToken, getUsers, getUserById } from '../controllers/authController';
import passport from '../config/passport';
import { generateToken } from '../utils/generateToken';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/logout', logout);
router.post('/validate-token', validateToken);
router.post('/refresh-token', refreshToken);
router.get('/users', getUsers);
router.get('/users/:id', getUserById);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        const user = req.user as any;
        if (user) {
            const token = generateToken(300, { username: user.username, userId: user._id });

            const userData = encodeURIComponent(
                JSON.stringify({
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    token: token
                })
            );
            res.redirect(`http://localhost:5173/?data=${userData}`);
        }
    }
);

export default router;
