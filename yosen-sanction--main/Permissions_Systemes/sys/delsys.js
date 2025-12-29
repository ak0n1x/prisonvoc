const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");
const getUserPerm = require("../GetUserPerm");
const PERMS = require("../permission");
const checkPerm = require("../CheckPerm");

const permsPath = path.join(__dirname, "../perms.json");

function extractMessage(args) {
  const maybeMessage = args[args.length - 1];
  if (maybeMessage && maybeMessage.content !== undefined) {
    return { message: maybeMessage, cleanedArgs: args.slice(0, -1) };
  }
  return { message: null, cleanedArgs: args };
}

function resolveUserId(input, message) {
  if (!input) return null;
  const mentionId = message?.mentions?.users?.first()?.id;
  if (mentionId) return mentionId;
  if (/^\d{15,20}$/.test(input)) return input;
  const m = input.match(/^<@!?(\d{15,20})>$/);
  return m ? m[1] : null;
}

function readPerms() {
  if (!fs.existsSync(permsPath)) return {};
  try { return JSON.parse(fs.readFileSync(permsPath, "utf8")); }
  catch { return {}; }
}

function writePerms(data) {
  fs.writeFileSync(permsPath, JSON.stringify(data, null, 2));
}

module.exports = {
  name: "delsys",
  requiredPerm: PERMS.SYS,

  async execute(userId, targetArg, ...rest) {
    const userPerm = getUserPerm(userId);
    if (!checkPerm(userPerm, this.requiredPerm)) return;

    const { message } = extractMessage(rest);
    const targetId = resolveUserId(targetArg, message);

    if (!targetId) return "❌ Utilisation: +delsys <id|@mention>";

    const data = readPerms();
    if (data[targetId] !== "SYS") return "ℹ️ Cet utilisateur n'est pas SYS.";

    delete data[targetId];
    writePerms(data);

    const embed = new EmbedBuilder()
      .setColor("#FF0000")
      .setTitle("❌ SYSTÈME REMOVE")
      .addFields(
        { name: "👤 Système :", value: `\`\`\`\nIdentifiant :: ${userId}\n\`\`\``, inline: false },
        { name: "🎯 Cible :", value: `\`\`\`\nIdentifiant :: ${targetId}\n\`\`\``, inline: false },
        { name: "🔐 Niveau :", value: `\`\`\`\nStatut :: SUPPRIMÉ\nNiveau :: SYS (0)\n\`\`\``, inline: false },
        { name: "📋 Informations :", value: `\`\`\`\n> Statut : ✅ Succès\n> Date   : ${new Date().toLocaleString("fr-FR")}\n\`\`\``, inline: false }
      )
      .setFooter({ text: "YOSEN SANCTION • Permission System" })
      .setTimestamp();

    return { embeds: [embed] };
  }
};
