const { EmbedBuilder } = require("discord.js");
const getUserPerm = require("../GetUserPerm");
const PERMS = require("../permission");
const banStore = require("../banStore");

module.exports = {
  name: "unban",
  async execute(userId, targetId, ...rest) {
    if (!targetId) return "❌ Utilisation: +unban <user_id>";

    const active = banStore.getActiveBan(targetId);
    if (!active) return `❌ ${targetId} n'est pas banni`;

    const userPerm = getUserPerm(userId);

    if (active.type === "sys" && userPerm > PERMS.SYS) {
      return "❌ Seul un SYS peut retirer un ban SYS";
    }

    if (active.type === "classique" && active.stage !== "permanent" && userPerm > PERMS.OWNER) {
      return "❌ Seul un OWNER ou SYS peut retirer ce ban";
    }

    const contextMessage = rest.find((value) => value?.content !== undefined) || null;

    banStore.removeBan(targetId);

    const embed = new EmbedBuilder()
      .setColor("#0b0b0b")
      .setTitle("DÉBANNISSEMENT")
      .setDescription("Le bannissement actif a été retiré.")
      .addFields(
        { name: "Utilisateur", value: `\`${targetId}\``, inline: true },
        { name: "Type", value: active.type.toUpperCase(), inline: true },
        { name: "Motif initial", value: active.reason || "Aucun", inline: false }
      )
      .setTimestamp();

    if (contextMessage) {
      const guild =
        contextMessage.guild ||
        (active.guildId
          ? await contextMessage.client.guilds.fetch(active.guildId).catch(() => null)
          : null);

      if (guild) {
        await guild.members.unban(targetId).catch(() => {});
      }
    }

    return { embeds: [embed], targetId };
  }
};
