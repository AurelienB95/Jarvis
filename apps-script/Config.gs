/**
 * Configuration centrale de Jarvis.
 *
 * Les clés sensibles NE sont jamais en dur dans le code.
 * Elles vivent dans les Script Properties du projet Apps Script :
 * Extensions > Apps Script > Paramètres du projet (⚙️) > Propriétés du script.
 *
 * Propriétés attendues :
 *   GEMINI_API_KEY      -> clé API Gemini
 *   CLAUDE_API_KEY      -> clé API Claude (Anthropic)
 *   NOTES_TASKLIST_ID   -> id de la liste Google Tasks dédiée aux notes Jarvis
 *                          (récupérable via Tasks.Tasklists.list() en exécution ponctuelle,
 *                           voir README section "Setup").
 */
const CONFIG = {
  // Laisser null si ce script est lié (bound) à la feuille Google Sheets de logs.
  // Sinon, renseigner l'ID de la spreadsheet dédiée.
  SHEET_ID: null,

  SHEETS: {
    LOGS: 'Logs',
    ALIAS: 'Alias',
  },

  // Durée de vie d'une session de confirmation (doit rester courte : Human-in-the-Loop
  // "temps réel", cf. réserve #5 du cahier des charges sur la fragilité de la boucle Tasker).
  SESSION_TTL_SECONDS: 60,

  GEMINI_MODEL: 'gemini-2.0-flash',
  // Ajuster selon le modèle réellement disponible sur votre clé API Anthropic.
  CLAUDE_MODEL: 'claude-sonnet-4-6',

  // Déclenchement explicite du routage vers Claude (cf. section 3.3 du cahier des charges).
  CLAUDE_KEYWORD_PREFIXES: ['/claude', '/think', '/compare'],
};

function getScriptProperty_(key) {
  const value = PropertiesService.getScriptProperties().getProperty(key);
  if (!value) {
    throw new Error(
      'Propriété de script manquante : ' + key +
      '. Renseignez-la dans Extensions > Apps Script > Paramètres du projet > Propriétés du script.'
    );
  }
  return value;
}

function getSpreadsheet_() {
  return CONFIG.SHEET_ID
    ? SpreadsheetApp.openById(CONFIG.SHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
}
