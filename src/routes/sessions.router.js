import express from 'express'
import passport from "passport"

const router = express.Router()

router.get('/github', passport.authenticate('github', {scope: ['user:email']}), async (req, res) =>{})

router.get('/githubcallback', passport.authenticate('github', { failureRedirect: '/login' }), async (req, res) => {
    req.session.user = req.user; // Corrección aquí
    console.log(`User: ${req.session.user}`);
    res.redirect('/products');
  });

router.post('/login', passport.authenticate('login', { failureRedirect: '/api/session/failedlogin' }), async (req, res) => {
    if (!req.user) {
        console.log(`Invalid credentials`)
        return res.status(400).send({status: 'error', error: 'Invalid credentials'})
    }
    req.session.user = req.user
    
    console.log(`User logged: ${req.user}`)
    res.send({status: "successful", message: `User ${req.user} logged`})
})

router.post('/failedlogin', async (req, res) => {
    console.log(req.message);
    res.send("Failed login");
})

router.post('/register', passport.authenticate('register', { failureRedirect: '/api/session/failedregister' }), async (req, res) => {
    req.session.user = req.user
    console.log(`User registered: ${req.user}`)
    res.send({status: "successful", message: `User ${req.user} registered`})
})

router.post('/failedregister', async (req, res) => {
    console.log(req.message);
    res.send("Failed register");
})

export default router