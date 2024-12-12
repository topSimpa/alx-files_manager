import redisClient from './redis';

async function isAuthorized(token) {
  const userId = await redisClient.get(`auth_${token}`);
  return new Promise((resolve, reject) => {
    // console.log(userId);
    if (userId) {
      resolve(userId);
      // console.log('after');
    } else {
      // console.log('in error');
      reject(new Error('Unauthorized'));
    }
  });
}

module.exports = isAuthorized;
