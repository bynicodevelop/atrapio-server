# Installation

```
git clone git@github.com:bynicodevelop/atrapio-server.git

cd functions 

npm i
```

Créer un fichier `.firebaserc` à la racine.

Compléter avec l'id projet firebase que vous trouverez dans votre console firebase.

```
{
  "projects": {
    "default": "projectId"
  }
}
```

## Démarrage du serveur

Se positionner à la racine du projet.

```
npm --prefix functions run serve
```

## Charger les jeux de données

Lancer dans le terminal la commande suivante :

```
curl http://localhost:5001/PROJECT-ID/us-central1/setDataSet
```

Ou l'url suivante dans un navigateur : 

```
http://localhost:5001/PROJECT-ID/us-central1/setDataSet
```

## Déployer les fonctions

Se positionner à la racine du projet.

```
npm --prefix functions run deploy:functions
```
