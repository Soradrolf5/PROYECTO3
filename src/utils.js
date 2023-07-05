import {fileURLToPath} from 'url'
import { dirname } from 'path'
import bcrypt from 'bcrypt'

export const PRIVATE_KEY = "coderSecret";

export const createHash = async (password) => {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password.toString(), salt);
    return hash;
  };
  
  export const isValidPassword = async (password, hash) => {
    return await bcrypt.compare(password.toString(), hash.toString());
  };
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default __dirname