import redisClient from './redis';

async function isAuthorized(token) {
  const userId = await redisClient.get(`auth_${token}`);
  return new Promise((resolve, reject) => {
    console.log(userId);
    if (userId) resolve(userId);
    else reject(new Error('Unauthorized'));
  });
}

module.exports = isAuthorized;
