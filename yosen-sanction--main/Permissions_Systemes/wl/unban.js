const { EmbedBuilder } = require("discord.js");
const getUserPerm = require("../GetUserPerm");
const PERMS = require("../permission");
const banStore = require("../banStore");

const permNames = {
  0: "SYS",
  1: "OWNER",
  2: "WL",
  3: "PUBLIC",
};

function extractMessage(args) {
  if (!args.length) return { message: null, cleanedArgs: [] };
  const maybeMessage = args[args.length - 1];
  if (maybeMessage && maybeMessage.content !== undefined) {
    return { message: maybeMessage, cleanedArgs: args.slice(0, -1) };
  }
  return { message: null, cleanedArgs: args };
}

// accepte ID / <@id> / <@!id> / mention
function resolveUserId(input, message) {
  if (!input) return null;

  const fromMentions = message?.mentions?.users?.first()?.id;
  if (fromMentions) return fromMentions;

  if (/^\d{15,20}$/.test(input)) return input;

  const mentionMatch = input.match(/^<@!?(\d{15,20})>$/);
  if (mentionMatch) return mentionMatch[1];

  return null;
}

module.exports = {
  name: "unban",
  async execute(userId, targetId, ...rest) {
    const { message: contextMessage } = extractMessage(rest);

    const resolvedTargetId = resolveUserId(targetId, contextMessage);
    if (!resolvedTargetId) return "❌ Utilisation: +unban <user_id|@mention>";

    const active = banStore.getActiveBan(resolvedTargetId);
    if (!active) return `❌ ${resolvedTargetId} n'est pas banni`;

    const userPerm = getUserPerm(userId);

    // 🔒 Règle principale : tu ne peux unban que si ton rang >= rang du bannisseur
    // (0 = SYS est plus haut que 1 = OWNER, etc.)
    const issuerLevel = typeof active.issuedLevel === "number" ? active.issuedLevel : null;

    if (issuerLevel === null) {
      // fallback si old bans n’ont pas issuedLevel
      return "❌ Impossible de déterminer le niveau du bannisseur (ban trop ancien).";
    }

    // Exemple: ban par SYS (0) => userPerm doit être 0
    // ban par OWNER (1) => userPerm peut être 0 ou 1
    if (userPerm > issuerLevel) {
      return `❌ Vous ne pouvez pas retirer ce ban. Requis: ${permNames[issuerLevel] ?? "INCONNU"} ou supérieur.`;
    }

    // (optionnel) Interdire PUBLIC même si jamais ça arriverait
    if (userPerm > PERMS.WL) {
      return "❌ Permission insuffisante.";
    }

    // Supprimer du store
    banStore.removeBan(resolvedTargetId);

    const embed = new EmbedBuilder()
      .setColor("#0b0b0b")
      .setTitle("DÉBANNISSEMENT")
      .setDescription("Le bannissement actif a été retiré.")
      .addFields(
        { name: "Utilisateur", value: `\`${resolvedTargetId}\``, inline: true },
        { name: "Type", value: (active.type || "INCONNU").toUpperCase(), inline: true },
        { name: "Motif initial", value: active.reason || "Aucun", inline: false },
        {
          name: "Ban appliqué par",
          value: `${permNames[issuerLevel] ?? issuerLevel}`,
          inline: true,
        }
      )
      .setTimestamp();

    // Unban Discord si on a un contexte serveur
    if (contextMessage) {
      const guild =
        contextMessage.guild ||
        (active.guildId
          ? await contextMessage.client.guilds.fetch(active.guildId).catch(() => null)
          : null);

      if (guild) {
        await guild.members.unban(resolvedTargetId).catch(() => {});
      }
    }

    return { embeds: [embed], targetId: resolvedTargetId };
  },
};
