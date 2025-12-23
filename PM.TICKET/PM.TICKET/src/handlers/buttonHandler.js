const { PermissionFlagsBits } = require('discord.js');
const { createTicketChannel, unclaimTicket } = require('../utils/ticketManager');
const { handleClaim } = require('./claimHandler');
const { log } = require('../utils/logger');

async function handleButton(interaction, { config }) {
  if (interaction.customId.startsWith('ticket_create_')) {
    const categoryKey = interaction.customId.replace('ticket_create_', '');
    if (!config.categories[categoryKey]) {
      return interaction.reply({ content: '❌ Catégorie inconnue.', ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });
    const { channel, reason } = await createTicketChannel({
      guild: interaction.guild,
      member: interaction.member,
      categoryKey,
      config,
    });

    if (!channel) {
      return interaction.editReply({ content: `❌ ${reason}` });
    }
    return interaction.editReply({ content: `✅ Ticket créé: ${channel}` });
  }

  if (interaction.customId === 'ticket_claim') {
    return handleClaim(interaction);
  }

  if (interaction.customId === 'ticket_close') {
    const staffRole = interaction.guild.roles.cache.find((role) => role.name === config.staffRole);
    const isStaff = staffRole && interaction.member.roles.cache.has(staffRole.id);
    const isOwner = interaction.channel.topic?.includes(`ticketOwner:${interaction.user.id}`);

    if (!isStaff && !isOwner) {
      return interaction.reply({ content: '❌ Vous ne pouvez pas fermer ce ticket.', ephemeral: true });
    }

    await interaction.reply({ content: '🔒 Fermeture du ticket...' });
    unclaimTicket(interaction.channelId);
    await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone.id, {
      SendMessages: false,
      ViewChannel: false,
    });

    if (staffRole) {
      await interaction.channel.permissionOverwrites.edit(staffRole.id, {
        ViewChannel: true,
        SendMessages: false,
      });
    }

    log(`Ticket fermé: ${interaction.channel.name} par ${interaction.user.tag}`);
    await interaction.channel.setName(`${interaction.channel.name}-ferme`);
    return null;
  }

  return interaction.reply({ content: '❌ Action inconnue.', ephemeral: true });
}

module.exports = { handleButton };
