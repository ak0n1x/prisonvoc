const { ChannelType, PermissionFlagsBits } = require('discord.js');
const { log } = require('./logger');
const { buildTicketEmbed, buildTicketControls } = require('./embedBuilder');

const claimedTickets = new Map();

function claimTicket(ticketId, userId) {
  if (claimedTickets.has(ticketId)) return false;
  claimedTickets.set(ticketId, userId);
  return true;
}

function unclaimTicket(ticketId) {
  return claimedTickets.delete(ticketId);
}

function getClaimedBy(ticketId) {
  return claimedTickets.get(ticketId);
}

async function createTicketChannel({ guild, member, categoryKey, config }) {
  const existing = guild.channels.cache.find(
    (channel) => channel.topic && channel.topic.includes(`ticketOwner:${member.id}`),
  );
  if (existing) {
    return { channel: null, reason: `Vous avez déjà un ticket ouvert: ${existing}.` };
  }

  const staffRole = guild.roles.cache.find((role) => role.name === config.staffRole);
  const overwrites = [
    {
      id: guild.roles.everyone.id,
      deny: [PermissionFlagsBits.ViewChannel],
    },
    {
      id: member.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
      ],
    },
  ];

  if (staffRole) {
    overwrites.push({
      id: staffRole.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
      ],
    });
  }

  const channel = await guild.channels.create({
    name: `ticket-${member.user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, ''),
    type: ChannelType.GuildText,
    topic: `ticketOwner:${member.id} category:${categoryKey}`,
    permissionOverwrites: overwrites,
  });

  const embed = buildTicketEmbed({ config, categoryKey, member: member.user });
  const controls = buildTicketControls();
  await channel.send({ content: `${member}`, embeds: [embed], components: controls });

  log(`Ticket créé: ${channel.name} par ${member.user.tag}`);

  return { channel, reason: null };
}

module.exports = {
  claimTicket,
  unclaimTicket,
  getClaimedBy,
  claimedTickets,
  createTicketChannel,
};
