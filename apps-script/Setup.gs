/**
 * À exécuter UNE SEULE FOIS depuis l'éditeur Apps Script (menu "Exécuter" > setupJarvis_)
 * après avoir lié ce script à une nouvelle feuille Google Sheets (ou renseigné CONFIG.SHEET_ID).
 * Crée les onglets "Logs" et "Alias" avec leurs en-têtes.
 */
function setupJarvis_() {
  const ss = getSpreadsheet_();

  let logsSheet = ss.getSheetByName(CONFIG.SHEETS.LOGS);
  if (!logsSheet) {
    logsSheet = ss.insertSheet(CONFIG.SHEETS.LOGS);
  }
  logsSheet.clear();
  logsSheet.appendRow([
    'Timestamp', 'RawInput', 'MappedInput', 'TargetModel', 'IntentDetected', 'UserValidated', 'UserFeedback',
  ]);
  logsSheet.setFrozenRows(1);

  let aliasSheet = ss.getSheetByName(CONFIG.SHEETS.ALIAS);
  if (!aliasSheet) {
    aliasSheet = ss.insertSheet(CONFIG.SHEETS.ALIAS);
  }
  aliasSheet.clear();
  aliasSheet.appendRow(['Alias', 'Valeur']);
  aliasSheet.setFrozenRows(1);

  Logger.log('Setup terminé : onglets "Logs" et "Alias" prêts.');
}

/**
 * Utilitaire ponctuel pour retrouver l'ID de votre liste Google Tasks dédiée
 * aux notes Jarvis (à copier dans la propriété de script NOTES_TASKLIST_ID).
 * Créez d'abord la liste dans l'app Google Tasks, puis exécutez cette fonction
 * et regardez les logs (Affichage > Journaux d'exécution).
 */
function listTaskLists_() {
  const lists = Tasks.Tasklists.list().items || [];
  lists.forEach(function (list) {
    Logger.log(list.title + ' -> ' + list.id);
  });
}
