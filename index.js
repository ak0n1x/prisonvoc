const {
  Client,
  GatewayIntentBits,
  ChannelType,
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

const TOKEN = process.env.DISCORD_TOKEN;
const PRISON_CHANNEL_ID = '1444470661979312168';
const PRISON_ROLE_ID = '1444471176817803475';
const OWNER_ROLE_ID = '1444469426962436136';

const lockedUsers = new Map();

function hasPrisonPermission(member) {
  if (!member) return false;
  if (member.roles.cache.has(OWNER_ROLE_ID)) return true;
  return member.roles.cache.has(PRISON_ROLE_ID);
}

function hasOwnerPermission(member) {
  if (!member) return false;
  return (
    member.roles.cache.has(OWNER_ROLE_ID)
  );
}

function parseDuration(str) {
  const match = /^(\d+)([smhd])?$/.exec(str);
  if (!match) return null;

  const value = parseInt(match[1], 10);
  const unit = match[2] || 'm';

  let mul;
  switch (unit) {
    case 's':
      mul = 1000;
      break;
    case 'm':
      mul = 60 * 1000;
      break;
    case 'h':
      mul = 60 * 60 * 1000;
      break;
    case 'd':
      mul = 24 * 60 * 60 * 1000;
      break;
    default:
      return null;
  }
  return value * mul;
}

function formatRemaining(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) return `${minutes} min ${seconds}s`;
  return `${seconds}s`;
}

client.once('ready', async () => {
  console.log(`Connecté en tant que ${client.user.tag}`);
  try {
    await client.application.commands.create({
      name: 'ping',
      description: 'Test : le bot répond Pong !',
    });
    console.log('Slash commande /ping enregistrée');
  } catch (err) {
    console.error('Erreur enregistrement /ping :', err);
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  const parts = message.content.trim().split(/\s+/);
  const command = parts[0].toLowerCase();

  if (command === '.lock') {
    if (!hasPrisonPermission(message.member)) {
      message.reply(
        "Tu n'as pas le rôle requis pour utiliser cette commande."
      );
      return;
    }

    const argUser = parts[1];
    const argDuration = parts[2];

    if (!argUser) {
      message.reply(
        'Utilisation : `.lock @utilisateur`, `.lock @utilisateur 10m` ou `.lock help`.'
      );
      return;
    }

    if (argUser.toLowerCase() === 'help') {
      message.reply(
        [
          'Commandes du bot prison :',
          '`.lock @utilisateur` → enferme jusqu’à `.unlock` (réservé au rôle dédié)',
          '`.lock @utilisateur 10m` → enferme pour une durée (s = secondes, m = minutes, h = heures, d = jours)',
          '`.unlock @utilisateur` → libère la personne',
          '`.unlockall` → libère tout le monde (owner seulement)',
          '`.lockinfo @utilisateur` → affiche le temps restant ou indique si la personne est libre',
          '`/ping` → commande slash basique pour le badge Active Developer',
        ].join('\n')
      );
      return;
    }

    let target =
      message.mentions.members.first() ||
      (await message.guild.members.fetch(argUser).catch(() => null));

    if (!target) {
      message.reply("Je ne trouve pas cet utilisateur sur le serveur.");
      return;
    }

    if (target.id === message.member.id) {
      message.reply("Tu ne peux pas t'enfermer toi-même.");
      return;
    }

    if (target.id === message.guild.ownerId) {
      message.reply("Tu ne peux pas enfermer le propriétaire du serveur.");
      return;
    }

    const memberTop = message.member.roles.highest;
    const targetTop = target.roles.highest;
    if (
      memberTop &&
      targetTop &&
      targetTop.comparePositionTo(memberTop) >= 0 &&
      !hasOwnerPermission(message.member)
    ) {
      message.reply(
        "Tu ne peux pas enfermer quelqu'un qui a un rôle supérieur ou égal au tien."
      );
      return;
    }

    const prisonChannel = message.guild.channels.cache.get(
      PRISON_CHANNEL_ID
    );
    if (
      !prisonChannel ||
      prisonChannel.type !== ChannelType.GuildVoice
    ) {
      message.reply(
        "Le salon de prison est introuvable ou n'est pas un salon vocal."
      );
      return;
    }

    let durationMs = null;
    let expiresText = 'jusqu’à déverrouillage manuel';
    if (argDuration) {
      durationMs = parseDuration(argDuration);
      if (!durationMs) {
        message.reply(
          "Durée invalide. Exemple : `30s`, `10m`, `2h`, `1d`."
        );
        return;
      }
      expiresText = `pendant ${argDuration}`;
    }

    const existing = lockedUsers.get(target.id);
    if (existing && existing.timeout) {
      clearTimeout(existing.timeout);
    }

    let timeout = null;
    if (durationMs) {
      timeout = setTimeout(() => {
        lockedUsers.delete(target.id);
      }, durationMs);
    }

    lockedUsers.set(target.id, {
      channelId: PRISON_CHANNEL_ID,
      expiresAt: durationMs ? Date.now() + durationMs : null,
      timeout,
    });

    try {
      if (target.voice.channelId && target.voice.channelId !== PRISON_CHANNEL_ID) {
        await target.voice.setChannel(
          prisonChannel,
          'Verrouillage vocal (prison)'
        );
      }
      message.reply(
        `${target} est maintenant enfermé dans ${prisonChannel} ${expiresText} 🔒`
      );
    } catch (err) {
      console.error(err);
      message.reply(
        "Je n'ai pas pu déplacer cet utilisateur. Vérifie que le bot a la permission de déplacer des membres et que la personne est en vocal."
      );
    }

    return;
  }

  if (command === '.unlock') {
    if (!hasPrisonPermission(message.member)) {
      message.reply(
        "Tu n'as pas le rôle requis pour utiliser cette commande."
      );
      return;
    }

    const argUser = parts[1];
    if (!argUser) {
      message.reply(
        'Utilisation : `.unlock @utilisateur` ou `.unlock ID`.'
      );
      return;
    }

    let target =
      message.mentions.members.first() ||
      (await message.guild.members.fetch(argUser).catch(() => null));

    if (!target) {
      message.reply("Je ne trouve pas cet utilisateur sur le serveur.");
      return;
    }

    const record = lockedUsers.get(target.id);
    if (!record) {
      message.reply(`${target} n'est pas enfermé.`);
      return;
    }

    if (record.timeout) clearTimeout(record.timeout);
    lockedUsers.delete(target.id);

    message.reply(`${target} est libéré de prison 🔓`);
    return;
  }

  if (command === '.unlockall') {
    if (!hasOwnerPermission(message.member)) {
      message.reply(
        "Seul le propriétaire du serveur ou le rôle owner peuvent utiliser `.unlockall`."
      );
      return;
    }

    for (const [userId, record] of lockedUsers.entries()) {
      if (record.timeout) clearTimeout(record.timeout);
      lockedUsers.delete(userId);
    }

    message.reply('Tous les utilisateurs ont été libérés de prison 🔓');
    return;
  }

  if (command === '.lockinfo') {
    if (!hasPrisonPermission(message.member)) {
      message.reply(
        "Tu n'as pas le rôle requis pour utiliser cette commande."
      );
      return;
    }

    const argUser = parts[1];
    if (!argUser) {
      message.reply(
        'Utilisation : `.lockinfo @utilisateur` ou `.lockinfo ID`.'
      );
      return;
    }

    let target =
      message.mentions.members.first() ||
      (await message.guild.members.fetch(argUser).catch(() => null));

    if (!target) {
      message.reply("Je ne trouve pas cet utilisateur sur le serveur.");
      return;
    }

    const record = lockedUsers.get(target.id);
    if (!record) {
      message.reply(`${target} n'est pas actuellement enfermé.`);
      return;
    }

    if (!record.expiresAt) {
      message.reply(
        `${target} est enfermé sans limite de temps (jusqu'à .unlock).`
      );
    } else {
      const remaining = record.expiresAt - Date.now();
      if (remaining <= 0) {
        message.reply(
          `${target} allait être libéré, mais le timer est dépassé.`
        );
      } else {
        message.reply(
          `${target} est encore enfermé pour ~${formatRemaining(
            remaining
          )}.`
        );
      }
    }
  }
});

client.on('voiceStateUpdate', async (oldState, newState) => {
  const userId = newState.id;
  const record = lockedUsers.get(userId);
  if (!record) return;

  const prisonId = record.channelId;
  const newChannelId = newState.channelId;

  if (!newChannelId) return;
  if (newChannelId === prisonId) return;

  const guild = newState.guild;
  const prisonChannel = guild.channels.cache.get(prisonId);
  if (!prisonChannel || !prisonChannel.isVoiceBased()) return;

  try {
    await newState.setChannel(
      prisonChannel,
      'Utilisateur verrouillé en prison (empêche le changement de salon)'
    );
  } catch (err) {
    console.error('Erreur lors du renvoi en prison :', err);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === 'ping') {
    await interaction.reply('Pong !');
  }
});

client.login(TOKEN);
