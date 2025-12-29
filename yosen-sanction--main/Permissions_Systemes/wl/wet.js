const { EmbedBuilder } = require("discord.js");
const getUserPerm = require("../GetUserPerm");
const PERMS = require("../permission");
const banStore = require("../banStore");

function extractMessage(args) {
  if (!args.length) return { message: null, cleanedArgs: [] };
  const maybeMessage = args[args.length - 1];
  if (maybeMessage && maybeMessage.content !== undefined) {
    return { message: maybeMessage, cleanedArgs: args.slice(0, -1) };
  }
  return { message: null, cleanedArgs: args };
}

module.exports = {
  name: "wet",
  async execute(userId, targetId, ...rest) {
    const { message, cleanedArgs } = extractMessage(rest);
    const reason = cleanedArgs.join(" ") || "Wet list";

    if (!targetId) return "❌ Utilisation: +wet <user_id> <raison>";

    const issuerPerm = getUserPerm(userId);
    if (issuerPerm > PERMS.SYS) {
      return "❌ Seul un SYS peut gérer la wet list";
    }

    banStore.setWetEntry(targetId, {
      date: new Date().toLocaleString("fr-FR"),
      by: userId,
      reason
    });

    banStore.recordBan({
      userId: targetId,
      reason,
      type: "wet",
      duration: "Permanent (wet list)",
      endsAt: null,
      issuedBy: userId,
      issuedLevel: issuerPerm,
      stage: "permanent",
      guildId: message?.guild?.id || null
    });

    const embed = new EmbedBuilder()
      .setColor("#0b0b0b")
      .setTitle("WET LIST - ACTIVATION")
      .setDescription("L'utilisateur est ajouté à la wet list et banni indéfiniment.")
      .addFields(
        { name: "Utilisateur", value: `\`${targetId}\``, inline: true },
        { name: "Motif", value: reason, inline: false },
        { name: "Statut", value: "Ban infini avec rebannissement automatique", inline: false }
      )
      .setTimestamp();

    if (message) {
      await message.channel.send({ embeds: [embed] });
      const dmUser = await message.client.users.fetch(targetId).catch(() => null);
      if (dmUser) {
        await dmUser.send({ embeds: [embed] }).catch(() => {});
      }

      await message.guild?.members.ban(targetId, { reason }).catch(() => {});
    }

    return { embeds: [embed] };
  }
};
