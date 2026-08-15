/**
 * Sessions de confirmation (cf. cahier des charges, réserve #5 :
 * "le backend doit invalider la session si l'utilisateur ne répond pas sous X secondes,
 * pour éviter qu'un 'Oui' tardif déclenche une action obsolète").
 *
 * CacheService.getScriptCache() : TTL max 6h côté Apps Script, largement suffisant
 * puisque CONFIG.SESSION_TTL_SECONDS est volontairement court (60s par défaut).
 */

function createSession_(intent) {
  const sessionId = Utilities.getUuid();
  const cache = CacheService.getScriptCache();
  cache.put(sessionId, JSON.stringify({ intent: intent }), CONFIG.SESSION_TTL_SECONDS);
  return sessionId;
}

function getSession_(sessionId) {
  if (!sessionId) return null;
  const raw = CacheService.getScriptCache().get(sessionId);
  return raw ? JSON.parse(raw) : null;
}

function invalidateSession_(sessionId) {
  if (!sessionId) return;
  CacheService.getScriptCache().remove(sessionId);
}
