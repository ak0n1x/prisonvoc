const fs = require("fs");
const path = require("path");
const PERMS = require("./permissions");
const getUserPerm = require("./GetUserPerm");

const permsPath = path.join(__dirname, "perms.json");

function readPerms() {
  return fs.existsSync(permsPath)
    ? JSON.parse(fs.readFileSync(permsPath, "utf8"))
    : {};
}

function writePerms(data) {
  fs.writeFileSync(permsPath, JSON.stringify(data, null, 2));
}

module.exports = {
  // SYS command: ajouter SYS (seul créateur)
  addSys: (userId, targetId) => {
    if (userId !== require("./config").creatorID) return; // silencieux si pas créateur
    const data = readPerms();
    data[targetId] = "SYS";
    writePerms(data);
  },

  // SYS command: ajouter OWNER (seul SYS peut)
  addOwner: (userId, targetId) => {
    if (getUserPerm(userId) !== PERMS.SYS) return; // silencieux si pas SYS
    const data = readPerms();
    data[targetId] = "OWNER";
    writePerms(data);
  },

  // SYS command: ajouter WL (seul SYS peut)
  addWL: (userId, targetId) => {
    if (getUserPerm(userId) !== PERMS.SYS) return;
    const data = readPerms();
    data[targetId] = "WL";
    writePerms(data);
  },

  // Commande exemple SYS
  sysCommand: (userId) => {
    if (getUserPerm(userId) !== PERMS.SYS) return; // ignoré si pas SYS
    // code de la commande SYS ici
    return "✅ Commande SYS exécutée";
  },

  // Commande Owner
  ownerCommand: (userId) => {
    if (getUserPerm(userId) > PERMS.OWNER) return; // ignoré si pas Owner ou SYS
    return "✅ Commande OWNER exécutée";
  },

  // Commande WL
  wlCommand: (userId) => {
    if (getUserPerm(userId) > PERMS.WL) return; // ignoré si pas WL, OWNER ou SYS
    return "✅ Commande WL exécutée";
  },

  // Commande Public
  publicCommand: (userId) => {
    return "✅ Commande publique exécutée";
  }
};
