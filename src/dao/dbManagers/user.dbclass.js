import userModel from "../models/user.model.js"
import { isValidPassword } from '../../utils.js'

export default class User {
    constructor() {
    }

    //Get a user by email stored in user collection in database. 
    async getUserByEmail(usr) {
        try {
          const user = await userModel.findOne({ email: usr.email });
      
          if (!user) {
            throw new Error(`User ${usr.email} not found`);
          }
      
          const isValid = isValidPassword(user, usr.password);
      
          if (!isValid) {
            throw new Error(`Incorrect password for user ${usr.email}`);
          }
      
          return { status: 'successful', value: user };
        } catch (error) {
          console.log(`ERROR getting user. Msg: ${error}`);
          return { status: 'failed', error: `ERROR getting user. Msg: ${error}` };
        }
      }
    //Add a new user to user collection
    async addNewUser(user) {
        try{
            let newUser = await userModel.findOne({ email: `${user.email}`})

            if (newUser !== null) {
                throw new Error(`User ${user.email} already registered.`);
              }

            newUser = await userModel.create(user)

            return { status: 'successful', value: newUser }
            
        }catch (error) {
            console.log (`ERROR registering new user. Msg: ${error}`)
            return {status: 'failed', error: `ERROR registering new user. Msg: ${error}`}
        }        
    }
}