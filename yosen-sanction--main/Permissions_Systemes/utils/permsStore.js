const fs = require("fs");
const path = require("path");

const permsPath = path.join(__dirname, "../perms.json");

function normalizeKey(key) {
  if (/^\d{15,20}$/.test(key)) return key;
  const mentionMatch = key.match(/^<@!?(\d{15,20})>$/);
  return mentionMatch ? mentionMatch[1] : null;
}

function cleanData(data = {}) {
  const cleaned = {};
  let changed = false;

  for (const [key, value] of Object.entries(data)) {
    const normalized = normalizeKey(key);
    if (!normalized) {
      changed = true;
      continue;
    }

    if (key !== normalized) changed = true;
    cleaned[normalized] = value;
  }

  return { cleaned, changed };
}

function readPerms() {
  let raw = {};
  if (fs.existsSync(permsPath)) {
    try {
      raw = JSON.parse(fs.readFileSync(permsPath, "utf8")) || {};
    } catch {
      raw = {};
    }
  }

  const { cleaned, changed } = cleanData(raw);
  if (changed) {
    writePerms(cleaned);
  }

  return cleaned;
}

function writePerms(data) {
  const { cleaned } = cleanData(data);
  fs.writeFileSync(permsPath, JSON.stringify(cleaned, null, 2));
}

function cleanPermsFile() {
  let raw = {};
  if (fs.existsSync(permsPath)) {
    try {
      raw = JSON.parse(fs.readFileSync(permsPath, "utf8")) || {};
    } catch {
      raw = {};
    }
  }

  const { cleaned, changed } = cleanData(raw);
  if (changed) {
    writePerms(cleaned);
  }

  return { cleaned, changed };
}

module.exports = {
  readPerms,
  writePerms,
  cleanPermsFile,
  normalizeKey
};
