# Page personnelle de David Delahaye

Site statique responsive, sans backend. Les contenus ont été consolidés depuis l’ancienne page LIRMM et le dossier d’activités 2026.

## Tester en local

```bash
npm run dev
```

Ouvrir ensuite :

- `http://localhost:5173/` pour la page principale ;
- `http://localhost:5173/museum.html` pour le musée 3D.

Les dépendances doivent avoir été installées au préalable avec `npm install`.

## Construire pour la mise en ligne

```bash
npm run build
```

Le dossier `dist/` contient tous les fichiers à publier. Pour une vérification locale de la version construite :

```bash
npm run preview
```

Le site peut aussi être servi directement par n’importe quel serveur HTTP statique. Les données bibliographiques sont dans `script.js`; les textes et liens sont dans `index.html`.

## Sources

- ancienne page personnelle publique au LIRMM ;
- dossier d’activités daté de juin 2026 ;
- profil DBLP `51/612` pour le contrôle bibliographique ;
- logo CNRS issu du kit officiel CNRS Images.

Le portrait utilisé est la photographie fournie le 20 juillet 2026. Son cadrage est réalisé uniquement en CSS ; l’image n’est pas retouchée par le site.
