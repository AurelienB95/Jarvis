/**
 * Dictionnaire dynamique d'alias (cf. cahier des charges, principe C).
 * Feuille "Alias" : colonne A = mot-clé, colonne B = valeur de substitution.
 * Appliqué en pré-traitement, avant tout envoi aux LLM.
 */

function loadAliasMap_() {
  const sheet = getSpreadsheet_().getSheetByName(CONFIG.SHEETS.ALIAS);
  if (!sheet) return {};

  const data = sheet.getDataRange().getValues();
  const map = {};
  for (let i = 1; i < data.length; i++) { // ligne 0 = en-têtes
    const alias = data[i][0];
    const value = data[i][1];
    if (alias) {
      map[String(alias).toLowerCase()] = value;
    }
  }
  return map;
}

function applyAliases_(text) {
  const map = loadAliasMap_();
  let result = text;
  Object.keys(map).forEach(function (alias) {
    const regex = new RegExp(escapeRegex_(alias), 'gi');
    result = result.replace(regex, map[alias]);
  });
  return result;
}

function addAlias_(alias, value) {
  const sheet = getSpreadsheet_().getSheetByName(CONFIG.SHEETS.ALIAS);
  sheet.appendRow([alias, value]);
}

function escapeRegex_(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
