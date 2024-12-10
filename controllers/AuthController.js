import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AuthController {
  static getConnect(req, res) {
    const header = req.get('Authorization');
    if (header) {
      const { email, password } = dbClient.extractCredential(header);
      dbClient.findUser(email, password).then((id) => {
        const token = dbClient.tokenGenerator();
        redisClient.set(`auth_${token}`, id.toString(), 86400);
        console.log(id);
        res.json({ token });
      }).catch((error) => {
        res.status(401);
        res.json({ error: error.message });
      });
    }
  }

  static async getDisconnect(req, res) {
    const token = req.get('X-Token');
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      res.status(401);
      res.json({ error: 'Unauthorized' });
    }
    redisClient.del(`auth_${token}`);
    res.send();
  }
}

module.exports = AuthController;
