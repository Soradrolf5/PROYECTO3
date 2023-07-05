import express from 'express';
import passport from 'passport';
import UserModel from '../dao/models/user.model.js';
import { isValidPassword } from '../utils.js';

const router = express.Router();

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }), async (req, res) => {});

router.get('/githubcallback', passport.authenticate('github', { failureRedirect: '/login' }), async (req, res) => {
  req.session.user = req.user;
  console.log(`User: ${req.session.user}`);
  res.redirect('/products');
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Buscar usuario en la colección "users" utilizando el modelo
  const user = await UserModel.findOne({ email });

  if (!user || !isValidPassword(user, password)) {
    console.log(`Invalid credentials`);
    return res.status(400).send({ status: 'error', error: 'Invalid credentials' });
  }

  console.log(`User logged: ${user}`);
  req.session.user = {
    id: user._id,
    email: user.email,
    role: user.role,
  };
  res.send({ status: 'successful', message: `User ${user} logged` });
});

router.post('/failedlogin', async (req, res) => {
  console.log('Failed login');
  res.send('Failed login');
});

router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  // Verificar si el usuario ya está registrado
  const existingUser = await UserModel.findOne({ email });

  if (existingUser) {
    console.log(`User ${email} already registered.`);
    return res.status(400).send({ status: 'error', error: `User ${email} already registered.` });
  }

  // Crear un nuevo usuario
  const newUser = new UserModel({ email, password });
  await newUser.save();

  console.log(`User registered: ${email}`);
  res.send({ status: 'successful', message: `User ${email} registered` });
});

router.post('/failedregister', async (req, res) => {
  console.log(req.message);
  res.send('Failed register');
});

router.get('/current', (req, res) => {
  if (req.session.user) {
    res.send(req.session.user);
  } else {
    res.status(401).send({ status: 'error', error: 'Unauthorized' });
  }
});

export default router;