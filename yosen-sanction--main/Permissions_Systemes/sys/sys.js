const PERMS = require("../permission");
const checkPerm = require("../CheckPerm");
const getUserPerm = require("../GetUserPerm");

module.exports = {
  name: "sys",
  requiredPerm: PERMS.SYS,

  execute(userId) {
    const userPerm = getUserPerm(userId);
    if (!checkPerm(userPerm, this.requiredPerm)) return;
    return "✅ Commande SYS exécutée";
  }
};