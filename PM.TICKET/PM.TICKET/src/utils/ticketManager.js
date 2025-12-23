const claimedTickets = new Map();

function claimTicket(ticketId, userId) {
  if (claimedTickets.has(ticketId)) return false;
  claimedTickets.set(ticketId, userId);
  return true;
}

function unclaimTicket(ticketId) {
  return claimedTickets.delete(ticketId);
}

function getClaimedBy(ticketId) {
  return claimedTickets.get(ticketId);
}

module.exports = { claimTicket, unclaimTicket, getClaimedBy, claimedTickets };