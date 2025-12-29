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

const DURATION = {
  SYS: { label: "Infini", ms: null },
  OWNER: { label: "1 semaine", ms: 7 * 24 * 60 * 60 * 1000 },
  WL: { label: "24 heures", ms: 24 * 60 * 60 * 1000 },
};

function extractMessage(args) {
  if (!args.length) return { message: null, cleanedArgs: [] };
  const maybeMessage = args[args.length - 1];
  if (maybeMessage && maybeMessage.content !== undefined) {
    return { message: maybeMessage, cleanedArgs: args.slice(0, -1) };
  }
  return { message: null, cleanedArgs: args };
}

// ✅ NOUVEAU : accepte ID brut, <@id>, <@!id>, ou mention dans le message
function resolveUserId(input, message) {
  if (!input) return null;

  // Si la personne a été mentionnée, c'est le plus fiable
  const fromMentions = message?.mentions?.users?.first()?.id;
  if (fromMentions) return fromMentions;

  // Si c'est déjà un ID
  if (/^\d{15,20}$/.test(input)) return input;

  // Mention <@123> ou <@!123>
  const mentionMatch = input.match(/^<@!?(\d{15,20})>$/);
  if (mentionMatch) return mentionMatch[1];

  return null;
}

function formatUserBlock(user, fallbackId) {
  const username = user?.username ?? "Inconnu";
  const id = user?.id ?? fallbackId ?? "Inconnu";
  return "```" + `Nom d'utilisateur :: ${username}\nIdentifiant       :: ${id}` + "```";
}

function buildBanInfoEmbed({ issuerUser, targetUser, reason, typeLabel, durationLabel }) {
  return new EmbedBuilder()
    .setColor("#0b0b0b")
    .setTitle(`🔎 BAN INFO ${targetUser ? `@${targetUser.username}` : ""}`.trim())
    .addFields(
      { name: "Système :", value: formatUserBlock(issuerUser, issuerUser?.id), inline: false },
      { name: "Criminel :", value: formatUserBlock(targetUser, targetUser?.id), inline: false },
      {
        name: "Informations :",
        value: `> Raison : \`${reason}\`\n> Type : \`${typeLabel}\`\n> Durée : \`${durationLabel}\``,
        inline: false,
      }
    )
    .setTimestamp();
}

function buildDmEmbed({ reason, typeLabel, durationLabel, endsAtISO }) {
  const endDate = endsAtISO ? new Date(endsAtISO).toLocaleString("fr-FR") : "Aucune (infini)";

  return new EmbedBuilder()
    .setColor("#0b0b0b")
    .setTitle("Notification de bannissement")
    .setDescription("Vous êtes banni. Les informations ci-dessous précisent la sanction appliquée.")
    .addFields(
      { name: "Motif", value: reason || "Aucun" },
      { name: "Type", value: typeLabel },
      { name: "Durée", value: durationLabel },
      { name: "Fin prévue", value: endDate }
    )
    .setFooter({ text: "Système de sanctions" })
    .setTimestamp();
}

module.exports = {
  name: "ban",

  async execute(userId, targetId, ...rawReason) {
    const { message, cleanedArgs } = extractMessage(rawReason);
    const reason = cleanedArgs.join(" ").trim();

    if (!message) return "❌ Le contexte du message est requis.";

    // ✅ NOUVEAU : on résout la cible (mention ou id)
    const resolvedTargetId = resolveUserId(targetId, message);

    if (!resolvedTargetId) {
      const e = new EmbedBuilder()
        .setColor("#808080")
        .addFields(
          { name: "Type", value: "Cible invalide", inline: true },
          { name: "Utilisation", value: "+ban <id|@mention> <raison>", inline: false }
        )
        .setTimestamp();
      return { embeds: [e] };
    }

    if (!reason) {
      const e = new EmbedBuilder()
        .setColor("#808080")
        .addFields(
          { name: "Type", value: "Raison obligatoire", inline: true },
          { name: "Utilisation", value: "+ban <id|@mention> <raison>", inline: false }
        )
        .setTimestamp();
      return { embeds: [e] };
    }

    // Perm de celui qui ban
    const issuerPerm = getUserPerm(userId);

    // Autoriser SYS / OWNER / WL à ban
    if (issuerPerm > PERMS.WL) {
      const e = new EmbedBuilder()
        .setColor("#808080")
        .addFields(
          { name: "Type", value: "Permission insuffisante", inline: true },
          { name: "Votre niveau", value: permNames[issuerPerm] ?? "INCONNU", inline: true },
          { name: "Requis", value: "WL ou plus", inline: true }
        )
        .setTimestamp();
      return { embeds: [e] };
    }

    // Perm de la cible (pour empêcher de ban quelqu’un au-dessus / égal si pas SYS)
    const targetPerm = getUserPerm(resolvedTargetId);
    if (issuerPerm !== PERMS.SYS && targetPerm <= issuerPerm) {
      const e = new EmbedBuilder()
        .setColor("#808080")
        .addFields(
          { name: "Type", value: "Action interdite", inline: true },
          { name: "Votre niveau", value: permNames[issuerPerm] ?? "INCONNU", inline: true },
          { name: "Niveau cible", value: permNames[targetPerm] ?? "INCONNU", inline: true }
        )
        .setDescription("❌ Vous ne pouvez pas bannir un membre de niveau égal ou supérieur.")
        .setTimestamp();
      return { embeds: [e] };
    }

    // Type + durée AUTOMATIQUES selon le niveau du staff (issuer)
    const issuerLevelName = permNames[issuerPerm] ?? "PUBLIC";
    const rule = DURATION[issuerLevelName] ?? DURATION.WL;

    const now = Date.now();
    const endsAtISO = rule.ms ? new Date(now + rule.ms).toISOString() : null;

    const typeLabel = issuerLevelName; // SYS / OWNER / WL
    const durationLabel = rule.label;  // Infini / 1 semaine / 24h
    const stage = rule.ms ? "active" : "permanent";

    // log/stockage
    banStore.getBanCount(resolvedTargetId); // si tu l'utilises ailleurs
    const { count, entry } = banStore.recordBan({
      userId: resolvedTargetId,
      reason,
      type: typeLabel.toLowerCase(), // "sys" / "owner" / "wl"
      duration: durationLabel,
      endsAt: endsAtISO,
      issuedBy: userId,
      issuedLevel: issuerPerm,
      stage,
      guildId: message.guild?.id || null,
    });

    // Récup users pour l’embed style “BAN INFO”
    const issuerUser = await message.client.users.fetch(userId).catch(() => null);
    const targetUser = await message.client.users.fetch(resolvedTargetId).catch(() => null);

    const infoEmbed = buildBanInfoEmbed({
      issuerUser,
      targetUser: targetUser ?? { id: resolvedTargetId, username: "Inconnu" },
      reason,
      typeLabel,
      durationLabel,
    });

    await message.channel.send({ embeds: [infoEmbed] });

    // DM
    if (targetUser) {
      const dmEmbed = buildDmEmbed({ reason, typeLabel, durationLabel, endsAtISO });
      await targetUser.send({ embeds: [dmEmbed] }).catch(() => {});
    }

    // Ban Discord
    try {
      await message.guild?.members.ban(resolvedTargetId, { reason });
    } catch (err) {
      console.error("Erreur lors du ban Discord:", err?.message ?? err);
    }

    return;
  },
};
