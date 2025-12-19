const { DatabaseManager } = require('../../database');
const { validateBet } = require('../../utils/validators');
const { createGameEmbed, formatNumber } = require('../../utils/helpers');

module.exports = {
    name: 'slots',
    aliases: ['machine', 'slot'],
    description: 'Jouer aux machines à sous',
    
    async execute(message, args) {
        const db = new DatabaseManager();
        const mise = parseInt(args[0]) || 50;
        const userData = db.getUserData(message.author.id);

        if (!userData.profile.registered) {
            message.reply('❌ Utilisez `;setup` d\'abord!');
            return;
        }

        const validation = validateBet(mise, 'slots');
        if (!validation.valid) {
            message.reply(`❌ ${validation.message}`);
            return;
        }

        if (userData.profile.balance < mise) {
            message.reply(`❌ Solde insuffisant!`);
            return;
        }

        const symbols = ['🍒', '🍋', '🍊', '💎', '👑', '7️⃣'];
        const result = [
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)]
        ];

        let gameResult, earnings, resultMsg;

        if (result[0] === result[1] && result[1] === result[2]) {
            if (result[0] === '💎') {
                earnings = mise * 10;
                resultMsg = `🎊 JACKPOT DIAMANT! ${result.join(' ')}\nVous gagnez ${formatNumber(earnings)} 🪙!`;
            } else if (result[0] === '👑') {
                earnings = mise * 8;
                resultMsg = `👑 JACKPOT ROYAL! ${result.join(' ')}\nVous gagnez ${formatNumber(earnings)} 🪙!`;
            } else {
                earnings = mise * 3;
                resultMsg = `✅ Trois identiques! ${result.join(' ')}\nVous gagnez ${formatNumber(earnings)} 🪙!`;
            }
            gameResult = 'win';
            db.updateUserBalance(message.author.id, earnings);
        } else if (result[0] === result[1] || result[1] === result[2]) {
            earnings = mise;
            resultMsg = `✅ Deux symboles! ${result.join(' ')}\nVous gagnez ${formatNumber(earnings)} 🪙!`;
            gameResult = 'win';
            db.updateUserBalance(message.author.id, earnings);
        } else {
            earnings = mise;
            resultMsg = `❌ Perdu! ${result.join(' ')}`;
            gameResult = 'loss';
            db.updateUserBalance(message.author.id, -mise);
        }

        db.addGameStats(message.author.id, 'slots', gameResult, earnings);
        const updatedData = db.getUserData(message.author.id);

        const embed = createGameEmbed(
            '🎰 Machines à Sous',
            0x800080,
            [
                { name: 'Résultat', value: resultMsg, inline: false },
                { name: 'Solde', value: `${formatNumber(updatedData.profile.balance)} 🪙`, inline: false }
            ]
        );

        message.reply({ embeds: [embed] });
    }
};