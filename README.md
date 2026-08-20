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

**Qui tient le carnet**

Un seul bébé, suivi à deux. À la première ouverture l'app demande qui utilise
l'appareil — Fleur ou Raph — et chaque geste noté ensuite porte ce prénom :
on sait qui a pesé, qui a changé la couche, qui a donné les vitamines. Le choix
est retenu sur l'appareil, sous sa propre clé, et se change en un geste depuis
le haut de l'écran. Les enregistrements gardent le nom qui était actif au moment
où ils ont été faits.

**Soins**

- une liste de tâches, pas des cartes figées : Couche, Vitamines et Bain sont fournies, on en ajoute autant qu'on veut (biberon, sieste, médicament…) ;
- une tâche se note en un geste ; celles qui ont des variantes — la couche : pipi, caca, les deux — demandent laquelle avant d'enregistrer ;
- chaque tâche peut recevoir une fréquence, de deux natures : « N fois par jour », qui affiche le compte du jour, ou « toutes les X heures », qui affiche l'échéance ;
- une tâche déjà faite dans son rythme demande confirmation avant un doublon, en rappelant l'heure et l'auteur du précédent ;
- la fréquence se change et la tâche se supprime depuis « Gérer les tâches ».

**Qui a fait quoi**

Un historique unique, du plus récent au plus ancien : la tâche, sa variante, le
prénom de qui l'a faite et l'heure. Filtrable par tâche, chaque ligne supprimable.

**Poids**

- saisie des pesées en kg ou en g, à partir du profil du bébé (prénom, sexe, date et poids de naissance) ;
- courbe de poids comparée aux standards de croissance de l'OMS (poids-pour-âge, 0–24 mois) avec les zones P3–P97 et P15–P85 ;
- prise depuis la naissance, depuis la dernière pesée, rythme en g/jour avec le repère attendu pour l'âge, et percentile estimé ;
- historique modifiable et signé, export/import des données en JSON.

Les données sont stockées dans le `localStorage` du navigateur : rien ne transite
par le serveur. Si le navigateur refuse le stockage (navigation privée), l'app le
dit au lieu de perdre les pesées en silence.

### Installation sur l'écran d'accueil

L'app est une PWA : manifeste, icônes et service worker (`docs/sw.js`) qui met en
cache la coquille, ce qui la rend utilisable sans réseau une fois installée.

L'icône n'apparaît sur l'écran d'accueil que si l'app est servie depuis son
propre domaine. Hébergée dans le cadre d'un autre site, c'est l'icône du site
hôte qui est retenue.

**Déploiement Vercel.** Le dossier `docs/` est un site statique complet. Sur
Vercel : *Add New → Project*, choisir ce dépôt, régler **Root Directory** sur
`docs`, déployer. Aucune commande de build. `docs/vercel.json` empêche la mise en
cache du service worker et du manifeste, sinon une version installée resterait
figée. Les poussées suivantes sur la branche de production se déploient seules.

**GitHub Pages, en variante.** *Settings → Pages → Deploy from a branch*, branche
`main`, dossier `/docs`. Le workflow [`pages.yml`](.github/workflows/pages.yml)
tente aussi l'activation automatique, mais le jeton d'Actions n'a pas toujours le
droit de créer le site.

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
