import redisClient from './redis';

function isAuthorized(token) {
  return new Promise((resolve, reject) => {
    const userId = redisClient.get(`auth_${token}`);
    if (userId) resolve(userId);
    reject(new Error('Unauthorized'));
  });
}

module.exports = isAuthorized;
