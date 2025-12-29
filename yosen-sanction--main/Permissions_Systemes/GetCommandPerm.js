const fs = require("fs");
const path = require("path");
const PERMS = require("./permission");

const commandPermsPath = path.join(__dirname, "commandPerms.json");

module.exports = function getCommandPerm(cmdName) {
  if (!fs.existsSync(commandPermsPath)) {
    return PERMS.PUBLIC;
  }

  try {
    const data = JSON.parse(fs.readFileSync(commandPermsPath, "utf8"));
    const permName = data[cmdName.toLowerCase()];
    return PERMS[permName] ?? PERMS.PUBLIC;
  } catch {
    return PERMS.PUBLIC;
  }
};