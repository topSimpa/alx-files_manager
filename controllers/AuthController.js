import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AuthController {
  static extractCredential(header) {
    const key = header.replace('Basic ', '');
    const credential = Buffer.from(key, 'base64').toString('utf-8');
    const [email, password] = credential.split(':');
    return { email, password };
  }

  static tokenGenerator() {
    return String(uuidv4());
  }

  static getConnect(req, res) {
    const header = req.get('Authorization');
    if (header) {
      const { email, password } = this.extractCredential(header);
      return dbClient.findUser(email, password).then((id) => {
        const token = this.tokenGenerator();
        redisClient.set(`auth_${token}`, id.toString(), 86400);
        return res.json({ token });
      }).catch((error) => res.status(401).json({ error: error.message }));
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
    return res.send();
  }
}

module.exports = AuthController;
