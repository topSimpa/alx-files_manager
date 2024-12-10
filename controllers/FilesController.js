import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class FilesController {
  static async postUpload(req, res) {
    const token = req.get('X-Token');
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const {
      name, type, parentId = 0, isPublic = false, data = '',
    } = req.body;
    if (!name) return res.status(400).json({ error: 'Missing name' });
    if (!type) return res.status(400).json({ error: 'Missing type' });
    if (!data && type !== 'folder') return res.status(400).json('Missing data');
    if (parentId) {
      return dbClient.findFile({ _id: ObjectId(parentId) }).then((result) => {
        console.log(result);
      }).catch((err) => res.status(400).json({ error: err.message }));
    }
    if (type === 'folder') {
      return dbClient.addFolder({
        name, type, parentId, isPublic, userId,
      }).then((id) => res.status(201)
        .json({
          id, userId, name, type, isPublic, parentId,
        }));
    }
    const folder = process.env.FOLDER_PATH || '/tmp/files_manager';
    const fileName = uuidv4().toString();
    return dbClient.addFile({
      userId, name, type, isPublic, parentId, localPath: `${folder}/${fileName}`,
    }, data, folder, fileName).then((id) => res.status(201).json({
      id, userId, name, type, isPublic, parentId,
    })).catch(() => res);
  }
}
module.exports = FilesController;
