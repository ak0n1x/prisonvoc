const fs = require('fs');
const path = require('path');

class DatabaseManager {
    constructor() {
        this.dataDir = path.join(__dirname, 'data', 'users');
        this.ensureDir();
    }

    ensureDir() {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
    }

    getUserFile(userId) {
        return path.join(this.dataDir, `${userId}.json`);
    }

    getUserData(userId) {
        const filePath = this.getUserFile(userId);
        
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf-8');
            return JSON.parse(data);
        }

        return this.createDefaultUser(userId);
    }

    createDefaultUser(userId) {
        return {
            userId,
            createdAt: new Date().toISOString(),
            profile: {
                balance: 1000,
                level: 1,
                exp: 0,
                title: 'Nouveau Joueur',
                registered: false
            },
            stats: {
                totalGames: 0,
                totalWins: 0,
                totalLosses: 0,
                totalGains: 0,
                totalLossesAmount: 0,
                winRate: 0.0,
                favoriteGame: null
            },
            games: {
                blackjack: { played: 0, wins: 0, earnings: 0 },
                slots: { played: 0, wins: 0, earnings: 0 },
                dice: { played: 0, wins: 0, earnings: 0 },
                roulette: { played: 0, wins: 0, earnings: 0 },
                poker: { played: 0, wins: 0, earnings: 0 }
            },
            voice: {
                totalMinutes: 0,
                totalEarnings: 0,
                lastSession: null,
                currentSessionStart: null
            },
            inventory: {},
            achievements: [],
            dailyCheckIn: null,
            vipStatus: {
                isVip: false,
                vipUntil: null
            }
        };
    }

    saveUserData(userId, data) {
        const filePath = this.getUserFile(userId);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf-8');
    }

    updateUserBalance(userId, amount) {
        const data = this.getUserData(userId);
        data.profile.balance += amount;
        this.saveUserData(userId, data);
        return data;
    }

    addGameStats(userId, game, result, amountWon) {
        const data = this.getUserData(userId);

        data.stats.totalGames += 1;
        data.games[game].played += 1;

        if (result === 'win') {
            data.stats.totalWins += 1;
            data.stats.totalGains += amountWon;
            data.games[game].wins += 1;
            data.games[game].earnings += amountWon;
        } else {
            data.stats.totalLosses += 1;
            data.stats.totalLossesAmount += amountWon;
        }

        data.stats.winRate = (data.stats.totalWins / data.stats.totalGames * 100).toFixed(1);

        this.saveUserData(userId, data);
        return data;
    }

    addInventoryItem(userId, itemId, quantity = 1) {
        const data = this.getUserData(userId);
        data.inventory[itemId] = (data.inventory[itemId] || 0) + quantity;
        this.saveUserData(userId, data);
    }

    removeInventoryItem(userId, itemId, quantity = 1) {
        const data = this.getUserData(userId);
        if (data.inventory[itemId]) {
            data.inventory[itemId] -= quantity;
            if (data.inventory[itemId] <= 0) {
                delete data.inventory[itemId];
            }
            this.saveUserData(userId, data);
        }
    }

    processVoiceEarnings() {
        const files = fs.readdirSync(this.dataDir);

        files.forEach(file => {
            const filePath = path.join(this.dataDir, file);
            const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

            if (data.voice.currentSessionStart) {
                const sessionStart = new Date(data.voice.currentSessionStart);
                const elapsedMinutes = (Date.now() - sessionStart) / 60000;

                if (elapsedMinutes >= 1) {
                    const earnings = Math.floor(elapsedMinutes * 5);
                    data.voice.totalEarnings += earnings;
                    data.profile.balance += earnings;
                    data.voice.currentSessionStart = new Date().toISOString();

                    fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf-8');
                }
            }
        });
    }

    getLeaderboard(limit = 10) {
        const files = fs.readdirSync(this.dataDir);
        const users = files.map(file => {
            const filePath = path.join(this.dataDir, file);
            return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        });

        return users.sort((a, b) => b.profile.balance - a.profile.balance).slice(0, limit);
    }
}

module.exports = { DatabaseManager };
