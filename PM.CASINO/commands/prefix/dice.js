const { DatabaseManager } = require('../../database');
const { validateBet } = require('../../utils/validators');
const { createGameEmbed, formatNumber } = require('../../utils/helpers');

module.exports = {
    name: 'dice',
    aliases: ['dés', 'des', 'd'],
    description: 'Lancer les dés',
    
    async execute(message, args) {
        const db = new DatabaseManager();
        const mise = parseInt(args[0]) || 50;
        const userData = db.getUserData(message.author.id);

        if (!userData.profile.registered) {
            message.reply('❌ Utilisez `;setup` d\'abord!');
            return;
        }

        const validation = validateBet(mise, 'dice');
        if (!validation.valid) {
            message.reply(`❌ ${validation.message}`);
            return;
        }

        if (userData.profile.balance < mise) {
            message.reply(`❌ Solde insuffisant!`);
            return;
        }

        const roll = Math.floor(Math.random() * 12) + 1;
        let gameResult, earnings, resultMsg;

        if (roll > 7) {
            earnings = mise * 2;
            resultMsg = `✅ Vous avez lancé ${roll}! Victoire! +${formatNumber(earnings)} 🪙`;
            gameResult = 'win';
            db.updateUserBalance(message.author.id, earnings);
        } else {
            earnings = mise;
            resultMsg = `❌ Vous avez lancé ${roll}! Perdu!`;
            gameResult = 'loss';
            db.updateUserBalance(message.author.id, -mise);
        }

        db.addGameStats(message.author.id, 'dice', gameResult, earnings);
        const updatedData = db.getUserData(message.author.id);

        const embed = createGameEmbed(
            '🎲 Dés',
            0x0099FF,
            [
                { name: 'Résultat', value: resultMsg, inline: false },
                { name: 'Solde', value: `${formatNumber(updatedData.profile.balance)} 🪙`, inline: false }
            ]
        );

        message.reply({ embeds: [embed] });
    }
};