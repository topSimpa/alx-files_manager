import dbClient from '../utils/db';

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
}

module.exports = UsersController;
