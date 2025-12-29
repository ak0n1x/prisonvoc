const commands = require("./commands");
const getUserPerm = require("./GetUserPerm");
const PERMS = require("./permissions");

function handleCommand(message) {
  const args = message.content.trim().split(/\s+/);
  const cmd = args[0].toLowerCase();
  const userId = message.author.id;

  switch(cmd) {
    case "+addsys":
      commands.addSys(userId, args[1]);
      break;
    case "+addowner":
      commands.addOwner(userId, args[1]);
      break;
    case "+addwl":
      commands.addWL(userId, args[1]);
      break;
    case "+sys":
      return commands.sysCommand(userId); // silencieux si pas SYS
    case "+owner":
      return commands.ownerCommand(userId);
    case "+wl":
      return commands.wlCommand(userId);
    case "+public":
      return commands.publicCommand(userId);
  }
}

module.exports = handleCommand;
