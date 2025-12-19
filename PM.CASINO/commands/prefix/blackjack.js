const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { DatabaseManager } = require('../../database');
const { validators } = require('../../utils/validators');

function formatNumber(number) {
  return number.toLocaleString('fr-FR');
}

function normalizeCard(card) {
  return card.replace(/\uFE0F/g, '');
}

function splitCard(card) {
  const c = normalizeCard(card);
  return { value: c.slice(0, -1), suit: c.slice(-1) };
}

function drawCard() {
  const suits = ['♠️', '♥️', '♦️', '♣️'];
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  return `${values[Math.floor(Math.random() * values.length)]}${suits[Math.floor(Math.random() * suits.length)]}`;
}

function handValue(hand) {
  let value = 0;
  let aces = 0;

  for (const card of hand) {
    const { value: v } = splitCard(card);

    if (v === 'A') {
      value += 11;
      aces += 1;
    } else if (['J', 'Q', 'K'].includes(v)) {
      value += 10;
    } else {
      value += parseInt(v, 10);
    }
  }

  while (value > 21 && aces > 0) {
    value -= 10;
    aces -= 1;
  }

  return value;
}

function getCardColor(card) {
  const { suit } = splitCard(card);
  return suit === '♥' || suit === '♦' ? '❤️' : '🖤';
}

function createGameEmbed(playerHand, dealerHand, balance, mise, level, xp, round, showDealer = false, isEnded = false, result = null) {
  const playerValue = handValue(playerHand);
  const dealerValue = handValue(dealerHand);

  const playerCards = playerHand.map(c => `${getCardColor(c)}\`${c}\``).join(' ');

  const dealerCards = showDealer
    ? dealerHand.map(c => `${getCardColor(c)}\`${c}\``).join(' ')
    : `🖤\`${dealerHand[0]}\` 🖤\`??\``;

  const statusPlayer =
    playerValue > 21 ? '💥 BUST' :
    playerValue === 21 ? '🎯 BLACKJACK' :
    `📊 ${playerValue}`;

  const statusDealer = showDealer
    ? (dealerValue > 21 ? '💥 BUST' : dealerValue === 21 ? '🎯 BLACKJACK' : `📊 ${dealerValue}`)
    : ''; // ✅ plus de "⏳ En attente"

  const dealerLine = statusDealer ? `${dealerCards} ${statusDealer}` : `${dealerCards}`;

  const embed = new EmbedBuilder()
    .setTitle('🎰 BLACKJACK - TABLE CASINO')
    .setColor(showDealer ? (playerValue > 21 ? 0xFF0000 : 0x00FF00) : 0xFFD700);

  if (isEnded && result) {
    embed.setDescription(
      `👤 **Joueur:** ${playerCards} ${statusPlayer}\n` +
      `🤖 **Croupier:** ${dealerLine}`
    );

    embed.addFields({ name: '📊 Résultat Final', value: `${result.emoji} ${result.message}` });
    embed.setFooter({ text: `💰 Solde final: ${formatNumber(balance)} 🪙 | 1 manche jouée` });
  } else {
    embed.setDescription(
      `👤 **Joueur:** ${playerCards} ${statusPlayer}\n` +
      `🤖 **Croupier:** ${dealerLine}\n\n` +
      `🪙 | Mise: \`${formatNumber(mise)}\` 🪙\n` +
      `🎯 | Manche: \`${round}\``
    );
    embed.setFooter({ text: '🎲 Cliquez sur Tirer ou Se coucher pour jouer !' });
  }

  return embed.setTimestamp();
}

function getGameResult(playerValue, dealerValue, showDealer) {
  if (!showDealer) return null;

  if (playerValue > 21) return { type: 'bust', message: '💥 Vous avez dépassé 21 !', emoji: '❌' };
  if (dealerValue > 21) return { type: 'win', message: '✅ Le croupier a dépassé 21 !', emoji: '🎉' };
  if (playerValue > dealerValue) return { type: 'win', message: '✅ Vous avez gagné !', emoji: '🎉' };
  if (playerValue < dealerValue) return { type: 'loss', message: '❌ Vous avez perdu !', emoji: '😢' };
  return { type: 'draw', message: '⚖️ Égalité !', emoji: '🤝' };
}

// ✅ Une seule manche + pas de double déduction + i.update() (évite 10062)
async function startSingleRound(playerHand, dealerHand, balance, mise, level, xp, round, msg, row, message, db) {
  return new Promise((resolve) => {
    const collector = msg.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 120000
    });

    collector.on('collect', async (i) => {
      try {
        if (i.user.id !== message.author.id) {
          return await i.reply({ content: '❌ Ce n\'est pas votre jeu !', ephemeral: true }).catch(() => {});
        }

        if (i.customId === 'hit') {
          playerHand.push(drawCard());
          const playerValue = handValue(playerHand);

          // bust => fin immédiate (⚠️ la mise est déjà retirée au début, donc on NE RETIRE PLUS ici)
          if (playerValue > 21) {
            db.addGameStats(message.author.id, 'blackjack', 'loss', 0);
            xp += 5;

            const result = getGameResult(playerValue, handValue(dealerHand), true);

            collector.stop('ended');

            await i.update({
              embeds: [createGameEmbed(playerHand, dealerHand, balance, mise, level, xp, round, true, true, result)],
              components: []
            }).catch(() => {});

            await i.followUp({
              content: `${result.emoji} ${result.message} Vous avez perdu \`${formatNumber(mise)}\` 🪙`,
              ephemeral: true
            }).catch(() => {});

            return resolve({ balance, level, xp, round, ended: true });
          }

          // sinon, on continue à tirer
          return await i.update({
            embeds: [createGameEmbed(playerHand, dealerHand, balance, mise, level, xp, round, false)],
            components: [row]
          }).catch(() => {});
        }

        if (i.customId === 'stand') {
          while (handValue(dealerHand) < 17) {
            dealerHand.push(drawCard());
          }

          const playerValue = handValue(playerHand);
          const dealerValue = handValue(dealerHand);
          const result = getGameResult(playerValue, dealerValue, true);

          let earnings = 0;
          const resultType = result.type;

          if (resultType === 'win') {
            // ✅ mise déjà retirée -> on paie 2x la mise
            earnings = mise * 2;
            balance += earnings;
            db.updateUserBalance(message.author.id, earnings);
            xp += 15;
          } else if (resultType === 'draw') {
            // ✅ on rend la mise
            balance += mise;
            db.updateUserBalance(message.author.id, mise);
            xp += 8;
          } else {
            // loss/bust : rien à retirer (déjà fait au début)
            xp += 5;
          }

          db.addGameStats(message.author.id, 'blackjack', resultType, earnings);

          collector.stop('ended');

          await i.update({
            embeds: [createGameEmbed(playerHand, dealerHand, balance, mise, level, xp, round, true, true, result)],
            components: []
          }).catch(() => {});

          const winnings =
            resultType === 'win' ? `(+\`${formatNumber(earnings)}\` 🪙)` :
            resultType === 'loss' ? `(-\`${formatNumber(mise)}\` 🪙)` :
            '(Mise rendue)';

          await i.followUp({
            content: `${result.emoji} ${result.message} ${winnings}`,
            ephemeral: true
          }).catch(() => {});

          return resolve({ balance, level, xp, round, ended: true });
        }
      } catch (err) {
        console.error('Interaction error:', err);
      }
    });

    collector.on('end', async (collected, reason) => {
      if (reason === 'time' && collected.size === 0) {
        await msg.edit({
          content: '⏰ Temps écoulé !',
          embeds: [],
          components: []
        }).catch(() => {});
        resolve({ balance, level, xp, round, ended: true });
      }
    });
  });
}

module.exports = {
  name: 'blackjack',
  aliases: ['bj', 'casino'],
  description: 'Jouer au blackjack (1 manche)',

  async execute(message, args) {
    const db = new DatabaseManager();
    const userData = db.getUserData(message.author.id);

    if (!userData || !userData.profile.registered) {
      return message.reply('❌ Vous devez d\'abord vous inscrire avec `;setup` pour jouer.');
    }

    if (!args[0]) {
      return message.reply('❌ Veuillez entrer une mise. Exemple : `;blackjack 100`');
    }

    const mise = parseInt(args[0], 10);
    if (isNaN(mise) || mise <= 0) {
      return message.reply('❌ La mise doit être un nombre positif.');
    }

    const validation = validators(mise, 'blackjack');
    if (!validation.valid) {
      return message.reply(`❌ Mise invalide : ${validation.message}`);
    }

    if (userData.profile.balance < mise) {
      return message.reply(`❌ Solde insuffisant ! Vous avez ${formatNumber(userData.profile.balance)} 🪙`);
    }

    // ✅ On prélève la mise UNE FOIS dès le départ (DB + balance)
    let balance = userData.profile.balance - mise;
    db.updateUserBalance(message.author.id, -mise);

    let level = userData.profile.level || 1;
    let xp = userData.profile.xp || 0;
    const round = 1;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('hit')
        .setLabel('🎴 Tirer')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('stand')
        .setLabel('🛑 Se coucher')
        .setStyle(ButtonStyle.Danger)
    );

    const playerHand = [drawCard(), drawCard()];
    const dealerHand = [drawCard(), drawCard()];

    // ✅ On affiche le solde APRÈS mise
    const msg = await message.reply({
      embeds: [createGameEmbed(playerHand, dealerHand, balance, mise, level, xp, round)],
      components: [row]
    });

    await startSingleRound(playerHand, dealerHand, balance, mise, level, xp, round, msg, row, message, db);
  }
};
