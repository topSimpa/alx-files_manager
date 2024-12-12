import dbClient from '../utils/db';
import isAuthorized from '../utils/auth';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    try {
      const id = await dbClient.addUsers(email, password);
      return res.json({ id, email });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async getMe(req, res) {
    const token = req.get('X-Token');
    isAuthorized(token).then(async (id) => {
      const result = await dbClient.findUserById(id);
      const { _id, email } = result;
      return res.json({ id: _id, email });
    }).catch((err) => res.status(401).json({ error: err.message }));
  }
}

module.exports = UsersController;
