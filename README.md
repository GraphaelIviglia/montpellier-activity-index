# montpellier-activity-index

Petit service Flask, déployé sur Render (`gunicorn app:app`).

## Routes

| Route | Contenu |
|---|---|
| `/` | Indice d'activité du centre-ville de Montpellier |
| `/poids-bebe` | Carnet de poids — suivi du poids d'un bébé |

## Carnet de poids (`/poids-bebe`)

Page autonome, dans un seul fichier : [`poids-bebe.html`](poids-bebe.html).
Elle s'ouvre aussi bien directement depuis le disque que servie par Flask.

- saisie des pesées (kg ou g) à partir du profil du bébé (prénom, sexe, date et poids de naissance) ;
- courbe de poids comparée aux standards de croissance de l'OMS (poids-pour-âge, 0–24 mois) avec les zones P3–P97 et P15–P85 ;
- prise depuis la naissance, depuis la dernière pesée, rythme en g/jour avec le repère attendu pour l'âge, et percentile estimé ;
- historique modifiable, export/import des données en JSON.

Les données sont stockées dans le `localStorage` du navigateur : rien ne transite
par le serveur, et il n'y a aucune base de données à administrer.

Les courbes OMS sont arrondies à 100 g et le percentile est une estimation
(interpolation entre P3, P50 et P97) : c'est un repère de suivi, pas un outil de
diagnostic.
