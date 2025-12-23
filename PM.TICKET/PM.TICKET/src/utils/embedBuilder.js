const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

function buildPanelEmbed(config) {
  const description = Object.entries(config.categories)
    .map(([key, value]) => `${value.emoji} **${value.nom}** — \`${key}\``)
    .join('\n');

  return new EmbedBuilder()
    .setTitle('🎫 Ouvrir un ticket')
    .setDescription(description || 'Aucune catégorie configurée.')
    .setColor('#2ECC71')
    .setFooter({ text: 'Cliquez sur un bouton pour ouvrir votre ticket.' });
}

function buildCategoryButtons(config) {
  const rows = [];
  const entries = Object.entries(config.categories);
  for (let i = 0; i < entries.length; i += 5) {
    const row = new ActionRowBuilder();
    entries.slice(i, i + 5).forEach(([key, value]) => {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`ticket_create_${key}`)
          .setLabel(value.nom)
          .setEmoji(value.emoji)
          .setStyle(ButtonStyle.Primary),
      );
    });
    rows.push(row);
  }
  return rows;
}

function buildTicketEmbed({ config, categoryKey, member }) {
  const category = config.categories[categoryKey];
  return new EmbedBuilder()
    .setTitle(`${category.emoji} Ticket — ${category.nom}`)
    .setDescription(
      `Bonjour ${member}, votre ticket est ouvert.\nUn membre du staff va vous répondre rapidement.`,
    )
    .setColor(category.couleur || '#3498DB')
    .setFooter({ text: `Catégorie: ${categoryKey}` });
}

function buildTicketControls() {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('ticket_claim')
        .setLabel('Prendre en charge')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('ticket_close')
        .setLabel('Fermer le ticket')
        .setStyle(ButtonStyle.Danger),
    ),
  ];
}

function buildCategorySummary(config) {
  const entries = Object.entries(config.categories);
  if (entries.length === 0) {
    return 'Aucune catégorie configurée.';
  }
  return entries.map(([key, value]) => `${value.emoji} ${value.nom} (\`${key}\`)`).join(' | ');
}

module.exports = {
  buildPanelEmbed,
  buildCategoryButtons,
  buildTicketEmbed,
  buildTicketControls,
  buildCategorySummary,
};
