import sha1 from 'sha1';

const { MongoClient } = require('mongodb');

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
}

const dbClient = new DBClient();
module.exports = dbClient;
