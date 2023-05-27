import express from 'express'
import User from '../dao/dbManagers/user.dbclass.js'

const router = express.Router()
let user = new User()

router.post('/login', async (req,res) => {

    let adminUser = {email: "adminCoder@coder.com", password: "adminCod3r123", role: "admin", _id: 'admin'}
    let userLogged = adminUser

    if (!req.body.email) {
        res.status(400).send({status: "error", error: 'Email not sent'});
    }
    else if (!req.body.password) {
        res.status(400).send({status: "error", error: 'Password not sent'});
    }
    
    if (req.body.email != adminUser.email) {
        const userDB = await user.getUserByEmail(req.body)

        if (userDB.status != 'successful') {
            return res.status(404).send({status: "error", error: `${userDB.error}`})
        }
        userLogged = userDB.value
    }  

    req.session.user = {
        id: userLogged._id,
        email: userLogged.email,
        role: userLogged.role
    }

    req.session.admin = userLogged.role == 'admin' ? true : false

    res.send({status: "successful", message: `User ${userLogged.email} logged`})    

})

router.post('/register', async (req,res) => {
    
    const addUser = await user.addNewUser(req.body)

    if (addUser.status == 'successful') {

        req.session.user = {
            id: addUser.value._id,
            email: addUser.value.email,
            role: addUser.value.role
        }
        res.send(addUser.value)
    }
    else {
        res.status(400).send(addUser);
    }
})


export default router