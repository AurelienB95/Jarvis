/**
 * Exécution des actions.
 *
 * Répartition volontaire (cf. cahier des charges, réserve sur SMS/appels) :
 *   - CreateEvent, CreateNote, SummarizeEmail, AddAlias -> exécutés ici, côté Apps Script,
 *     via les APIs Google.
 *   - SendSMS, Call -> Apps Script ne peut pas déclencher un SMS ou un appel depuis un
 *     téléphone. On retourne donc une structure "tasker_action" que Tasker exécute
 *     nativement (action "Send SMS" / "Call") après confirmation.
 */
function executeAction_(intent) {
  switch (intent.type) {
    case 'CreateEvent':
      return executeCreateEvent_(intent.parameters);
    case 'CreateNote':
      return executeCreateNote_(intent.parameters);
    case 'SummarizeEmail':
      return executeSummarizeEmail_(intent.parameters);
    case 'AddAlias':
      return executeAddAlias_(intent.parameters);
    case 'SendSMS':
      return {
        message: 'SMS prêt à être envoyé à ' + intent.parameters.contact + '.',
        tasker_action: {
          type: 'SendSMS',
          to: intent.parameters.contact,
          message: intent.parameters.message,
        },
      };
    case 'Call':
      return {
        message: 'Appel vers ' + intent.parameters.contact + ' prêt à être lancé.',
        tasker_action: {
          type: 'Call',
          to: intent.parameters.contact,
        },
      };
    default:
      return { message: intent.clarification_needed || 'Je n\'ai pas pu traiter cette demande.' };
  }
}

function executeCreateEvent_(params) {
  const calendar = CalendarApp.getDefaultCalendar();
  const start = new Date(params.start_datetime);
  const end = params.end_datetime
    ? new Date(params.end_datetime)
    : new Date(start.getTime() + 60 * 60 * 1000); // +1h par défaut
  calendar.createEvent(params.title || 'Sans titre', start, end);
  return { message: 'Événement "' + (params.title || 'Sans titre') + '" créé.' };
}

/**
 * Nécessite le service avancé "Tasks" activé (voir appsscript.json) et
 * la propriété de script NOTES_TASKLIST_ID renseignée.
 */
function executeCreateNote_(params) {
  const taskListId = getScriptProperty_('NOTES_TASKLIST_ID');
  Tasks.Tasks.insert(
    { title: params.title || 'Note sans titre', notes: params.content || '' },
    taskListId
  );
  return { message: 'Note "' + (params.title || 'Note sans titre') + '" ajoutée.' };
}

function executeSummarizeEmail_(params) {
  const query = params.search_query || 'is:unread';
  const threads = GmailApp.search(query, 0, 5);
  if (threads.length === 0) {
    return { message: 'Aucun email correspondant trouvé.' };
  }
  const subjects = threads.map(function (t) { return t.getFirstMessageSubject(); }).join(', ');
  // v1 : liste des sujets. Amélioration prévue : envoyer les corps de mail à Claude
  // pour un vrai résumé synthétique (cf. plan v1, fonctionnalité "Résumé emails").
  return { message: threads.length + ' email(s) trouvé(s) : ' + subjects };
}

function executeAddAlias_(params) {
  addAlias_(params.alias, params.value);
  return { message: 'Alias "' + params.alias + '" -> "' + params.value + '" enregistré.' };
}
