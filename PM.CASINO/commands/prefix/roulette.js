const { DatabaseManager } = require('../../database');
const { validateBet } = require('../../utils/validators');
const { createGameEmbed, formatNumber } = require('../../utils/helpers');

module.exports = {
    name: 'roulette',
    aliases: ['rouletta', 'r'],
    description: 'Jouer à la roulette',
    
    async execute(message, args) {
        const db = new DatabaseManager();
        const couleur = args[0]?.toLowerCase();
        const mise = parseInt(args[1]) || 50;
        const userData = db.getUserData(message.author.id);

        if (!userData.profile.registered) {
            message.reply('❌ Utilisez `;setup` d\'abord!');
            return;
        }

        if (!couleur || !['rouge', 'noir', 'r', 'n'].includes(couleur)) {
            message.reply('❌ Usage: `;roulette <rouge/noir> [mise]`');
            return;
        }

        const couleurFinal = couleur === 'r' ? 'rouge' : couleur === 'n' ? 'noir' : couleur;

        const validation = validateBet(mise, 'roulette');
        if (!validation.valid) {
            message.reply(`❌ ${validation.message}`);
            return;
        }

        if (userData.profile.balance < mise) {
            message.reply(`❌ Solde insuffisant!`);
            return;
        }

        const resultat = Math.random() > 0.5 ? 'rouge' : 'noir';
        let gameResult, earnings, resultMsg;

        if (couleurFinal === resultat) {
            earnings = mise * 2;
            resultMsg = `✅ ${resultat.toUpperCase()}! Vous gagnez ${formatNumber(earnings)} 🪙!`;
            gameResult = 'win';
            db.updateUserBalance(message.author.id, earnings);
        } else {
            earnings = mise;
            resultMsg = `❌ ${resultat.toUpperCase()}! Vous avez perdu!`;
            gameResult = 'loss';
            db.updateUserBalance(message.author.id, -mise);
        }

        db.addGameStats(message.author.id, 'roulette', gameResult, earnings);
        const updatedData = db.getUserData(message.author.id);

        const embed = createGameEmbed(
            '🎡 Roulette',
            0x00FF00,
            [
                { name: 'Votre choix', value: couleurFinal.toUpperCase(), inline: true },
                { name: 'Résultat', value: resultat.toUpperCase(), inline: true },
                { name: 'Message', value: resultMsg, inline: false },
                { name: 'Solde', value: `${formatNumber(updatedData.profile.balance)} 🪙`, inline: false }
            ]
        );

        message.reply({ embeds: [embed] });
    }
};
