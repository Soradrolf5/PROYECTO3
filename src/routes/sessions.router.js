import express from 'express';
import passport from 'passport';
import userModel from '../dao/models/user.model.js';
import User from '../dao/dbManagers/user.dbclass.js';
import { isValidPassword, createHash } from '../utils.js';

const router = express.Router();

const userInstance = new User(); // Crear una instancia de la clase User

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }), async (req, res) => {});

router.get('/githubcallback', passport.authenticate('github', { failureRedirect: '/login' }), async (req, res) => {
  req.session.user = req.user;
  console.log(`User: ${req.session.user}`);
  res.redirect('/products');
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await userInstance.getUserByEmail({ email, password })

  if (user.status === 'failed') {
    console.log(`Invalid credentials`);
    return res.status(400).send({ status: 'error', error: 'Invalid credentials' });
  }

  console.log(`User logged: ${user.value}`);
  req.session.user = {
    id: user.value._id,
    email: user.value.email,
    role: user.value.role,
  };
  res.send({ status: 'successful', message: `User ${user.value.email} logged` });
});

router.post('/failedlogin', async (req, res) => {
  console.log('Failed login');
  res.send('Failed login');
});

router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  // Verificar si el usuario ya está registrado
  const existingUser = await userModel.findOne({ email });

  if (existingUser) {
    console.log(`User ${email} already registered.`);
    return res.status(400).send({ status: 'error', error: `User ${email} already registered.` });
  }

  // Crear un nuevo usuario
  const hashedPassword = await createHash(password);
  const newUser = new userModel({ email, password: hashedPassword });
  await newUser.save();

  // Iniciar sesión del usuario manualmente
  req.login(newUser, (err) => {
    if (err) {
      console.log('Error logging in the newly registered user:', err);
      return res.status(500).send('Failed to log in');
    }

    console.log(`User registered: ${email}`);
    res.send({ status: 'successful', message: `User ${email} registered` });
  });
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