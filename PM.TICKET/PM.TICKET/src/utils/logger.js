const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '../../logs/bot.log');

function log(message) {
  const timestamp = new Date().toLocaleString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(logMessage);
  fs.mkdirSync(path.dirname(logFile), { recursive: true });
  fs.appendFileSync(logFile, logMessage);
}

module.exports = { log };
