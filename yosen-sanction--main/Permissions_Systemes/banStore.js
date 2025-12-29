const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "..", "data");
const banFile = path.join(dataDir, "ban.json");
const legacyBanFile = path.join(dataDir, "bans.json");
const wetFile = path.join(dataDir, "wet.json");
const blacklistFile = path.join(dataDir, "blacklist.json");

const timers = new Map();
let expireHandler = null;

function ensureDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (err) {
    console.error(`❌ Impossible de lire ${filePath}:`, err.message);
    return fallback;
  }
}

function writeJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`❌ Impossible d'écrire ${filePath}:`, err.message);
  }
}

function migrateLegacy(data) {
  if (!fs.existsSync(legacyBanFile)) return data;
  const legacy = readJson(legacyBanFile, {});
  const migrated = { ...data };

  Object.entries(legacy).forEach(([userId, entry]) => {
    migrated[userId] = migrated[userId] || { history: [] };
    const base = {
      userId,
      reason: entry.raison || "",
      type: "classique",
      duration: entry.unbanTime ? "Importé" : "Permanent",
      endsAt: entry.unbanTime,
      createdAt: entry.timestamp ? new Date(entry.timestamp).toISOString() : new Date().toISOString(),
      issuedBy: entry.by || "inconnu",
      issuedLevel: entry.byLevel,
      stage: entry.unbanTime ? "imported_temp" : "permanent"
    };
    migrated[userId].active = base;
    migrated[userId].history.push(base);
    migrated[userId].totalSanctions = migrated[userId].history.length;
  });

  writeJson(banFile, { records: migrated });
  return migrated;
}

function loadBanData() {
  ensureDir();
  let data = readJson(banFile, { records: {} });

  if (!fs.existsSync(banFile)) {
    const migrated = migrateLegacy({});
    return { records: migrated };
  }

  if (!data.records) {
    data = { records: data };
  }

  return data;
}

function saveBanData(data) {
  ensureDir();
  writeJson(banFile, data);
}

function getBanCount(userId) {
  const data = loadBanData();
  return data.records[userId]?.history?.length || 0;
}

function getActiveBan(userId) {
  const data = loadBanData();
  return data.records[userId]?.active || null;
}

function scheduleTimer(userId, entry) {
  if (!entry.endsAt) return;

  const delay = new Date(entry.endsAt).getTime() - Date.now();
  if (delay <= 0) {
    return finalizeExpiry(userId, entry);
  }

  if (timers.has(userId)) {
    clearTimeout(timers.get(userId));
  }

  const timeout = setTimeout(() => finalizeExpiry(userId, entry), delay);
  timers.set(userId, timeout);
}

function finalizeExpiry(userId, reference) {
  const data = loadBanData();
  const record = data.records[userId];
  if (!record || !record.active) return;

  const active = record.active;
  if (reference.endsAt && active.endsAt && reference.endsAt !== active.endsAt) return;

  if (active.type === "sys" && active.stage === "conversion_pending") {
    active.stage = "permanent";
    active.duration = "Définitif (SYS)";
    active.endsAt = null;
    record.active = active;
    record.history[record.history.length - 1] = active;
    data.records[userId] = record;
    return saveBanData(data);
  }

  record.active = undefined;
  record.history[record.history.length - 1] = {
    ...record.history[record.history.length - 1],
    stage: "expired",
    expiredAt: new Date().toISOString()
  };
  data.records[userId] = record;
  saveBanData(data);

  if (expireHandler) {
    expireHandler(userId, reference);
  }
}

function scheduleExistingBans() {
  const data = loadBanData();
  Object.entries(data.records).forEach(([userId, record]) => {
    if (record.active?.endsAt) {
      scheduleTimer(userId, record.active);
    }
  });
}

function recordBan(entry) {
  const data = loadBanData();
  const record = data.records[entry.userId] || { history: [] };
  const newEntry = {
    ...entry,
    createdAt: entry.createdAt || new Date().toISOString()
  };

  record.active = newEntry;
  record.history.push(newEntry);
  record.totalSanctions = record.history.length;

  data.records[entry.userId] = record;
  saveBanData(data);
  scheduleTimer(entry.userId, newEntry);
  return { entry: newEntry, count: record.totalSanctions };
}

function removeBan(userId) {
  const data = loadBanData();
  const record = data.records[userId];
  if (!record || !record.active) return null;

  if (timers.has(userId)) {
    clearTimeout(timers.get(userId));
    timers.delete(userId);
  }

  const removed = record.active;
  record.active = undefined;
  record.history[record.history.length - 1] = {
    ...record.history[record.history.length - 1],
    stage: "manual_unban",
    expiredAt: new Date().toISOString()
  };
  data.records[userId] = record;
  saveBanData(data);
  return removed;
}

function loadWetList() {
  ensureDir();
  return readJson(wetFile, {});
}

function saveWetList(list) {
  ensureDir();
  writeJson(wetFile, list);
}

function setWetEntry(userId, entry) {
  const wet = loadWetList();
  wet[userId] = entry;
  saveWetList(wet);
}

function removeWetEntry(userId) {
  const wet = loadWetList();
  delete wet[userId];
  saveWetList(wet);
}

function getWetEntry(userId) {
  const wet = loadWetList();
  return wet[userId];
}

function addToBlacklist(userId, entry) {
  const bl = readJson(blacklistFile, {});
  bl[userId] = entry;
  ensureDir();
  writeJson(blacklistFile, bl);
  return bl;
}

function removeFromBlacklist(userId) {
  const bl = readJson(blacklistFile, {});
  if (bl[userId]) {
    delete bl[userId];
    writeJson(blacklistFile, bl);
  }
}

function getBlacklistEntry(userId) {
  const bl = readJson(blacklistFile, {});
  return bl[userId];
}

function onExpire(callback) {
  expireHandler = callback;
}

module.exports = {
  addToBlacklist,
  finalizeExpiry,
  getActiveBan,
  getBanCount,
  getBlacklistEntry,
  getWetEntry,
  loadBanData,
  loadWetList,
  recordBan,
  removeBan,
  removeFromBlacklist,
  removeWetEntry,
  saveBanData,
  scheduleExistingBans,
  setWetEntry,
  onExpire
};
