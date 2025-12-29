const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");
const getUserPerm = require("../GetUserPerm");
const PERMS = require("../permission");

// Helper pour les noms de permission
const permNames = {
  0: "SYS",
  1: "OWNER",
  2: "WL",
  3: "PUBLIC"
};

module.exports = {
  name: "ban",
  async execute(userId, targetId, ...reason) {
    // Vérifier que targetId et raison sont fournis
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

    // La raison est OBLIGATOIRE
    if (reason.length === 0) {
      const errorEmbed = new EmbedBuilder()
        .setColor("#808080")
        .addFields(
          { name: "Type", value: "Raison obligatoire", inline: true },
          { name: "Utilisation", value: "+ban <id> <raison>", inline: false }
        )
        .setTimestamp();
      
      return { embeds: [errorEmbed] };
    }

    // Récupérer le niveau de permission du modérateur
    const userPerm = getUserPerm(userId);

    // Vérifier que seul OWNER et SYS peuvent bannir
    if (userPerm > PERMS.OWNER) {
      const errorEmbed = new EmbedBuilder()
        .setColor("#808080")
        .addFields(
          { name: "Type", value: "Permission insuffisante", inline: true },
          { name: "Votre niveau", value: permNames[userPerm], inline: true },
          { name: "Requis", value: "OWNER ou SYS", inline: true }
        )
        .setTimestamp();
      
      return { embeds: [errorEmbed] };
    }

    const reasonText = reason.join(" ");
    const banPath = path.join(__dirname, "../../data/bans.json");
    const dir = path.dirname(banPath);
    
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    const bans = fs.existsSync(banPath) 
      ? JSON.parse(fs.readFileSync(banPath, "utf8"))
      : {};

    // Vérifier si déjà banni
    if (bans[targetId]) {
      const errorEmbed = new EmbedBuilder()
        .setColor("#808080")
        .addFields(
          { name: "Type", value: "Déjà banni", inline: true },
          { name: "Utilisateur", value: targetId, inline: true },
          { name: "Raison du ban", value: bans[targetId].raison, inline: false },
          { name: "Date du ban", value: bans[targetId].date, inline: true }
        )
        .setTimestamp();
      
      return { embeds: [errorEmbed] };
    }

    const now = new Date();
    let unbanTime = null;
    let banType = "";
    let duration = "";

    // Déterminer la durée selon le niveau du modérateur
    if (userPerm <= PERMS.SYS) {
      // SYS : Ban infini, personne ne peut retirer sauf un autre SYS
      unbanTime = null; // null = infini
      banType = "PERMANENT";
      duration = "Infini";
    } else if (userPerm <= PERMS.OWNER) {
      // OWNER : Ban 24h, que SYS peut retirer
      unbanTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      banType = "TEMPORAIRE";
      duration = "24 heures";
    }

    // Enregistrer le ban
    bans[targetId] = {
      date: now.toLocaleString('fr-FR'),
      raison: reasonText,
      by: userId,
      byLevel: userPerm,
      type: banType,
      unbanTime: unbanTime ? unbanTime.toISOString() : null,
      timestamp: now.getTime()
    };
    
    fs.writeFileSync(banPath, JSON.stringify(bans, null, 2));

    // Configurer le débannissement automatique (seulement si durée finie)
    if (unbanTime) {
      setTimeout(() => {
        try {
          const updatedBans = JSON.parse(fs.readFileSync(banPath, "utf8"));
          if (updatedBans[targetId] && updatedBans[targetId].type === "TEMPORAIRE") {
            delete updatedBans[targetId];
            fs.writeFileSync(banPath, JSON.stringify(updatedBans, null, 2));
            console.log(`✅ ${targetId} a été automatiquement débanni après 24h`);
          }
        } catch (err) {
          console.error("Erreur débannissement auto:", err);
        }
      }, 24 * 60 * 60 * 1000);
    }

    // Embed style hacker avec bande noire (pour le salon)
    const embed = new EmbedBuilder()
      .setColor("#000000")
      .setTitle("🚫 BAN SYSTEM")
      .setDescription(`
\`\`\`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\``)
      .addFields(
        {
          name: "👤 Système :",
          value: `\`\`\`\nNom d'utilisateur :: ${targetId}\nIdentifiant       :: ${userId}\nNiveau mod        :: ${userPerm === PERMS.SYS ? "SYS" : "OWNER"}\n\`\`\``,
          inline: false
        },
        {
          name: "🚫 Bannissement :",
          value: `\`\`\`\nStatut  :: ACTIF\nDurée   :: ${duration}\nType    :: ${banType}\n\`\`\``,
          inline: false
        },
        {
          name: "📋 Informations :",
          value: `\`\`\`\n> Raison  : ${reasonText}\n> Date    : ${now.toLocaleString('fr-FR')}\n> Expira  : ${unbanTime ? unbanTime.toLocaleString('fr-FR') : "JAMAIS"}\n\`\`\``,
          inline: false
        }
      )
      .setFooter({ text: "YOSEN SANCTION • Ban System" })
      .setTimestamp();

    // Embed pour le DM (style hacker aussi)
    const dmEmbed = new EmbedBuilder()
      .setColor("#FF0000")
      .setTitle("🚫 BAN NOTIFICATION")
      .setDescription(`
\`\`\`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\``)
      .addFields(
        {
          name: "⚠️ Statut :",
          value: `\`\`\`\nVous avez été banni du serveur\nYOSEN SANCTION\n\`\`\``,
          inline: false
        },
        {
          name: "📝 Détails :",
          value: `\`\`\`\nRaison  :: ${reasonText}\nDurée   :: ${duration}\nType    :: ${banType}\nDébat   :: ${unbanTime ? unbanTime.toLocaleString('fr-FR') : "PERMANENT"}\n\`\`\``,
          inline: false
        },
        {
          name: "ℹ️ Information :",
          value: unbanTime 
            ? `\`\`\`\nVous serez automatiquement débanni\naprès 24 heures. Respectez les règles!\n\`\`\``
            : `\`\`\`\nCe ban est permanent.\nSeul un SYS peut retirer ce ban.\n\`\`\``,
          inline: false
        }
      )
      .setFooter({ text: "YOSEN SANCTION • Ban System" })
      .setTimestamp();

    // Retourner les embeds et un flag pour bannir vraiment du serveur
    return { 
      embeds: [embed],
      dmEmbed: dmEmbed,
      targetId: targetId,
      shouldBan: true, // Flag pour main.js
      shouldKick: true, // Flag pour faire partir du serveur aussi
      banReason: reasonText
    };
  }
};