import Router from 'express';
import Message from '../dao/dbManagers/messages.dbclass.js';

const router = Router()

let message = new Message()

router.get('/', async (req,res) => {
    const getMessages = await message.getMessages()
    res.send(getMessages)
})

router.post('/', async (req, res) => {
    const newMessage = await message.addMessage(req.body) 
    res.send(newMessage)
})


export default router