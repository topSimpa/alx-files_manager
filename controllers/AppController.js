import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
  static getStatus(req, res) {
    res.json({ redis: redisClient.isAlive(), db: dbClient.isAlive() });
  }

  static async getStats(req, res) {
    const stats = {};
    stats.users = await dbClient.nbUsers();
    stats.files = await dbClient.nbFiles();
    res.json(stats);
  }
}

module.exports = AppController;
