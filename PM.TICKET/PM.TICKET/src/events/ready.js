const { log } = require('../utils/logger');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    log(`Connecté en tant que ${client.user.tag}`);
  },
};
