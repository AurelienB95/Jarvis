/**
 * Journalisation (cf. cahier des charges, section 3.4 — structure des logs).
 * Feuille "Logs", colonnes :
 *   Timestamp | RawInput | MappedInput | TargetModel | IntentDetected | UserValidated | UserFeedback
 */

function appendLog_(row) {
  const sheet = getSpreadsheet_().getSheetByName(CONFIG.SHEETS.LOGS);
  if (!sheet) {
    console.error('Feuille "Logs" introuvable — log ignoré.');
    return;
  }
  sheet.appendRow([
    new Date(),
    row.rawInput || '',
    row.mappedInput || '',
    row.targetModel || '',
    row.intentDetected || '',
    row.userValidated || '',
    row.userFeedback || '',
  ]);
}

/**
 * Simplification v1 : met à jour la colonne UserValidated de la dernière ligne écrite.
 * Fonctionne car la boucle request->confirm est séquentielle pour un même utilisateur.
 * À affiner en v1.1 avec un identifiant de corrélation (session_id) si plusieurs
 * requêtes concurrentes deviennent possibles.
 */
function updateLastLogValidation_(status) {
  const sheet = getSpreadsheet_().getSheetByName(CONFIG.SHEETS.LOGS);
  if (!sheet) return;
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(lastRow, 6).setValue(status); // colonne F = UserValidated
  }
}

function logError_(err, payload) {
  console.error('Erreur Jarvis: ' + err.message, JSON.stringify(payload));
}
