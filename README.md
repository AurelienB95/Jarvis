# Jarvis — v1 (Apps Script)

Backend v1 du projet Jarvis, conforme au cahier des charges (partie V1 — Apps Script).
Reçoit les webhooks Tasker, applique le dictionnaire d'alias, route vers Gemini ou Claude,
gère la boucle de confirmation (Human-in-the-Loop), et exécute les actions Google
(Calendar, Tasks, Gmail) ou prépare les actions à exécuter côté Tasker (SMS, appel).

## Arborescence

```
apps-script/
  appsscript.json     # manifeste (scopes, service avancé Tasks)
  Code.gs              # doPost() — point d'entrée du Web App
  Handlers.gs          # orchestration des étapes request / confirm
  IntentService.gs      # prompt + routage Gemini/Claude + parsing JSON
  GeminiService.gs      # appel API Gemini
  ClaudeService.gs      # appel API Claude
  ActionService.gs      # exécution des actions (Calendar, Tasks, Gmail, alias)
  AliasService.gs       # dictionnaire d'alias
  LogService.gs         # journalisation Google Sheets
  SessionService.gs     # sessions de confirmation (CacheService)
  Setup.gs              # scripts d'initialisation à exécuter une fois
  Config.gs             # configuration centrale
.clasp.json.example     # à copier en .clasp.json avec votre scriptId
```

## Setup

### 1. Créer le projet Apps Script

1. Créez une nouvelle feuille Google Sheets (elle servira de base Logs/Alias).
2. Dans cette feuille : **Extensions > Apps Script**.
3. Notez l'ID du script (**Paramètres du projet** ⚙️, champ "ID du script").

### 2. Récupérer le code en local et le lier via clasp

```bash
npm install -g @google/clasp
clasp login

git clone https://github.com/AurelienB95/Jarvis.git
cd Jarvis
cp .clasp.json.example .clasp.json
# éditez .clasp.json et collez votre scriptId

clasp push
```

### 3. Activer le service avancé "Tasks"

Dans l'éditeur Apps Script : **Services** (icône +) > **Google Tasks API** > Ajouter.
(Déjà déclaré dans `appsscript.json`, mais à confirmer une fois côté interface.)

### 4. Renseigner les clés API

Dans l'éditeur Apps Script : **Paramètres du projet** ⚙️ > **Propriétés du script** > Ajouter :

| Propriété | Valeur |
|---|---|
| `GEMINI_API_KEY` | votre clé API Gemini |
| `CLAUDE_API_KEY` | votre clé API Claude (Anthropic) |
| `NOTES_TASKLIST_ID` | id de la liste Google Tasks dédiée aux notes (voir étape 5) |

### 5. Initialiser les feuilles et récupérer l'ID de la liste Tasks

Dans l'éditeur Apps Script, sélectionnez puis exécutez (▶) :

1. `setupJarvis_` → crée les onglets "Logs" et "Alias" dans la Spreadsheet.
2. Créez une liste dédiée dans l'app **Google Tasks** (ex. "Jarvis Notes").
3. Exécutez `listTaskLists_` → l'ID apparaît dans **Affichage > Journaux d'exécution**.
4. Collez cet ID dans la propriété de script `NOTES_TASKLIST_ID`.

### 6. Déployer en Web App

Dans l'éditeur Apps Script : **Déployer > Nouveau déploiement** > type **Application Web**.
- Exécuter en tant que : Moi
- Accès : Uniquement moi (ou "Tous", selon votre besoin de test depuis Tasker)

Copiez l'URL du déploiement : c'est l'URL webhook à utiliser dans les actions
**HTTP Request** de Tasker (cf. cahier des charges, section 3.5 — prototype Tasker).

## Pousser ce code sur votre repo GitHub

Ce code a été généré localement (pas d'accès réseau depuis cet environnement).
Pour le publier sur `https://github.com/AurelienB95/Jarvis` :

```bash
cd Jarvis            # dossier contenant ce code
git init
git remote add origin https://github.com/AurelienB95/Jarvis.git
git add .
git commit -m "v1: backend Apps Script (routage, alias, logs, actions Calendar/Tasks/Gmail)"
git branch -M main
git push -u origin main
```

Si le repo distant contient déjà des fichiers (README initial, licence...),
faites d'abord `git pull origin main --allow-unrelated-histories` avant le push.

## Tester sans Tasker (curl)

```bash
# Étape "request"
curl -X POST "<URL_DU_DEPLOIEMENT>" \
  -H "Content-Type: application/json" \
  -d '{"step":"request","input":"crée un rappel demain 10h pour appeler le comptable"}'

# Étape "confirm" (avec le session_id renvoyé ci-dessus)
curl -X POST "<URL_DU_DEPLOIEMENT>" \
  -H "Content-Type: application/json" \
  -d '{"step":"confirm","session_id":"<SESSION_ID>","confirmation":"oui"}'
```

## État d'avancement (v1)

| Fonctionnalité | Statut |
|---|---|
| Alias dictionary | ✅ Implémenté |
| Routage explicite Gemini/Claude | ✅ Implémenté |
| Boucle de confirmation (Human-in-the-Loop) | ✅ Implémenté (session courte via CacheService) |
| Logs Google Sheets | ✅ Implémenté |
| CreateEvent (Calendar) | ✅ Implémenté |
| CreateNote (Google Tasks) | ✅ Implémenté |
| SummarizeEmail (Gmail) | ⚠️ v1 basique (liste des sujets, pas de vrai résumé Claude) |
| SendSMS / Call | ✅ Backend prêt (retourne `tasker_action`) — **côté Tasker, l'action d'exécution reste à créer** (cf. Phase 1 du plan d'action, prototype Tasker) |
| Prototype Tasker complet | ❌ À faire (config manuelle dans l'app Tasker, cf. cahier des charges section 3.5) |
| V2 (module C#) | ❌ Non démarré |

## Prochaines étapes suggérées

Se référer à la section **"6. Plan d'action pas à pas"** du cahier des charges :
Phase 1 (prototype Tasker) peut maintenant être branchée sur ce backend réel
au lieu d'un endpoint de test (webhook.site).
