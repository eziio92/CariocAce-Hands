# CariocAce Copilot : instructions pour Claude

Appli de poker personnelle (PWA, installée sur l'écran d'accueil de l'iPhone de l'auteur), publiée sur GitHub Pages :
https://eziio92.github.io/CariocAce-Hands/

Deux blocs :
- **Mains** : saisie d'une main à clics sur l'écran Saisir (barre Tournoi, table, panneau Sièges / Action / Résultat / Détails, fenêtre Bilan), revue après GTO Wizard (verdict bon / mauvais), export texte, bouton « Faire deviner » vers CariocAce Replay.
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
- **Mobile d'abord** : iPhone en plein écran, zones de toucher de 44 px au moins, marges `safe-area`. Sur ordinateur, l'appli ouvre la revue (deux colonnes) ; Saisir y est aussi en deux colonnes.
- **CariocAce Replay** est un autre dépôt (`eziio92/CariocAceReplay`) : ne pas y toucher depuis ici. Le lien « Faire deviner » (`…/CariocAceReplay/#new=…`, sans tags, note ni commentaire) doit rester lisible par Replay.
- **`sw.js`** : changer le nom du cache `V` (`cah-v2` → `cah-v3`…) seulement si la liste `CORE` ou la façon de mettre en cache change.

## Écran Saisir (choix de l'auteur, 25 nov. 2026)

- **Barre « Tournoi »** au-dessus de la table : le nom se tape en premier, sans être obligatoire. Suggestions : tournois du Suivi (celui en cours d'abord), puis noms déjà utilisés. Le nom n'est plus dans Détails ni répété dans l'en-tête.
- **Fenêtre Bilan** : s'ouvre sur « Résultat » et toute seule quand la main se termine. Ordre : résultat, cartes vues, phase, tags, note, verdict, commentaire, puis « Enregistrer la main ». **Détails** garde seulement date, ante, photos, historique et outils : rien en double.
- **Table** (d'après le modèle de l'auteur) : un stade d'environ 3 de large pour 2 de haut, rail graphite poli (plus clair en haut, liseré brillant tout autour, reflet), rainure sombre, filet fin, tapis. Pas d'ovale lumineux. Elle tourne au doigt avant le choix de la place ; les sièges glissent sur son bord.
- **Sièges** : ronds, posés sur le bord. Libre : graphite. Adversaire : anneau platine. Hero : blanc nacré. Étiquette sous le siège : la dernière action en 13 pt gras blanc (elle doit se voir d'un coup d'œil), le stack à côté en gris. Celle de Hero est à côté de son siège ; celles des sièges tout à gauche ou à droite vont vers l'intérieur pour rester dans l'écran.
- **Téléphone** : la table aussi grande que possible (toute la largeur, sièges des côtés jusque dans la marge), le board gros (cartes de base 46 × 64), les cartes de Hero juste au-dessus de son siège, le pot sous le board. Les réglages propres au téléphone passent par `.tbl.ph`.
- **Ordinateur** (1000 px et plus, `body.wide-ed`) : en-tête sur une ligne, table à gauche sur toute la hauteur, panneau à droite ; sièges et cartes grandissent avec la table. L'auteur le trouve parfait : ne pas le changer sans qu'il le demande.

## Façon de travailler (choisie par l'auteur le 25 nov. 2026)

1. **Une branche par évolution**, partie de `main` à jour : `git switch main && git pull && git switch -c <sujet-court>`. Jamais de commit ni de push direct sur `main`.
2. **Tester en local avant de proposer** : serveur `copilot` de `.claude/launch.json` (`python3 -m http.server 8000` à la racine), http://localhost:8000/ au format de l'iPhone de l'auteur (voir ci-dessous) puis bureau (1440 × 900). Pas d'erreur dans la console ; vérifier la fonction modifiée, et qu'une main et un tournoi s'enregistrent, se rouvrent et survivent à un rechargement. Les données de `localhost` sont séparées de celles du téléphone (autre origine) : on peut tout casser en test.
   - Les événements focus / blur ne partent pas tant que la fenêtre de test n'a pas le focus (`document.hasFocus()` faux) : les tester avec de vrais clics, pas en JavaScript.
   - Une main neuve contient toujours un adversaire sans siège (`V1`) : c'est normal.
   - **L'iPhone de l'auteur** : iPhone 16 Pro Max (écran 440 × 956 pt), appli installée sur l'écran d'accueil. Elle ne reçoit qu'une page de 894 pt de haut (62 pt de moins que l'écran), alors que les marges `safe-area` valent toujours 62 en haut et 34 en bas. Tester les mises en page du téléphone à 440 × 894, hauteur d'écran 956, marges 62 / 34. Tester à 375 × 812 ou à 956 pt pleins a déjà caché une table bien trop petite sur le vrai téléphone.
   - Pour des rendus nets à ce format : Chrome sans interface piloté par le protocole DevTools (`Emulation.setDeviceMetricsOverride` avec `screenHeight`, `Emulation.setSafeAreaInsetsOverride`, `Page.captureScreenshot`), et comparer côte à côte avec les captures de l'auteur.
3. **Tester sur l'iPhone avant la fusion** quand le toucher compte (glisser, clavier, geste retour) : même Wi-Fi, Safari sur `http://<adresse du Mac>:8000/` (`ipconfig getifaddr en0`). Données séparées de la vraie appli. Ce test passe par Safari, pas par l'appli installée : il ne montre pas sa page plus courte.
4. **Commits en français**, au format `Zone : ce qui change` (zones habituelles : Saisir, Suivi, Mains, Revue, Navigation, Icône).
5. **Push de la branche puis pull request vers `main`**. L'auteur relit et fusionne, ou demande à Claude de fusionner (`gh pr merge --rebase --delete-branch` : historique linéaire). **La fusion dans `main` met en ligne** (GitHub Pages, 1 à 2 minutes ; l'appli prend la nouvelle version à la réouverture suivante). Après une fusion : suivre le déploiement (`gh run watch`) puis vérifier que la page en ligne est bien la nouvelle.
