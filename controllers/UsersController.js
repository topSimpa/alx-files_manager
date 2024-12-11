import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class UsersController {
  static postNew(req, res) {
    const { email, password } = req.body;

<<<<<<< HEAD
// <<<<<<< HEAD
    // return dbClient.addUsers(email, password)
    //   .then((id) => res.status(201).json({ id, email }))
    //   .catch((error) => res.status(400).json({ error: error.message }));
//   }
// 
//   static getMe(req, res) {
    // const token = req.get('X-Token');
    // const id = redisClient.get(`auth_${token}`);
    // if (!id) {
    //   return res.status(401).json({ error: 'Unauthorized' });
    // }
    // return dbClient.findUserById(id).then((result) => {
    //   const { _id, email } = result;
    //   res.json({ id: _id, email });
    // }).catch((error) => res.status(401).json({ error: error.message }));
=======
    return dbClient.addUsers(email, password).then((id) => res.status(201).json({ id, email }))
      .catch((error) => res.status(400).json({ error: error.message }));
  }
>>>>>>> parent of fc0d2a1 (formated UsersController.js)

    dbClient.addUsers(email, password).then((id) => {
      res.status(201);
      res.json({ email, id });
    }).catch((error) => {
      res.status(400);
      res.json({ error: error.message });
    });
  }
}

module.exports = UsersController;
