# montpellier-activity-index

Petit service Flask, déployé sur Render (`gunicorn app:app`).

## Routes

| Route | Contenu |
|---|---|
| `/` | Indice d'activité du centre-ville de Montpellier |
| `/poids-bebe/` | Chez nous — tâches du foyer, soins et poids de Sacha |

## Chez nous

Application autonome, dans [`docs/`](docs/) : aucune dépendance, aucun serveur,
aucune base de données. C'est l'app du foyer — ce qu'il y a à faire pour Sacha,
ce qu'il y a à faire pour le logement, et qui l'a fait.

**Deux onglets**

`Sacha` et `Maison`. Chacun a ses tâches et son historique ; le poids et la
courbe OMS n'existent que côté Sacha. Un badge sur l'onglet compte ce qui est en
retard, visible depuis l'autre onglet.

**Qui tient le carnet**

À la première ouverture l'app demande qui utilise l'appareil — Fleur ou Raph — et
chaque geste noté ensuite porte ce prénom. Le choix est ensuite verrouillé : le
haut de l'écran affiche le prénom en clair, pas deux boutons qu'un pouce
échange par mégarde. Un appareil appartient à quelqu'un. « Changer » et une
confirmation ramènent la question, pour un téléphone qui change de mains. Les
enregistrements gardent le nom qui était actif au moment du geste.

**Tâches**

- une liste que l'on complète, dans chaque onglet : Couche, Vitamines, Bain côté
  Sacha ; Entretien de la machine à café côté Maison ;
- une tâche se note en un geste ; celles qui ont des variantes — la couche : pipi,
  caca, les deux — demandent laquelle avant d'enregistrer ;
- fréquence de deux natures : « N fois par jour », qui affiche le compte du jour,
  ou « toutes les X heures », de 3 heures à 6 mois, qui affiche l'échéance ;
- « Première fois le » repousse l'entrée en service d'une tâche à une date :
  la révision d'un an, le rappel qu'on se met pour dans trois mois. Tant que le
  jour n'est pas venu elle attend — ni « jamais faite », ni en retard, et aucun
  badge. Le jour venu elle réclame comme les autres, et le premier geste noté
  périme la date : la fréquence prend le relais. Sans fréquence, la date vaut
  rappel unique ;
- « Noter après coup » rattrape un oubli à sa vraie date : le bain d'hier se note
  aujourd'hui, à hier soir, et vient se ranger au bon endroit de l'historique ;
- une tâche en retard dit **de combien** et allume le badge de son onglet ; une
  tâche déjà faite dans son rythme demande confirmation avant un doublon.

**Stocks** (onglet Maison)

- deux catégories, Nettoyage et Alimentaire, avec quelques articles pour démarrer ;
- trois états — en stock, bientôt fini, à racheter — que l'on fait tourner d'un
  seul appui, comme le reste de l'app ;
- l'article retient qui a signalé le changement et quand, sans encombrer
  l'historique des soins, qui reste consacré aux gestes ;
- ce qui est à racheter compte dans le badge de l'onglet Maison : un placard vide
  demande autant d'attention qu'une tâche en retard.

**Liste de courses** (onglet Maison)

Rien à saisir : la liste est ce que les stocks disent déjà. Tout ce qui n'est
pas « en stock » y figure, groupé par catégorie comme les rayons du magasin, ce
qui manque avant ce qui va manquer. Cocher un article au retour des courses le
remet en stock — la liste se vide d'elle-même et le placard est à jour sans
second geste.

La liste s'écrit aussi en toutes lettres, dans une zone de texte sous les
articles : un appui la sélectionne entièrement, « Copier la liste » la met dans
le presse-papier, et « Partager » n'apparaît que si le téléphone sait partager.
Le texte reste à l'écran même quand le presse-papier est refusé — navigation
privée, page dans un cadre, permission niée : il y a toujours quelque chose à
prendre à la main.

**Noisettes** (onglet Maison)

Un minuteur pour la torréfaction, qui apprend au lieu de deviner.

- on donne le poids, on choisit machine chaude ou machine froide, et l'app
  propose un temps ;
- ce temps vient des cuissons déjà mesurées : secondes par gramme d'après les
  cuissons à chaud, plus le supplément constaté quand la machine part froide.
  Tant qu'aucune mesure n'existe, l'app le dit au lieu d'inventer un chiffre ;
- le minuteur compte vers le haut : il sonne au temps visé, mais continue, si
  bien qu'on enregistre le temps réellement mis, pas celui qu'on visait ;
- la sonnerie est un son, une vibration, et surtout un écran qui vire au rouge
  et affiche « C'est prêt » — un son coupé ne doit pas laisser brûler ;
- le temps se lit sur l'horloge, pas sur un compteur : une cuisson lancée
  survit à l'app fermée ou au téléphone verrouillé ;
- le temps visé se corrige à la main quand on sait mieux, et chaque mesure est
  signée, datée, supprimable.

**Qui a fait quoi**

Un historique par onglet, du plus récent au plus ancien : la tâche, sa variante,
le prénom, l'heure. Filtrable par tâche, chaque ligne supprimable.

**Poids de Sacha**

- pesées en kg ou en g, à partir de la date et du poids de naissance ;
- courbe comparée aux standards OMS (poids-pour-âge, 0–24 mois), zones P3–P97 et P15–P85 ;
- prise depuis la naissance et depuis la dernière pesée, rythme en g/jour face au
  repère de l'âge, percentile estimé ;
- historique signé, export/import des données en JSON.

### Partage entre les deux téléphones

Sans configuration, chaque appareil garde son propre carnet et l'app le dit.
Pour que Fleur et Raph voient la même chose :

1. créer un projet Supabase, puis y coller [`docs/supabase.sql`](docs/supabase.sql)
   dans *SQL Editor* — deux tables et leurs règles d'accès ;
2. reporter *Project URL* et la clé *anon public* dans
   [`docs/config.js`](docs/config.js).

Le partage repose sur deux stockages, choisis pour la façon dont ils se heurtent.
`chez_nous_state` tient un document par foyer — bébé, pesées, tâches — qui change
rarement, où le dernier qui écrit gagne. `chez_nous_events` reçoit une ligne par
geste, jamais modifiée : deux téléphones qui notent à la même seconde ne se
marchent pas dessus, chaque ligne portant son identifiant.

Tout est aussi gardé en local : l'app s'ouvre instantanément, fonctionne sans
réseau, et ce qui a été noté hors ligne part dès le retour du réseau. Le compte
des gestes en attente s'affiche dans « Réglages et données ».

La clé *anon public* voyage dans la page : la protection du carnet tient donc au
secret de son adresse. Pour verrouiller réellement, il faudrait Supabase Auth et
une vraie connexion.

Le prénom actif reste local à chaque appareil : c'est une propriété du téléphone,
pas du carnet.

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
