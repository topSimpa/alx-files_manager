import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';

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

    this.client.connect();
  }

  static extractCredential(header) {
    const key = header.replace('Basic ', '');
    const credential = Buffer.from(key, 'base64').toString('utf-8');
    const [email, password] = credential.split(':');
    return { email, password };
  }

  static tokenGenerator() {
    return String(uuidv4());
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    const db = this.client.db(this.database);
    return db.collection('users').countDocuments();
  }

  async nbFiles() {
    const db = this.client.db(this.database);
    return db.collection('files').countDocuments();
  }

  async addUsers(email, password) {
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

  async findUser(email, password) {
    const db = this.client.db(this.database);
    return new Promise((resolve, reject) => {
      db.collection('users').findOne({ email, password: sha1(password) }, (error, result) => {
        if (error) reject(new Error('Unauthorized'));
        resolve(result._id);
      });
    });
  }

  async findUserById(id) {
    const db = this.client.db(this.database);
    return new Promise((resolve, reject) => {
      db.collection('users').findOne({ _id: ObjectId(id) }, (err, result) => {
        if (err) reject(new Error('Unauthorized'));
        resolve(result);
      });
    });
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
