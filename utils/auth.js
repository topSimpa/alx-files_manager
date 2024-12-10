import { v4 as uuidv4 } from 'uuid';

class AuthHelper {
  static extractCredential(header) {
    const key = header.replace('Basic ', '');
    const credential = Buffer.from(key, 'base64').toString('utf-8');
    const [email, password] = credential.split(':');
    return { email, password };
  }

  static tokenGenerator() {
    return String(uuidv4());
  }
}

module.exports = AuthHelper;
