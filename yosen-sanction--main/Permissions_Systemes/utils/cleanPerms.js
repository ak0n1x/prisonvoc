const { cleanPermsFile } = require("./permsStore");

function runCleanup() {
  const { changed } = cleanPermsFile();
  if (changed) {
    console.log("perms.json nettoyé : mentions converties en IDs.");
  } else {
    console.log("perms.json déjà propre, aucune modification.");
  }
}

if (require.main === module) {
  runCleanup();
}

module.exports = runCleanup;
