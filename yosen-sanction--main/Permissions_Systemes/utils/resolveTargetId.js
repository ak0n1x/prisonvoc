function resolveTargetId(targetArg, message) {
  const mentionId = message?.mentions?.users?.first()?.id;
  if (mentionId) return mentionId;

  if (targetArg === undefined || targetArg === null) return null;
  const raw = String(targetArg).trim();

  if (/^\d{15,20}$/.test(raw)) return raw;

  const mentionMatch = raw.match(/^<@!?(\d{15,20})>$/);
  return mentionMatch ? mentionMatch[1] : null;
}

module.exports = resolveTargetId;
