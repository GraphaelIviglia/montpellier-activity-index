# montpellier-activity-index

Petit service Flask, déployé sur Render (`gunicorn app:app`).

## Routes

| Route | Contenu |
|---|---|
| `/` | Indice d'activité du centre-ville de Montpellier |
| `/poids-bebe/` | Carnet de bébé — couches et suivi du poids |

## Carnet de bébé

Application autonome, dans [`docs/`](docs/) : aucune dépendance, aucun serveur,
aucune base de données. Les mêmes fichiers sont servis par Flask sur
`/poids-bebe/` et publiables tels quels par GitHub Pages.

**Couches**

- un bouton par contenu — pipi, caca, les deux — qui note le change à l'heure courante en un seul geste ;
- temps écoulé depuis le dernier change, tenu à jour tant que la page reste ouverte ;
- compte du jour détaillé par contenu, moyenne sur sept jours, et les dix derniers changes ;
- rattrapage d'un change oublié à une autre heure, les heures futures étant refusées.

**Poids**

- saisie des pesées en kg ou en g, à partir du profil du bébé (prénom, sexe, date et poids de naissance) ;
- courbe de poids comparée aux standards de croissance de l'OMS (poids-pour-âge, 0–24 mois) avec les zones P3–P97 et P15–P85 ;
- prise depuis la naissance, depuis la dernière pesée, rythme en g/jour avec le repère attendu pour l'âge, et percentile estimé ;
- historique modifiable, export/import des données en JSON.

Les données sont stockées dans le `localStorage` du navigateur : rien ne transite
par le serveur. Si le navigateur refuse le stockage (navigation privée), l'app le
dit au lieu de perdre les pesées en silence.

### Installation sur l'écran d'accueil

L'app est une PWA : manifeste, icônes et service worker (`docs/sw.js`) qui met en
cache la coquille, ce qui la rend utilisable sans réseau une fois installée.

Deux façons de publier l'URL d'installation :

- **Automatique** — le workflow [`pages.yml`](.github/workflows/pages.yml) publie
  `docs/` à chaque poussée sur `main` et active Pages lui-même au premier passage
  (`configure-pages` avec `enablement: true`).
- **Manuelle** — **Settings → Pages → Deploy from a branch**, en choisissant la
  branche voulue et le dossier `/docs`. Utile pour publier une branche de travail
  sans passer par `main`.

Dans les deux cas l'app est servie à
`https://<compte>.github.io/montpellier-activity-index/` — le chemin du dépôt
compte, la racine du domaine ne renvoie rien.

Le service worker exige HTTPS (ou `localhost`) : sur `file://` la page fonctionne
mais sans mode hors-ligne.

### Notes d'implémentation

- Les champs de poids sont des `input type="text" inputmode="decimal"`, pas des
  `type="number"` : ces derniers rejettent la virgule du clavier français
  (« 4,32 » devient « 432 »), ce qui enregistrait un poids faux sans avertissement.
- Après chaque enregistrement, une confirmation rappelle le poids retenu, pour
  qu'une erreur d'unité se voie immédiatement.
- Les courbes OMS sont arrondies à 100 g et le percentile est une estimation
  (interpolation entre P3, P50 et P97) : c'est un repère de suivi, pas un outil de
  diagnostic.

### Modifier l'app

Tout tient dans `docs/index.html`. Après une modification, incrémenter `CACHE`
dans `docs/sw.js` pour que les installations existantes récupèrent la nouvelle
version.
