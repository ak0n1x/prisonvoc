const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");
const getUserPerm = require("../GetUserPerm");
const PERMS = require("../permission");
const checkPerm = require("../CheckPerm");

module.exports = {
  name: "unban",
  async execute(userId, targetId) {
    if (!targetId) return "❌ Utilisation: +unban <user_id>";
    
    const banPath = path.join(__dirname, "../../data/bans.json");
    
    if (!fs.existsSync(banPath)) return "❌ Aucun ban enregistré";
    
    const bans = JSON.parse(fs.readFileSync(banPath, "utf8"));
    const ban = bans[targetId];

    if (!ban) return `❌ ${targetId} n'est pas banni`;

    // Récupérer les permissions
    const userPerm = getUserPerm(userId);
    const banType = ban.type; // "PERMANENT" ou "TEMPORAIRE"
    const bannedByLevel = ban.byLevel; // Niveau de celui qui a banni

    // Vérifier les permissions pour débannir
    if (banType === "PERMANENT") {
      // Ban permanent : Seul un SYS peut retirer
      if (userPerm > PERMS.SYS) {
        return "❌ Seul un SYS peut retirer un ban permanent";
      }
    } else if (banType === "TEMPORAIRE") {
      // Ban temporaire (24h) : SYS et OWNER qui l'a banni peuvent retirer
      if (userPerm > PERMS.OWNER || (userPerm === PERMS.OWNER && ban.by !== userId)) {
        // Si c'est un OWNER, il peut seulement retirer ses propres bans
        if (userPerm > PERMS.OWNER) {
          return "❌ Seul un SYS ou l'OWNER qui a banni peut retirer ce ban";
        }
      }
    }

    // Retirer le ban
    delete bans[targetId];
    fs.writeFileSync(banPath, JSON.stringify(bans, null, 2));

    // Embed de débannissement
    const embed = new EmbedBuilder()
      .setColor("#00FF00")
      .setTitle("✅ DÉBANNISSEMENT")
      .setDescription(`
\`\`\`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\``)
      .addFields(
        {
          name: "👤 Utilisateur :",
          value: `\`\`\`\nID :: ${targetId}\n\`\`\``,
          inline: false
        },
        {
          name: "🔓 Débannissement :",
          value: `\`\`\`\nStatut :: RETIRÉ\nType   :: ${banType}\n\`\`\``,
          inline: false
        },
        {
          name: "📋 Informations :",
          value: `\`\`\`\n> Retiré par : ${userId}\n> Date       : ${new Date().toLocaleString('fr-FR')}\n> Raison    : ${ban.raison}\n\`\`\``,
          inline: false
        }
      )
      .setFooter({ text: "YOSEN SANCTION • Ban System" })
      .setTimestamp();

    // Embed pour le DM de débannissement
    const dmEmbed = new EmbedBuilder()
      .setColor("#00FF00")
      .setTitle("✅ DÉBANNISSEMENT")
      .setDescription(`
\`\`\`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\``)
      .addFields(
        {
          name: "✅ Statut :",
          value: `\`\`\`\nVotre ban a été retiré\nYOSEN SANCTION\n\`\`\``,
          inline: false
        },
        {
          name: "📝 Détails :",
          value: `\`\`\`\nRaison originale :: ${ban.raison}\nRetiré par       :: ${userId}\nDate             :: ${new Date().toLocaleString('fr-FR')}\n\`\`\``,
          inline: false
        },
        {
          name: "ℹ️ Information :",
          value: `\`\`\`\nVous pouvez à nouveau accéder au serveur.\nRespectez les règles!\n\`\`\``,
          inline: false
        }
      )
      .setFooter({ text: "YOSEN SANCTION • Ban System" })
      .setTimestamp();

    return { 
      embeds: [embed],
      dmEmbed: dmEmbed,
      targetId: targetId
    };
  }
};