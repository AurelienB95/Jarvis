/**
 * Orchestration métier des deux étapes de la boucle Human-in-the-Loop
 * (cf. cahier des charges, section 2.A et 3.5 — prototype Tasker).
 */

function handleRequestStep_(payload) {
  const rawInput = payload.input || '';
  if (!rawInput.trim()) {
    return { status: 'error', result_message: 'Entrée vocale vide.' };
  }

  const mappedInput = applyAliases_(rawInput);
  const intent = resolveIntent_(mappedInput);

  const logRow = {
    rawInput: rawInput,
    mappedInput: mappedInput,
    targetModel: intent.targetModel,
    intentDetected: intent.type,
    userValidated: '',
    userFeedback: '',
  };

  // Cas C du principe B : ambiguïté / paramètre manquant -> on ne devine pas, on clarifie.
  if (intent.type === 'Unknown' && intent.clarification_needed) {
    appendLog_(Object.assign({}, logRow, { userValidated: 'Clarification demandée' }));
    return { status: 'done', result_message: intent.clarification_needed };
  }

  // Action de pure lecture : exécution immédiate, pas de confirmation (principe A).
  if (!intent.needs_confirmation) {
    const result = executeAction_(intent);
    appendLog_(Object.assign({}, logRow, { userValidated: 'N/A (lecture seule)' }));
    return { status: 'done', result_message: result.message };
  }

  // Action à impact : on ouvre une session de confirmation courte et on renvoie le plan.
  const sessionId = createSession_(intent);
  appendLog_(logRow);

  return {
    status: 'pending_confirmation',
    session_id: sessionId,
    plan_action: intent.plan_summary,
    ttl_seconds: CONFIG.SESSION_TTL_SECONDS,
  };
}

function handleConfirmStep_(payload) {
  const session = getSession_(payload.session_id);
  if (!session) {
    return { status: 'error', result_message: 'Session expirée ou introuvable. Merci de reformuler votre demande.' };
  }

  const confirmationText = String(payload.confirmation || '').trim().toLowerCase();
  const isConfirmed = /^(oui|valide|vas-y|ok|confirme)/.test(confirmationText);

  invalidateSession_(payload.session_id);

  if (!isConfirmed) {
    updateLastLogValidation_('Refusé');
    return { status: 'cancelled', result_message: 'Action annulée.' };
  }

  const result = executeAction_(session.intent);
  updateLastLogValidation_('Validé');

  const response = { status: 'done', result_message: result.message };
  if (result.tasker_action) {
    response.tasker_action = result.tasker_action;
  }
  return response;
}
