const { EmbedBuilder } = require("discord.js");
const getUserPerm = require("../GetUserPerm");
const PERMS = require("../permission");

const permNames = {
  0: "SYS",
  1: "OWNER",
  2: "WL",
  3: "PUBLIC"
};

// Toutes les commandes par niveau
const commandsByLevel = {
  SYS: [
    { cmd: "+addsys <@user>", desc: "Ajouter un SYS" },
    { cmd: "+delsys <@user>", desc: "Retirer un SYS" },
    { cmd: "+syslist", desc: "Lister les SYS" },
    { cmd: "+setperm <cmd> <perm>", desc: "Modifier permission d'une commande" },
    { cmd: "+getperm <cmd>", desc: "Voir permission d'une commande" },
    { cmd: "+listperms", desc: "Lister toutes les permissions" },
    { cmd: "+resetperms", desc: "Réinitialiser les permissions" },
    { cmd: "+bl <id> <raison>", desc: "Blacklister un utilisateur" },
    { cmd: "+unbl <id>", desc: "Retirer de la blacklist" },
    { cmd: "+blinfo <id>", desc: "Info blacklist" },
    { cmd: "+bllist", desc: "Lister la blacklist" },
    { cmd: "+wet <id> <temps>", desc: "Bannir temporairement" },
    { cmd: "+unwet <id>", desc: "Retirer du WET" },
    { cmd: "+wetinfo <id>", desc: "Info WET" },
    { cmd: "+massiverole <@role>", desc: "Ajouter rôle à tous" }
  ],
  OWNER: [
    { cmd: "+addowner <@user>", desc: "Ajouter un OWNER" },
    { cmd: "+delowner <@user>", desc: "Retirer un OWNER" },
    { cmd: "+ownerlist", desc: "Lister les OWNER" },
    { cmd: "+kick <@user> <raison>", desc: "Expulser un utilisateur" },
    { cmd: "+ban <@user> <raison>", desc: "Bannir un utilisateur" },
    { cmd: "+unban <id>", desc: "Débannir un utilisateur" },
    { cmd: "+baninfo <id>", desc: "Voir les infos de ban" },
    { cmd: "+tempmute <@user> <temps>", desc: "Mute temporaire" },
    { cmd: "+unmute <@user>", desc: "Retirer le mute" },
    { cmd: "+timeout <@user> <temps>", desc: "Timeout Discord" },
    { cmd: "+lock", desc: "Verrouiller le salon" },
    { cmd: "+unlock", desc: "Déverrouiller le salon" },
    { cmd: "+hide", desc: "Cacher le salon" },
    { cmd: "+unhide", desc: "Afficher le salon" },
    { cmd: "+renew", desc: "Renouveler les permissions" },
    { cmd: "+mv <@user> <canal>", desc: "Déplacer un utilisateur vocal" },
    { cmd: "+addrole <@user> <role>", desc: "Ajouter un rôle" },
    { cmd: "+derank <@user>", desc: "Retirer tous les rôles" },
    { cmd: "+blr <role_id>", desc: "Blacklister un rôle" },
    { cmd: "+clear <nombre>", desc: "Nettoyer les messages" }
  ],
  WL: [
    { cmd: "+addwl <@user>", desc: "Ajouter à la WL" },
    { cmd: "+delwl <@user>", desc: "Retirer de la WL" },
    { cmd: "+wllist", desc: "Lister la WL" },
    { cmd: "+warn <@user> <raison>", desc: "Avertir un utilisateur" },
    { cmd: "+snipe", desc: "Voir le dernier message supprimé" },
    { cmd: "+wlcmd", desc: "Commande WL de test" }
  ],
  PUBLIC: [
    { cmd: "+help", desc: "Afficher cette aide" },
    { cmd: "+test", desc: "Tester le bot" }
  ]
};

const roleEmoji = {
  "SYS": "👑",
  "OWNER": "👨‍💼",
  "WL": "✅",
  "PUBLIC": "👥"
};

const roleColor = {
  "SYS": "#FF00FF",
  "OWNER": "#FFA500",
  "WL": "#00FF00",
  "PUBLIC": "#7289DA"
};

module.exports = {
  name: "help",
  async execute(userId) {
    const userPerm = getUserPerm(userId);
    const userPermName = permNames[userPerm];
    const color = roleColor[userPermName] || "#0099FF";

    // Déterminer les niveaux à afficher (du niveau de l'utilisateur vers le bas)
    let levelsToShow = [];

    if (userPerm <= PERMS.SYS) {
      // SYS voit: SYS, OWNER, WL, PUBLIC
      levelsToShow = [
        { name: "SYS", cmds: commandsByLevel.SYS },
        { name: "OWNER", cmds: commandsByLevel.OWNER },
        { name: "WL", cmds: commandsByLevel.WL },
        { name: "PUBLIC", cmds: commandsByLevel.PUBLIC }
      ];
    } else if (userPerm <= PERMS.OWNER) {
      // OWNER voit: OWNER, WL, PUBLIC (pas SYS)
      levelsToShow = [
        { name: "OWNER", cmds: commandsByLevel.OWNER },
        { name: "WL", cmds: commandsByLevel.WL },
        { name: "PUBLIC", cmds: commandsByLevel.PUBLIC }
      ];
    } else if (userPerm <= PERMS.WL) {
      // WL voit: WL, PUBLIC (pas OWNER, pas SYS)
      levelsToShow = [
        { name: "WL", cmds: commandsByLevel.WL },
        { name: "PUBLIC", cmds: commandsByLevel.PUBLIC }
      ];
    } else {
      // PUBLIC voit: PUBLIC seulement (pas WL, pas OWNER, pas SYS)
      levelsToShow = [
        { name: "PUBLIC", cmds: commandsByLevel.PUBLIC }
      ];
    }

    // Créer les champs
    const fields = [];

    for (const section of levelsToShow) {
      const emoji = roleEmoji[section.name];
      const commandList = section.cmds
        .map(c => `\`${c.cmd}\` • ${c.desc}`)
        .join("\n");

      fields.push({
        name: `${emoji} ${section.name} (Niveau ${PERMS[section.name]})`,
        value: commandList || "Aucune commande",
        inline: false
      });
    }

    // Ajouter info utilisateur
    fields.push({
      name: "📊 Votre Profil",
      value: `\`\`\`
Niveau         :: ${userPermName} (${userPerm})
Prefix         :: +
Version        :: 2.0
Status         :: 🟢 EN LIGNE
\`\`\``,
      inline: false
    });

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(`🤖 HELP - ${userPermName}`)
      .setDescription(`Commandes accessibles pour le niveau ${userPermName}`)
      .addFields(fields)
      .setFooter({ text: "YOSEN SANCTION • Aide Personnalisée" })
      .setTimestamp();

    return { embeds: [embed] };
  }
};