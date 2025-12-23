const { claimTicket, getClaimedBy } = require('../utils/ticketManager');

async function handleClaim(interaction) {
  const ticketId = interaction.channelId;
  const claimedBy = getClaimedBy(ticketId);

  if (claimedBy) {
    return interaction.reply({
      content: '❌ Ce ticket est déjà pris en charge.',
      ephemeral: true,
    });
  }

  claimTicket(ticketId, interaction.user.id);
  return interaction.reply({
    content: `✅ Ticket pris en charge par ${interaction.user}.`,
  });
}

module.exports = { handleClaim };
