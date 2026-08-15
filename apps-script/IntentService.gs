/**
 * Analyse de l'intention utilisateur via LLM.
 * Le LLM renvoie un JSON structuré, jamais du texte libre, pour éviter
 * toute exécution non maîtrisée (cf. principe B du cahier des charges).
 */

function resolveIntent_(text) {
  const routed = pickModel_(text);
  const prompt = buildIntentPrompt_(routed.cleanedText);
  const rawResponse = (routed.targetModel === 'claude') ? callClaude_(prompt) : callGemini_(prompt);
  const intent = parseIntentJson_(rawResponse);
  intent.targetModel = routed.targetModel;
  return intent;
}

/**
 * Routage explicite v1 (cf. réserve #4 : le routage automatique par évaluation
 * de complexité est reporté après la v1, faute de données réelles pour le calibrer).
 */
function pickModel_(text) {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();
  for (let i = 0; i < CONFIG.CLAUDE_KEYWORD_PREFIXES.length; i++) {
    const prefix = CONFIG.CLAUDE_KEYWORD_PREFIXES[i];
    if (lower.indexOf(prefix) === 0) {
      return { targetModel: 'claude', cleanedText: trimmed.slice(prefix.length).trim() };
    }
  }
  return { targetModel: 'gemini', cleanedText: trimmed };
}

function buildIntentPrompt_(text) {
  return [
    'Tu es le module d\'analyse d\'intention de Jarvis, un assistant personnel vocal.',
    'Analyse la demande suivante et réponds UNIQUEMENT avec un objet JSON valide, sans texte autour, sans balises markdown, selon ce schéma strict :',
    '{',
    '  "type": "CreateEvent | CreateNote | SummarizeEmail | SendSMS | Call | AddAlias | Unknown",',
    '  "needs_confirmation": true|false,',
    '  "plan_summary": "phrase courte à lire à voix haute pour validation (vide si needs_confirmation=false)",',
    '  "parameters": {',
    '    "title": "...",',
    '    "start_datetime": "ISO 8601, si CreateEvent",',
    '    "end_datetime": "ISO 8601 optionnel, si CreateEvent",',
    '    "content": "si CreateNote",',
    '    "search_query": "requête Gmail, si SummarizeEmail",',
    '    "contact": "nom ou numéro, si SendSMS/Call",',
    '    "message": "si SendSMS",',
    '    "alias": "si AddAlias",',
    '    "value": "si AddAlias"',
    '  },',
    '  "clarification_needed": "question à poser si une information essentielle manque, sinon null"',
    '}',
    '',
    'Règles impératives :',
    '- Les actions de lecture seule (SummarizeEmail) ont TOUJOURS needs_confirmation=false.',
    '- Les actions à impact (CreateEvent, SendSMS, Call, CreateNote) ont TOUJOURS needs_confirmation=true.',
    '- Si une information essentielle manque (ex: destinataire du SMS, date de l\'événement),',
    '  ne devine JAMAIS : mets type="Unknown", needs_confirmation=false, et remplis clarification_needed.',
    '- N\'ajoute aucun champ hors de ce schéma.',
    '',
    'Demande utilisateur : "' + text + '"',
  ].join('\n');
}

function parseIntentJson_(rawResponse) {
  const cleaned = String(rawResponse)
    .trim()
    .replace(/^```json/i, '')
    .replace(/^```/, '')
    .replace(/```$/, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // Non-hallucination : si le LLM ne renvoie pas un JSON exploitable,
    // on ne tente pas de deviner l'intention, on redemande à l'utilisateur.
    return {
      type: 'Unknown',
      needs_confirmation: false,
      plan_summary: '',
      parameters: {},
      clarification_needed: 'Je n\'ai pas compris votre demande, pouvez-vous reformuler ?',
    };
  }
}
