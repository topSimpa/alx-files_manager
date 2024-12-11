import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

function tokenGenerator() {
  return String(uuidv4());
}

function extractCredential(header) {
  const key = header.replace('Basic ', '');
  const credential = Buffer.from(key, 'base64').toString('utf-8');
  const [email, password] = credential.split(':');
  return { email, password };
}

class AuthController {
  static async getConnect(req, res) {
    const header = req.get('Authorization');
    if (header) {
      const { email, password } = extractCredential(header);
      const user = await dbClient.findUser(email, password);
      if (user) {
        console.log(user);
        const id = user._id;
        const token = tokenGenerator();
        redisClient.set(`auth_${token}`, id.toString(), 86400);
        return res.json({ token });
      }
      return res.status(400).json({ error: 'Unauthorized' });
    }
    res.set('WWW-Authenticate', 'Basic realm="User Login"');
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  static async getDisconnect(req, res) {
    const token = req.get('X-Token');
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    redisClient.del(`auth_${token}`);
    return res.status(204).send();
  }
}

module.exports = AuthController;
