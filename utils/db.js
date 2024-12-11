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

  findUser(email, password) {
    const db = this.client.db(this.database);
    return new Promise((resolve, reject) => {
      db.collection('users').findOne({ email, password: sha1(password) }, (error, result) => {
        if (error) reject(new Error('Unauthorized'));
        resolve(result._id);
      });
    });
  }

  findUserById(id) {
    const db = this.client.db(this.database);
    return new Promise((resolve, reject) => {
      db.collection('users').findOne({ _id: ObjectId(id) }, (err, result) => {
        if (err) reject(new Error('Unauthorized'));
        resolve(result);
      });
    });
  }

  findFile(query) {
    const db = this.client.db(this.database);
    return new Promise((resolve, reject) => {
      db.collection('files').findOne(query, (err, result) => {
        if (err) reject(err);
        if (!result) reject(new Error('Parent not found'));
        if (result.type !== 'folder') reject(new Error('Parent is not a folder'));
        resolve(result.insertedId);
      });
    });
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
