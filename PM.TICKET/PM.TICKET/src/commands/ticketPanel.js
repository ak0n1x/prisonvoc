const { buildPanelEmbed, buildCategoryButtons } = require('../utils/embedBuilder');

module.exports = {
  name: 'ticketpanel',
  description: 'Envoie le panneau de tickets avec les catégories.',
  usage: '!ticketpanel',
  async execute(message, args, { config }) {
    if (!message.member.permissions.has('ManageGuild')) {
      return message.reply('❌ Vous devez être administrateur pour envoyer le panneau de tickets.');
    }

    const embed = buildPanelEmbed(config);
    const rows = buildCategoryButtons(config);

    await message.channel.send({ embeds: [embed], components: rows });
    return message.reply('✅ Panneau de tickets envoyé.');
  },
};
