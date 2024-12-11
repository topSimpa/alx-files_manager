import sha1 from 'sha1';
import fs from 'fs';

const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');

class DBClient {
  constructor() {
    this.host = process.env.DB_HOST || 'localhost';
    this.port = process.env.DB_PORT || '27017';
    this.database = process.env.DB_DATABASE || 'files_manager';
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

  async createFolder(folderName) {
    if (this.folder !== folderName) {
      fs.mkdir(folderName, { recursive: true }, (err) => err);
      this.folder = folderName;
    }
  }

  async writeFile(file, data) {
    const utfData = Buffer.from(data, 'base64').toString('utf-8');
    fs.writeFile(`${this.folder}/${file}`, utfData, (err) => err);
  }

  async nbUsers() {
    const db = this.client.db(this.database);
    return db.collection('users').countDocuments();
  }

  async nbFiles() {
    const db = this.client.db(this.database);
    return db.collection('files').countDocuments();
  }

  addUsers(email, password) {
    return new Promise((resolve, reject) => {
      if (!email) reject(new Error('Missing email'));
      if (!password) reject(new Error('Missing password'));
      const db = this.client.db(this.database);
      db.collection('users').createIndex({ email: 1 }, { unique: true });
      db.collection('users').insertOne({ email, password: sha1(password) }, (error, result) => {
        if (result) resolve(result.insertedId);
        reject(new Error('Already exist'));
      });
    });
  }

  addFolder(doc) {
    return new Promise((resolve, reject) => {
      const db = this.client.db(this.database);
      db.collection('files').insertOne(doc, (err, result) => {
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
      db.collection('files').insertOne(doc, (err, result) => {
        if (err) reject();
        resolve(result.insertedId);
      });
    });
  }

  async findUser(email, password) {
    const db = this.client.db(this.database);
    return db.collection('users').findOne({ email, password: sha1(password) });
  }

  async findUserById(id) {
    const db = this.client.db(this.database);
    const result = await db.collection('users').findOne({ _id: ObjectId(id) });
    return result;
  }

  findFiles(query) {
    const db = this.client.db(this.database);
    return db.collection('files').find(query);
  }

  async getFiles(query, page) {
    const db = this.client.db(this.database);
    console.log(query);
    const files = await db.collection('files').aggregate([
      { $match: query },
      { $sort: { _id: 1 } },
      {
        $facet: {
          data: [{ $skip: (page) * 20 }, { $limit: 20 }],
        },
      },
    ]).toArray();
    return files[0].data;
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
