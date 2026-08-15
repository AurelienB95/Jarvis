function callGemini_(prompt) {
  const apiKey = getScriptProperty_('GEMINI_API_KEY');
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' +
    CONFIG.GEMINI_MODEL + ':generateContent?key=' + apiKey;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.2 },
  };

  const response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });

  const json = JSON.parse(response.getContentText());
  if (json.error) {
    throw new Error('Gemini API error: ' + json.error.message);
  }
  if (!json.candidates || !json.candidates.length) {
    throw new Error('Gemini API: réponse vide ou filtrée.');
  }
  return json.candidates[0].content.parts[0].text;
}
