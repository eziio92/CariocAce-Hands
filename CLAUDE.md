# CariocAce Copilot : instructions pour Claude

Appli de poker personnelle (PWA, installée sur l'écran d'accueil de l'iPhone de l'auteur), publiée sur GitHub Pages :
https://eziio92.github.io/CariocAce-Hands/

Deux blocs :
- **Mains** : saisie d'une main à clics (table, positions, cartes, actions), revue après GTO Wizard (verdict bon / mauvais), export texte, bouton « Faire deviner » vers CariocAce Replay.
- **Suivi** : tournois live de l'année (montants en R$), séries et étapes, courbe du net, espace Mental, tournoi en cours.

## Fichiers

- `index.html` : toute l'appli. CSS en haut, JS dans une seule fonction anonyme (`(function(){ … })()`), puis GoatCounter et l'enregistrement du service worker. Aucune étape de build, aucune dépendance à installer.
  Le fichier fait plus de 4 000 lignes : repérer les sections avant de lire, avec `grep -n '/\* =====' index.html` (chaque section commence par `/* ===== nom ===== */`), puis lire seulement la plage utile.
- `sw.js` : service worker (hors ligne). La page : réseau d'abord, 3,5 s au plus, sinon la copie gardée. Les autres fichiers : copie gardée d'abord, mise à jour en arrière-plan.
- `manifest.webmanifest`, `icon-180/192/512.png` : installation sur l'écran d'accueil.
- `LICENSE` : tous droits réservés. Ne pas la changer.

## Règles fixes

- **Un seul fichier `index.html`** (choix de l'auteur, 25 nov. 2026). Ne pas découper en fichiers CSS ou JS séparés : le service worker sert ces fichiers depuis sa copie gardée, le téléphone mélangerait la nouvelle page et l'ancien code.
- **Ne pas renommer le dépôt** `CariocAce-Hands` (l'appli s'appelle CariocAce Copilot, le dépôt a gardé son ancien nom) : l'adresse GitHub Pages changerait et l'appli installée sur le téléphone ne s'ouvrirait plus.
- **Les données de l'auteur vivent sur son téléphone**, pas sur un serveur : `localStorage` de l'origine `eziio92.github.io`, photos dans IndexedDB (`carnet-photos`). Clés :
  `carnet-mains-local` (mains), `carnet-tournois-local` (tournois), `carnet-mains-brouillon`, `carnet-tournoi-brouillons`, `carnet-derniere-sauvegarde`, `carnet-sauvegarde-n`, `carnet-claude-key`, `carnet-claude-use`.
  - Ne jamais renommer une clé ni changer le format de ce qui y est rangé sans une reprise qui relit l'ancien format. Une mise à jour ne doit jamais faire perdre une main ou un tournoi.
  - Les autres applis de l'auteur (CariocAce Replay, Caixa-Salva) partagent la même origine : le préfixe `carnet-` est réservé à cette appli.
  - La sauvegarde `.json` (`{ app: 'cariocace-copilot', version: 2, hands, tournaments }`) doit rester importable, y compris les anciennes. Les photos et la clé API n'y vont jamais.
- **Clé API Claude** (lecture du board sur photo) : saisie par l'auteur, gardée sur l'appareil seulement. Jamais dans une main, un brouillon, la sauvegarde ni un commit. Modèle : `AI_MODEL` dans `index.html`.
- **Deux modes de stockage** : dans Claude (`window.claude` présent), les mains vont dans la base du compte ; ailleurs (GitHub Pages), dans le `localStorage`. Garder les deux chemins.
- **Langue** : interface en français, termes de poker en anglais (fold, check, call, bet, raise, all-in, flop, turn, river). « Passer au flop », « Passer à la turn / river ».
- **Look** : noir et platine, effet verre dépoli. Couleurs et polices uniquement par les variables de `:root` (polices Sora et Instrument Sans). Pas d'or, pas de serif. Vert, orange, rouge seulement pour les états (`--ok`, `--warn`, `--bad`).
- **Mobile d'abord** : iPhone en plein écran, zones de toucher de 44 px au moins, marges `safe-area`. Sur ordinateur, l'appli ouvre la revue (deux colonnes).
- **CariocAce Replay** est un autre dépôt (`eziio92/CariocAceReplay`) : ne pas y toucher depuis ici. Le lien « Faire deviner » (`…/CariocAceReplay/#new=…`, sans tags, note ni commentaire) doit rester lisible par Replay.
- **`sw.js`** : changer le nom du cache `V` (`cah-v2` → `cah-v3`…) seulement si la liste `CORE` ou la façon de mettre en cache change.

## Façon de travailler (choisie par l'auteur le 25 nov. 2026)

1. **Une branche par évolution**, partie de `main` à jour : `git switch main && git pull && git switch -c <sujet-court>`. Jamais de commit ni de push direct sur `main`.
2. **Tester en local avant de proposer** : serveur `python3 -m http.server 8000` à la racine (config `copilot` de `.claude/launch.json` si elle existe), http://localhost:8000/ en format mobile (375 × 812) puis bureau. Pas d'erreur dans la console ; vérifier la fonction modifiée, et qu'une main et un tournoi s'enregistrent, se rouvrent et survivent à un rechargement. Les données de `localhost` sont séparées de celles du téléphone (autre origine) : on peut tout casser en test.
   - Les événements focus / blur ne partent pas tant que la fenêtre de test n'a pas le focus (`document.hasFocus()` faux) : les tester avec de vrais clics, pas en JavaScript.
   - Une main neuve contient toujours un adversaire sans siège (`V1`) : c'est normal.
3. **Tester sur l'iPhone avant la fusion** quand le toucher compte (glisser, clavier, geste retour) : même Wi-Fi, Safari sur `http://<adresse du Mac>:8000/` (`ipconfig getifaddr en0`). Données séparées de la vraie appli.
4. **Commits en français**, au format `Zone : ce qui change` (zones habituelles : Saisir, Suivi, Mains, Revue, Navigation, Icône).
5. **Push de la branche puis pull request vers `main`**. L'auteur relit et fusionne, ou demande à Claude de fusionner (`gh pr merge --rebase --delete-branch` : historique linéaire). **La fusion dans `main` met en ligne** (GitHub Pages, 1 à 2 minutes ; l'appli prend la nouvelle version à la réouverture suivante). Après une fusion : suivre le déploiement (`gh run watch`) puis vérifier que la page en ligne est bien la nouvelle.
