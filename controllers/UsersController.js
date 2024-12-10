import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class UsersController {
  static postNew(req, res) {
    const { email } = req.body;
    const { password } = req.body;

    dbClient.addUsers(email, password).then((id) => {
      res.status(201);
      res.json({ id, email });
    }).catch((error) => {
      res.status(400);
      res.json({ error: error.message });
    });
  }

  static async getMe(req, res) {
    const token = req.get('X-Token');
    const id = await redisClient.get(`auth_${token}`);
    if (!id) {
      res.status(401);
      res.json({ error: 'Unauthorized' });
    }
    dbClient.findUserById(id).then((result) => {
      const { _id, email } = result;
      res.json({ id: _id, email });
    }).catch((error) => {
      res.status(401);
      res.json(error);
    });
  }
}

module.exports = UsersController;
