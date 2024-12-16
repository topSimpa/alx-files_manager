import sha1 from "sha1";
import fs from "fs";

const { MongoClient } = require("mongodb");
const { ObjectId } = require("mongodb");

class DBClient {
  constructor() {
    this.host = process.env.DB_HOST || "localhost";
    this.port = process.env.DB_PORT || "27017";
    this.database = process.env.DB_DATABASE || "files_manager";
    this.client = new MongoClient(`mongodb://${this.host}:${this.port}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    this.folder = null;
    this.client.connect();
  }

  isAlive() {
    return this.client.isConnected();
  }

  isValidObjectId(id) {
    console.log("check");
    return ObjectId.isValid(id) && new ObjectId(id).toString() === id;
  }

  async createFolder(folderName) {
    if (this.folder !== folderName) {
      fs.mkdir(folderName, { recursive: true }, (err) => err);
      this.folder = folderName;
    }
  }

  async writeFile(file, data) {
    const utfData = Buffer.from(data, "base64").toString("utf-8");
    fs.writeFile(`${this.folder}/${file}`, utfData, (err) => err);
  }

  async nbUsers() {
    const db = this.client.db(this.database);
    return db.collection("users").countDocuments();
  }

  async nbFiles() {
    const db = this.client.db(this.database);
    return db.collection("files").countDocuments();
  }

  async addUsers(email, password) {
    if (!email) throw new Error("Missing email");
    if (!password) throw new Error("Missing password");
    const db = this.client.db(this.database);
    db.collection("users").createIndex({ email: 1 }, { unique: true });
    try {
      const result = await db
        .collection("users")
        .insertOne({ email, password: sha1(password) });
      return result.insertedId;
    } catch (error) {
      throw new Error("Already exist");
    }
  }

  addFolder(doc) {
    return new Promise((resolve, reject) => {
      const db = this.client.db(this.database);
      db.collection("files").insertOne(doc, (err, result) => {
        if (err) reject();
        resolve(result.insertedId);
      });
    });
  }

  addFile(doc, data, folder, name) {
    this.createFolder(folder);
    this.writeFile(name, data);
    return new Promise((resolve, reject) => {
      const db = this.client.db(this.database);
      db.collection("files").insertOne(doc, (err, result) => {
        if (err) reject();
        resolve(result.insertedId);
      });
    });
  }

  async findUser(email, password) {
    const db = this.client.db(this.database);
    return db.collection("users").findOne({ email, password: sha1(password) });
  }

  async findUserById(id) {
    const db = this.client.db(this.database);
    const result = await db.collection("users").findOne({ _id: ObjectId(id) });
    return result;
  }

  async findFiles(query) {
    const db = this.client.db(this.database);
    const result = await db.collection("files").find(query);
    return result.toArray();
  }

  async findFile(query) {
    const db = this.client.db(this.database);
    const result = await db.collection("files").findOne(query);
    return result;
  }

  async getFiles(query, page) {
    const db = this.client.db(this.database);
    console.log(query);
    const files = await db
      .collection("files")
      .aggregate([
        { $match: query },
        { $sort: { _id: 1 } },
        {
          $facet: {
            data: [{ $skip: page * 20 }, { $limit: 20 }],
          },
        },
      ])
      .toArray();
    return files[0].data;
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
