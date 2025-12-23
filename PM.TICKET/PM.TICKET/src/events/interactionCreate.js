const { handleButton } = require('../handlers/buttonHandler');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client, config) {
    if (interaction.isButton()) {
      await handleButton(interaction, { client, config });
    }
  },
};
