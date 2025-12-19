const { EmbedBuilder } = require('discord.js');
const config = require('../../config');

module.exports = {
    name: 'shop',
    aliases: ['boutique', 'store', 'sh'],
    description: 'Voir la boutique du casino',

    async execute(message, args) {
        const shopItems = config.SHOP_ITEMS;

        if (!shopItems || Object.keys(shopItems).length === 0) {
            return message.reply('❌ La boutique est vide.');
        }

        const items = Object.entries(shopItems) 
        const embed = new EmbedBuilder()
            .setTitle('🎰 Boutique du Casino')
            .setColor(0xFF1493)
            .setDescription('**Tous les objets disponibles à l\'achat**\n')
            .setThumbnail(message.client.user.displayAvatarURL())
            .setFooter({ text: 'Commande: ;buy <nom de l\'objet>' })
            .setTimestamp();

        // Ajouter les items de jeu
        if (gameItems.length > 0) {
            embed.addFields({
                name: '🎮 Items de Jeu',
                value: gameItems.map(([id, data]) => 
                    `💰 **${data.price}** - **${data.name || id.replace(/_/g, ' ')}**\n${data.description}`
                ).join('\n\n'),
                inline: false
            });
        }

        // Ajouter les items premium
        if (premiumItems.length > 0) {
            embed.addFields({
                name: '👑 Items Premium',
                value: premiumItems.map(([id, data]) => 
                    `💰 **${data.price}** - **${data.name || id.replace(/_/g, ' ')}**\n${data.description}`
                ).join('\n\n'),
                inline: false
            });
        }

        await message.reply({ embeds: [embed] });
    }
};