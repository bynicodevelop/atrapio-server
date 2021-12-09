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

## Déployer les fonctions

Se positionner à la racine du projet.

```
npm --prefix functions run deploy:functions
```
