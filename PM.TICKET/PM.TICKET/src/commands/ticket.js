const { createTicketChannel } = require('../utils/ticketManager');
const { buildCategorySummary } = require('../utils/embedBuilder');

module.exports = {
  name: 'ticket',
  description: 'Crée un ticket directement depuis une commande.',
  usage: '!ticket <categorie>',
  async execute(message, args, { config }) {
    const categoryKey = args[0]?.toLowerCase();

    if (!categoryKey || !config.categories[categoryKey]) {
      const summary = buildCategorySummary(config);
      return message.reply(
        `❌ Catégorie inconnue. Utilisation: \`${config.prefix}ticket <categorie>\`\n${summary}`,
      );
    }

    const { channel, reason } = await createTicketChannel({
      guild: message.guild,
      member: message.member,
      categoryKey,
      config,
    });

    if (!channel) {
      return message.reply(`❌ ${reason}`);
    }

    return message.reply(`✅ Ticket créé: ${channel}`);
  },
};
