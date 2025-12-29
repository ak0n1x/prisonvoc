const {
  ActionRowBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder
} = require("discord.js");
const getUserPerm = require("../GetUserPerm");
const PERMS = require("../permission");
const banStore = require("../banStore");

const durationPresets = {
  "24h": { label: "24 heures", ms: 24 * 60 * 60 * 1000 },
  "3d": { label: "3 jours", ms: 3 * 24 * 60 * 60 * 1000 },
  "1w": { label: "1 semaine", ms: 7 * 24 * 60 * 60 * 1000 },
  "permanent": { label: "Permanent", ms: null }
};

const permNames = {
  0: "SYS",
  1: "OWNER",
  2: "WL",
  3: "PUBLIC"
};

function extractMessage(args) {
  if (!args.length) return { message: null, cleanedArgs: [] };
  const maybeMessage = args[args.length - 1];
  if (maybeMessage && maybeMessage.content !== undefined) {
    return { message: maybeMessage, cleanedArgs: args.slice(0, -1) };
  }
  return { message: null, cleanedArgs: args };
}

function buildMenuEmbed(targetId, reasonText, selection, sanctionCount) {
  const durationLabel = durationPresets[selection.duration]?.label || "Non défini";
  return new EmbedBuilder()
    .setColor("#0b0b0b")
    .setTitle("SÉLECTEUR DE SANCTION")
    .setDescription("Choisissez la durée et le type avant de valider le ban.")
    .addFields(
      { name: "Cible", value: `\`${targetId}\``, inline: true },
      { name: "Raison", value: reasonText || "Aucune", inline: false },
      { name: "Durée", value: durationLabel, inline: true },
      { name: "Type", value: selection.type.toUpperCase(), inline: true },
      { name: "Sanctions existantes", value: `${sanctionCount}`, inline: true }
    )
    .setTimestamp();
}

function buildDmEmbed(entry) {
  const endDate = entry.endsAt
    ? new Date(entry.endsAt).toLocaleString("fr-FR")
    : "Aucune (infini)";

  return new EmbedBuilder()
    .setColor("#0b0b0b")
    .setTitle("Notification de bannissement")
    .setDescription("Vous êtes banni. Les informations ci-dessous précisent la sanction appliquée.")
    .addFields(
      { name: "Motif", value: entry.reason || "Aucun" },
      { name: "Type", value: entry.type.toUpperCase() },
      { name: "Durée", value: entry.duration },
      { name: "Fin prévue", value: endDate }
    )
    .setFooter({ text: "Système de sanctions" })
    .setTimestamp();
}

module.exports = {
  name: "ban",
  async execute(userId, targetId, ...rawReason) {
    const { message, cleanedArgs } = extractMessage(rawReason);
    const reason = cleanedArgs.join(" ");

    if (!targetId) {
      const errorEmbed = new EmbedBuilder()
        .setColor("#808080")
        .addFields(
          { name: "Type", value: "Arguments manquants", inline: true },
          { name: "Utilisation", value: "+ban <id> <raison>", inline: false }
        )
        .setTimestamp();

      return { embeds: [errorEmbed] };
    }

    if (!message) {
      return "❌ Le contexte du message est requis pour ouvrir le menu.";
    }

    if (!reason) {
      const errorEmbed = new EmbedBuilder()
        .setColor("#808080")
        .addFields(
          { name: "Type", value: "Raison obligatoire", inline: true },
          { name: "Utilisation", value: "+ban <id> <raison>", inline: false }
        )
        .setTimestamp();

      return { embeds: [errorEmbed] };
    }

    const issuerPerm = getUserPerm(userId);
    if (issuerPerm > PERMS.OWNER) {
      const errorEmbed = new EmbedBuilder()
        .setColor("#808080")
        .addFields(
          { name: "Type", value: "Permission insuffisante", inline: true },
          { name: "Votre niveau", value: permNames[issuerPerm], inline: true },
          { name: "Requis", value: "OWNER ou SYS", inline: true }
        )
        .setTimestamp();

      return { embeds: [errorEmbed] };
    }

    const targetPerm = getUserPerm(targetId);
    const sanctionCount = banStore.getBanCount(targetId);
    const initialSelection = { duration: "24h", type: "classique" };

    const durationMenu = new StringSelectMenuBuilder()
      .setCustomId("ban-duration")
      .setPlaceholder("Durée de la sanction")
      .addOptions(
        Object.entries(durationPresets).map(([value, preset]) => ({
          label: preset.label,
          value
        }))
      );

    const typeMenu = new StringSelectMenuBuilder()
      .setCustomId("ban-type")
      .setPlaceholder("Type de sanction")
      .addOptions([
        { label: "Classique", value: "classique" },
        { label: "SYS", value: "sys" },
        { label: "WET", value: "wet" }
      ]);

    const components = [
      new ActionRowBuilder().addComponents(durationMenu),
      new ActionRowBuilder().addComponents(typeMenu)
    ];

    const promptEmbed = buildMenuEmbed(targetId, reason, initialSelection, sanctionCount);
    const promptMessage = await message.reply({ embeds: [promptEmbed], components });

    let selection = { ...initialSelection };

    const collector = promptMessage.createMessageComponentCollector({
      time: 60_000,
      filter: (interaction) => interaction.user.id === userId
    });

    collector.on("collect", async (interaction) => {
      if (interaction.customId === "ban-duration") {
        selection.duration = interaction.values[0];
      }
      if (interaction.customId === "ban-type") {
        selection.type = interaction.values[0];
      }
      const updatedEmbed = buildMenuEmbed(targetId, reason, selection, sanctionCount);
      await interaction.update({ embeds: [updatedEmbed], components });
    });

    collector.on("end", async () => {
      const disabled = components.map((row) =>
        new ActionRowBuilder().addComponents(
          ...row.components.map((component) => component.setDisabled(true))
        )
      );
      await promptMessage.edit({ components: disabled });

      await this.finalizeBan({
        message,
        userId,
        targetId,
        reason,
        selection,
        issuerPerm,
        targetPerm
      });
    });
  },

  async finalizeBan({ message, userId, targetId, reason, selection, issuerPerm, targetPerm }) {
    const now = Date.now();
    let durationLabel = durationPresets[selection.duration]?.label || "Non défini";
    let durationMs = durationPresets[selection.duration]?.ms ?? null;
    let endsAt = durationMs ? new Date(now + durationMs).toISOString() : null;
    let stage = "active";

    if (selection.type === "sys") {
      if (targetPerm > PERMS.SYS) {
        durationMs = 24 * 60 * 60 * 1000;
        durationLabel = "24 heures (limite SYS)";
        endsAt = new Date(now + durationMs).toISOString();
      } else {
        durationMs = 7 * 24 * 60 * 60 * 1000;
        durationLabel = "Phase SYS : 7 jours puis définitif";
        endsAt = new Date(now + durationMs).toISOString();
        stage = "conversion_pending";
      }
    }

    if (selection.type === "wet") {
      durationMs = null;
      endsAt = null;
      durationLabel = "Permanent (wet list)";
      stage = "permanent";
      banStore.setWetEntry(targetId, {
        date: new Date().toLocaleString("fr-FR"),
        by: userId,
        reason
      });
    }

    if (selection.type === "classique" && durationMs === null) {
      stage = "permanent";
    }

    const { count, entry } = banStore.recordBan({
      userId: targetId,
      reason,
      type: selection.type,
      duration: durationLabel,
      endsAt,
      issuedBy: userId,
      issuedLevel: issuerPerm,
      stage,
      guildId: message.guild?.id || null
    });

    const channelEmbed = new EmbedBuilder()
      .setColor("#0b0b0b")
      .setTitle("Bannissement appliqué")
      .addFields(
        { name: "Utilisateur", value: `\`${targetId}\``, inline: true },
        { name: "Type", value: selection.type.toUpperCase(), inline: true },
        { name: "Durée", value: durationLabel, inline: true },
        { name: "Fin prévue", value: endsAt ? new Date(endsAt).toLocaleString("fr-FR") : "Aucune" },
        { name: "Motif", value: reason, inline: false },
        { name: "Sanctions enregistrées", value: `${count}`, inline: true }
      )
      .setTimestamp();

    await message.channel.send({ embeds: [channelEmbed] });

    const dmUser = await message.client.users.fetch(targetId).catch(() => null);
    if (dmUser) {
      const dmEmbed = buildDmEmbed(entry);
      await dmUser.send({ embeds: [dmEmbed] }).catch(() => {});
    }

    try {
      await message.guild?.members.ban(targetId, { reason }).catch(() => {});
    } catch (err) {
      console.error("Erreur lors du ban Discord:", err.message);
    }
  }
};
