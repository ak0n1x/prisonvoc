const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { DatabaseManager } = require('../../database');

module.exports = {
    name: 'setup',
    aliases: ['commencer', 's'],
    description: 'Configuration initiale avec règles',
    
    async execute(message, args) {
        const db = new DatabaseManager();
        const userData = db.getUserData(message.author.id);

        if (userData.profile.registered) {
            message.reply('❌ Vous êtes déjà enregistré! Utilisez `;help` pour commencer.');
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle('🎰 BIENVENUE SUR LE CASINO DE FUJI')
            .setDescription('Pour accéder au casino, veuillez prendre connaissance et accepter le règlement.')
            .setColor(0xFFD700)
            .addFields(
                {
                    name: '📋 RÈGLES GÉNÉRALES',
                    value: `• Solde initial: 1000 🪙\n• Gagnez en vocal: 5🪙/min\n• 5 jeux différents\n• Achetez des items exclusifs\n• Montez de niveau`,
                    inline: false
                },
                {
                    name: '🎮 JEUX DISPONIBLES',
                    value: `• **Blackjack** (10-5000 🪙)\n• **Slots** (25-2000 🪙)\n• **Dés** (10-3000 🪙)\n• **Roulette** (15-4000 🪙)\n• **Poker** (50-10000 🪙)`,
                    inline: false
                },
                {
                    name: '💰 ÉCONOMIE',
                    value: `• Gains vocaux: 5🪙/min\n• Daily bonus: 100🪙\n• Classement en temps réel\n• Système de niveaux`,
                    inline: false
                },
                {
                    name: '🛍️ BOUTIQUE',
                    value: `• Items cosmétiques\n• Multiplicateurs de gains\n• Boucliers de protection\n• Statut VIP premium`,
                    inline: false
                }
            )
            .setFooter({ text: 'Cliquez sur Accepter pour commencer!' });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('setup_accept')
                    .setLabel('✅ Accepter')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('setup_refuse')
                    .setLabel('❌ Refuser')
                    .setStyle(ButtonStyle.Danger)
            );

        const response = await message.reply({
            embeds: [embed],
            components: [row]
        });

        const collector = response.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async (buttonInteraction) => {
            if (buttonInteraction.user.id !== message.author.id) {
                await buttonInteraction.reply({ content: '❌ Ce n\'est pas pour toi!', ephemeral: true });
                return;
            }

            if (buttonInteraction.customId === 'setup_accept') {
                const data = db.getUserData(message.author.id);
                data.profile.registered = true;
                db.saveUserData(message.author.id, data);

                const successEmbed = new EmbedBuilder()
                    .setTitle('✅ Compte créé!')
                    .setDescription(`Bienvenue ${message.author.mention}!\n\nVotre profil est actif:\n• Solde: 1000 🪙\n• Niveau: 1\n\nCommandes utiles:\n• \`;blackjack\` - Jouer\n• \`;profile\` - Votre profil\n• \`;leaderboard\` - Classement\n• \`;shop\` - Boutique`)
                    .setColor(0x00FF00);

                await buttonInteraction.reply({ embeds: [successEmbed], ephemeral: true });
                collector.stop();
            } else {
                await buttonInteraction.reply({
                    content: '❌ Utilisez `;setup` à nouveau quand vous êtes prêt.',
                    ephemeral: true
                });
                collector.stop();
            }
        });
    }
};