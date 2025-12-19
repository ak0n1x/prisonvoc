module.exports = {
    BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,
    COMMAND_PREFIX: ';',
    
    GAMES_CONFIG: {
        blackjack: {
            minBet: 10,
            maxBet: 5000,
            winMultiplier: 2
        },
        slots: {
            minBet: 25,
            maxBet: 2000,
            jackpotMultiplier: 10
        },
        dice: {
            minBet: 10,
            maxBet: 3000,
            winMultiplier: 2
        },
        roulette: {
            minBet: 15,
            maxBet: 4000,
            winMultiplier: 2
        },
        poker: {
            minBet: 50,
            maxBet: 10000,
            winMultiplier: 3
        }
    },

    VOICE_CONFIG: {
        earningsPerMinute: 5,
        maxSessionMinutes: 60,
        dailyVoiceLimit: 300
    },

    SHOP_ITEMS: {
        battle_pass_30d: {
            price: 500,
            description: 'Pass de combat 30 jours',
            bonus: 'Gains +50%'
        },
        skin_gold: {
            price: 1000,
            description: 'Skin doré exclusif',
            bonus: 'Apparence premium'
        },
        multiplier_2x: {
            price: 2000,
            description: 'Double vos gains (1h)',
            bonus: 'Gains x2'
        },
        protection_shield: {
            price: 300,
            description: 'Bouclier de protection',
            bonus: 'Perte minimale'
        },
        lucky_token: {
            price: 150,
            description: 'Token porte-bonheur',
            bonus: '+15% chance'
        },
        vip_status: {
            price: 5000,
            description: 'Statut VIP 7j',
            bonus: 'Accès exclusif'
        }
    }
};
