const fs = require("fs");
const path = require("path");
const PERMS = require("./permission");
const { creatorID } = require("./config");

const permsPath = path.join(__dirname, "perms.json");

module.exports = function getUserPerm(userId) {
  if (userId === creatorID) return PERMS.SYS;
  
  if (!fs.existsSync(permsPath)) return PERMS.PUBLIC;
  
  try {
    const data = JSON.parse(fs.readFileSync(permsPath, "utf8"));
    const role = data[userId];
    return PERMS[role] ?? PERMS.PUBLIC;
  } catch {
    return PERMS.PUBLIC;
  }
};