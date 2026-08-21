# Consignes pour Claude sur ce dépôt

## Toute action en ligne se délègue à Claude dans Chrome

Le propriétaire ne veut pas exécuter lui-même les manipulations dans un
navigateur : tableau de bord Vercel, console Supabase, réglages GitHub,
hébergeurs, formulaires. **Dès qu'une étape se fait dans un navigateur, ne pas
écrire une marche à suivre destinée à un humain.** Produire à la place un brief
prêt à coller dans Claude dans Chrome, dans un bloc de code, contenant :

- le but en une phrase ;
- les URL exactes à ouvrir ;
- les valeurs exactes à saisir, recopiables telles quelles ;
- ce qu'il ne faut surtout pas toucher ;
- une vérification observable à la fin (« la bannière doit avoir disparu ») ;
- ce qu'il doit rapporter en revenant.

Le faire même quand l'étape paraît triviale, et même quand on demande seulement
une valeur : c'est Claude dans Chrome qui va la chercher.

Ce qui reste à faire soi-même : ce que Claude Code peut faire directement —
écrire du code, committer, pousser, ouvrir et fusionner une pull request.

## Le contexte technique de ce dépôt

`docs/` contient « Chez nous », l'app du foyer : onglets Sacha et Maison,
tâches, stocks, poids, historique de qui a fait quoi. Autonome, sans dépendance.
Déployée sur Vercel, données partagées via Supabase, rappel quotidien par
fonction serveur. Voir [README.md](README.md) pour le détail.

Après toute modification de `docs/`, incrémenter `CACHE` dans `docs/sw.js` :
sans cela une app déjà installée garde son ancienne coquille.

## Ce qui a été appris à ses dépens

Un état négatif doit être visible **à l'écran**, jamais rangé dans un panneau
replié. Trois fois de suite, un problème a été invisible pour cette raison :
stockage refusé par le navigateur, carnet non partagé, liaison serveur perdue.
Une app qui échoue en silence ressemble à une app qui marche.

Deux mécanismes de visibilité coexistaient sur les mêmes boutons : la classe
`hidden`, qui porte le `display: none`, et l'attribut `hidden`. Effacer l'un
laissait l'autre en place, et le bouton restait invisible pour toujours. Un
test vérifiait l'attribut, donc il passait. **Vérifier ce que l'œil voit** —
`isVisible()`, une taille non nulle — jamais l'état d'un attribut.
