import { ObjectId } from "mongodb";
import { v4 as uuidv4 } from "uuid";
import dbClient from "../utils/db";
import isAuthorized from "../utils/auth";

class FilesController {
  static postUpload(req, res) {
    isAuthorized(req.get("X-Token"))
      .then(async (userId) => {
        const {
          name,
          type,
          parentId = 0,
          isPublic = false,
          data = "",
        } = req.body;
        if (!name) return res.status(400).json({ error: "Missing name" });
        if (!type) return res.status(400).json({ error: "Missing type" });
        if (!data && type !== "folder")
          return res.status(400).json({ error: "Missing data" });
        if (parentId) {
          console.log("here in parent");
          if (!dbClient.isValidObjectId(parentId))
            return res.status(400).json({ error: "Parent not found" });
          const folder = await dbClient.findFile({ _id: ObjectId(parentId) });
          console.log(folder);
          if (!folder)
            return res.status(400).json({ error: "Parent not found" });
          if (folder.type !== "folder")
            return res.status(400).json({ error: "Parent is not a folder" });
        }
        if (type === "folder") {
          return dbClient
            .addFolder({
              name,
              type,
              parentId,
              isPublic,
              userId,
            })
            .then((id) =>
              res.status(201).json({
                id,
                userId,
                name,
                type,
                isPublic,
                parentId,
              })
            );
        }
        const folder = process.env.FOLDER_PATH || "/tmp/files_manager";
        const fileName = uuidv4().toString();
        return dbClient
          .addFile(
            {
              userId,
              name,
              type,
              isPublic,
              parentId,
              localPath: `${folder}/${fileName}`,
            },
            data,
            folder,
            fileName
          )
          .then((id) =>
            res.status(201).json({
              id,
              userId,
              name,
              type,
              isPublic,
              parentId,
            })
          )
          .catch(() => res);
        console.log("Here");
      })
      .catch((err) => {
        console.log(err.message);
        res.status(401).json({ error: err.message });
      });
  }

  static getShow(req, res) {
    isAuthorized(req.get("X-Token"))
      .then(async (userId) => {
        const file = await dbClient.findFiles({
          userId,
          _id: ObjectId(req.params.id),
        });
        if (!file) return res.status(404).json({ error: "Not found" });
        const { _id, name, type, isPublic, parentId } = file;
        return res.json({
          id: _id,
          userId,
          name,
          type,
          isPublic,
          parentId,
        });
      })
      .catch((err) => res.status(401).json({ error: err.message }));
  }

  static getIndex(req, res) {
    isAuthorized(req.get("X-Token"))
      .then(async (userId) => {
        const parentId = req.query.parentId || "0";
        // console.log(parentId);
        const page = req.query.page || "0";
        const files = await dbClient.getFiles(
          { userId, parentId },
          Number(page)
        );
        return res.json(files);
      })
      .catch((err) => res.status(401).json({ error: err.message }));
  }
}
module.exports = FilesController;
