function callClaude_(prompt) {
  const apiKey = getScriptProperty_('CLAUDE_API_KEY');
  const url = 'https://api.anthropic.com/v1/messages';

  const payload = {
    model: CONFIG.CLAUDE_MODEL,
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }],
  };

  const response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });

  const json = JSON.parse(response.getContentText());
  if (json.error) {
    throw new Error('Claude API error: ' + json.error.message);
  }
  return json.content
    .map(function (block) { return block.text || ''; })
    .join('\n');
}
