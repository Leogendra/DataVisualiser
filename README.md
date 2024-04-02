# Data Visualisation

## Description

Ce projet a pour but de récupérer des données depuis plusieurs applications mobiles, et de les visualiser sous forme de calendrier, de graphique ou de tableau.

Ce dépot contient un extracteur de données en Python, et une interface web en HTML/CSS/JS.

## Fonctionnalités

- Extraction de données depuis l'application [Pixels](https://teovogel.me/pixels/)
- Récupération de données depuis l'application [Loop Habit Tracker](https://loophabits.org/)
- Récupération de données depuis l'application [Tally Counter](https://play.google.com/store/apps/details?id=de.cliff.strichliste)
- Visualisation des données sous forme de calendrier
- Visualisation des données regroupées par semaine ou mois
- Visualisation des données sous forme de graphique ou tableau

## Utilisation

### Extraction des données

Pour extraire les données, lancez le fichier `extract.py` avec Python. Cela va automatiquement créer un dossier `data/` où vous pourrez placer vos fichier **PIXELS-BACKUP-...** (pour Pixels), **counter_export_...** (pour Tally Counter) et **Checkmarks...** (pour Loop Habit Tracker).

De plus, cela va également générer des fichiers **pixels_words.txt** et **merge_words.txt**.

#### pixels_words.txt

Ce fichier contient les mots-clés utilisés pour l'application Pixels. Placez y les mots-clés que vous souhaitez extraire de vos Pixels, en les séparant par des retours à la ligne.
Exemple d'utilisation : 
```txt
Randonnée
Sport
```
Notez que ici, les majuscules et les accents ne sont pas pris en compte dans la recherche des mots-clés. Si vous avez écrit "Randonnée" dans Pixels, vous pouvez le retrouver en cherchant "randonnee", et vice-versa.  

Une fonctionalité permet également de générer des permutations d'une phrase en fonction de mots-clés. Pour cela, séparez par des virugles les mots-clés à permuter, et par des espaces les différents mots.
Exemple d'utilisation : 
```txt
rando,randonnée,balade en,dans-la foret,montagne
```
Ici, cela va générer les 12 permutations suivantes :
- rando en foret
- rando en montagne
- rando dans la foret
- rando dans la montagne
- randonnée en foret
- ...

#### merge_words.txt    

Ce fichier contient les mots-clés utilisés pour grouper ou rennomer des évenements. Placez y les mots-clés que vous souhaitez grouper ou rennomer, en les respectant ce format :
Exemple d'utilisation : 
```txt
Ancien mot-clé:Nouveau mot-clé
Randonnée:randonée;rando;marche;balade en foret
```
Ici, cela va grouper les évenements contenant le mot-clé "randonnée", "rando", "marche" et "balade en foret" sous le label "Randonée". Ici aussi, les mots-clés ne sont pas sensibles à la casse ou aux accents.

Le même système de permutation que dans pixels_words est disponible pour les renommage ou les groupements.
```txt	
Randonnée:rando,randonnée,balade en,dans-la foret,montagne;rando
```
Ici, cela va regroupper les 12 permuttations précédentes, ainsi que le mot-clé "rando" sous le label "Randonée".

### Visualisation des données

Une fois les données extraites, vous pouvez lancer le fichier `index.html` pour visualiser les données. Cochez les mots-clés que vous souhaitez visualiser, et choisissez un type de visualisation entre calendrier, tableau par semaine, graphique, corrélations, etc.

## Demo

Une démo de l'interface web est disponible à l'adresse suivante : [https://data-visualiser.gatienh.fr/](https://data-visualiser.gatienh.fr/).
Notez cependant que l'interface web ne vous permet pas de récupérer les données depuis les applications tierces.