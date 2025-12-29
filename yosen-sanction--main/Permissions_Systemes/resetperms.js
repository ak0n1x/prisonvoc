const fs = require("fs");
const path = require("path");
const getUserPerm = require("./GetUserPerm");
const PERMS = require("./permission");
const checkPerm = require("./CheckPerm");

const commandPermsPath = path.join(__dirname, "commandPerms.json");

const defaultPerms = {
  "warn": "WL",
  "kick": "OWNER",
  "ban": "OWNER",
  "unban": "OWNER",
  "tempmute": "OWNER",
  "unmute": "OWNER",
  "timeout": "OWNER",
  "bl": "SYS",
  "unbl": "SYS",
  "bllist": "SYS",
  "blinfo": "SYS",
  "wet": "SYS",
  "unwet": "SYS",
  "wetinfo": "SYS",
  "lock": "OWNER",
  "unlock": "OWNER",
  "hide": "OWNER",
  "unhide": "OWNER",
  "renew": "OWNER",
  "mv": "OWNER",
  "addrole": "OWNER",
  "derank": "OWNER",
  "massiverole": "SYS",
  "blr": "OWNER",
  "snipe": "WL",
  "clear": "OWNER",
  "help": "PUBLIC"
};

module.exports = {
  name: "resetperms",
  requiredPerm: PERMS.SYS,

  execute(userId) {
    const userPerm = getUserPerm(userId);
    if (!checkPerm(userPerm, this.requiredPerm)) {
      return;
    }

    fs.writeFileSync(commandPermsPath, JSON.stringify(defaultPerms, null, 2));
    return `✅ Permissions réinitialisées par défaut`;
  }
};