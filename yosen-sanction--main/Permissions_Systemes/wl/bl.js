const { EmbedBuilder } = require("discord.js");
const banStore = require("../banStore");
const getUserPerm = require("../GetUserPerm");
const PERMS = require("../permission");

function extractMessage(args) {
  if (!args.length) return { message: null, cleanedArgs: [] };
  const maybeMessage = args[args.length - 1];
  if (maybeMessage && maybeMessage.content !== undefined) {
    return { message: maybeMessage, cleanedArgs: args.slice(0, -1) };
  }
  return { message: null, cleanedArgs: args };
}

module.exports = {
  name: "bl",
  async execute(userId, targetId, ...raw) {
    const { message, cleanedArgs } = extractMessage(raw);
    if (!targetId) return "❌ Utilisation: +bl <user_id> <raison>";

    const issuerPerm = getUserPerm(userId);
    if (issuerPerm > PERMS.SYS) {
      return "❌ Seul un SYS peut gérer la blacklist";
    }

    let selectedType = "classique";
    let reasonParts = cleanedArgs;
    if (cleanedArgs[0] && ["sys", "wet", "classique"].includes(cleanedArgs[0].toLowerCase())) {
      selectedType = cleanedArgs[0].toLowerCase();
      reasonParts = cleanedArgs.slice(1);
    }

    const reason = reasonParts.join(" ") || "Blacklist";

    banStore.addToBlacklist(targetId, {
      date: new Date().toLocaleString("fr-FR"),
      raison: reason,
      by: userId
    });

    let durationMs = 7 * 24 * 60 * 60 * 1000;
    let endsAt = new Date(Date.now() + durationMs).toISOString();
    let stage = "active";
    let durationLabel = "1 semaine (blacklist)";

    if (selectedType === "sys") {
      durationLabel = "Phase SYS : 7 jours puis définitif";
      stage = "conversion_pending";
    }

    if (selectedType === "wet") {
      durationLabel = "Permanent (wet list)";
      endsAt = null;
      durationMs = null;
      stage = "permanent";
      banStore.setWetEntry(targetId, {
        date: new Date().toLocaleString("fr-FR"),
        by: userId,
        reason
      });
    }

    banStore.recordBan({
      userId: targetId,
      reason,
      type: selectedType,
      duration: durationLabel,
      endsAt,
      issuedBy: userId,
      issuedLevel: issuerPerm,
      stage,
      guildId: message?.guild?.id || null
    });

    const embed = new EmbedBuilder()
      .setColor("#0b0b0b")
      .setTitle("BLACKLIST")
      .setDescription("Ajout sur la blacklist avec bannissement automatique.")
      .addFields(
        { name: "Utilisateur", value: `\`${targetId}\``, inline: true },
        { name: "Type", value: selectedType.toUpperCase(), inline: true },
        { name: "Durée", value: durationLabel, inline: true },
        { name: "Motif", value: reason, inline: false }
      )
      .setTimestamp();

    if (message) {
      await message.channel.send({ embeds: [embed] });
      await message.guild?.members.ban(targetId, { reason }).catch(() => {});
    }

    return { embeds: [embed] };
  }
};
