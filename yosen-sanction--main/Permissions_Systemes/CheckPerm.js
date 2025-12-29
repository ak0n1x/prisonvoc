module.exports = function checkPerm(userPerm, requiredPerm) {
  return userPerm <= requiredPerm;
};