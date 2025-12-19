const { EmbedBuilder } = require('discord.js');
const config = require('../../config');
const { DatabaseManager } = require('../../database');
const { formatNumber } = require('../../utils/helpers');

module.exports = {
    name: 'buy',
    aliases: ['acheter', 'achat', 'b'],
    description: 'Acheter un item',
    
    async execute(message, args) {
        const itemId = args[0];

        if (!itemId) {
            message.reply('❌ Usage: `;buy <item_id>`');
            return;
        }

        if (!config.SHOP_ITEMS[itemId]) {
            message.reply('❌ Item invalide! Utilisez `;shop` pour voir les items.');
            return;
        }

        const db = new DatabaseManager();
        const userData = db.getUserData(message.author.id);
        const price = config.SHOP_ITEMS[itemId].price;

        if (userData.profile.balance < price) {
            message.reply(
                `❌ Vous n'avez pas assez d'argent! (Il vous manque ${formatNumber(price - userData.profile.balance)} 🪙)`
            );
            return;
        }

        db.updateUserBalance(message.author.id, -price);
        db.addInventoryItem(message.author.id, itemId);

        const embed = new EmbedBuilder()
            .setTitle('✅ Achat réussi!')
            .setColor(0x00FF00)
            .addFields(
                { name: 'Item', value: itemId, inline: true },
                { name: 'Prix', value: `${formatNumber(price)} 🪙`, inline: true },
                { name: 'Nouveau solde', value: `${formatNumber(userData.profile.balance - price)} 🪙`, inline: false }
            );

        message.reply({ embeds: [embed] });
    }
};
