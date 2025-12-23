const { handleCommand } = require('../handlers/commandHandler');

module.exports = {
  name: 'messageCreate',
  async execute(message, client, config) {
    if (!message.guild || message.author.bot) return;
    await handleCommand(message, client, config);
  },
};
