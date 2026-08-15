/**
 * Point d'entrée du Web App Jarvis.
 * Reçoit les requêtes POST de Tasker (deux étapes : "request" puis "confirm").
 *
 * Contrat JSON — étape "request" (1ère capture vocale) :
 *   { "step": "request", "input": "<texte vocal brut>" }
 *
 * Réponse si action à impact (nécessite confirmation) :
 *   { "status": "pending_confirmation", "session_id": "...", "plan_action": "...", "ttl_seconds": 60 }
 *
 * Réponse si action de lecture seule (exécutée directement) :
 *   { "status": "done", "result_message": "..." }
 *
 * Contrat JSON — étape "confirm" (2e capture vocale) :
 *   { "step": "confirm", "session_id": "...", "confirmation": "<texte vocal: oui/annule/...>" }
 *
 * Réponse :
 *   { "status": "done" | "cancelled" | "error", "result_message": "...",
 *     "tasker_action": { ... }  // présent uniquement pour SendSMS / Call, à exécuter côté Tasker
 *   }
 */
function doPost(e) {
  let payload;
  try {
    payload = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonResponse_({ status: 'error', result_message: 'JSON invalide reçu par le webhook.' });
  }

  try {
    if (payload.step === 'request') {
      return jsonResponse_(handleRequestStep_(payload));
    }
    if (payload.step === 'confirm') {
      return jsonResponse_(handleConfirmStep_(payload));
    }
    return jsonResponse_({ status: 'error', result_message: 'Paramètre "step" inconnu ou manquant (attendu: request | confirm).' });
  } catch (err) {
    logError_(err, payload);
    return jsonResponse_({ status: 'error', result_message: 'Erreur interne : ' + err.message });
  }
}

/**
 * Utile pour tester rapidement que le Web App répond (GET dans le navigateur).
 */
function doGet(e) {
  return ContentService.createTextOutput('Jarvis backend actif.');
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
