# Terra Nova

Portail citoyen React pour centraliser les rubriques de services, les demandes, les actualites et les signalements de Terra Nova.

Les informations de services, de demandes et d'actualites proviennent uniquement d'une API configuree. Les formulaires de signalement restent desactives tant que son contrat officiel n'est pas disponible.

## Fonctionnalites

- Portail citoyen responsive avec navigation clavier et menu mobile.
- Consultation des donnees d'API pour les services, les demandes et les actualites.
- Recherche et filtres generiques lorsque le format JSON le permet.
- Etats de chargement, d'erreur et de reponse vide.
- Formulaire de signalement preparatoire, sans envoi ni stockage de donnees.
- Espace habitant avec inscription et connexion de démonstration, pages privées, profil, demandes isolées par identité temporaire et notifications locales.
- Etats preparatoires pour les alertes, la meteo et la distribution d'eau, sans donnees fictives.
- Assistant Nova en mode demonstration, sans IA ni reconnaissance vocale connectee.
- Centre des demandes avec formulaire, recherche, filtres, suivi, réponses et conversations lorsqu'elles sont fournies par l'API.

## Technologies

- React et JavaScript
- Vite
- CSS
- Node.js et npm

## Installation et lancement

Depuis la racine du depot :

```bash
npm install
npm run dev
```

La compilation de production se lance avec `npm run build`. Pour previsualiser le resultat, utilisez `npm run preview`.

## Configuration de l'API

Copiez `web/.env.example` vers `web/.env.local` et renseignez les valeurs uniquement a partir de la documentation officielle :

- `VITE_TERRA_NOVA_API_BASE_URL` : URL de base de l'API.
- `VITE_TERRA_NOVA_SERVICES_PATH` : chemin officiel des services.
- `VITE_TERRA_NOVA_REQUESTS_PATH` : chemin officiel des demandes.
- `VITE_TERRA_NOVA_NEWS_PATH` : chemin officiel des actualites.
- `VITE_TERRA_NOVA_ALERTS_PATH` : chemin officiel des alertes.
- `VITE_TERRA_NOVA_WEATHER_PATH` : chemin officiel des donnees meteo.
- `VITE_TERRA_NOVA_WATER_PATH` : chemin officiel de la distribution d'eau.

Aucun chemin d'API n'est fourni par defaut. Les signalements necessitent egalement une documentation officielle (route, methode, champs et reponse) avant de pouvoir etre envoyes. Ne placez jamais de secret dans une variable `VITE_*` : ces valeurs sont integrees au code client.

Aucune API d'authentification, de profil ou d'IA n'étant documentée, l'inscription, la connexion et le profil sont des simulations uniquement en mémoire, perdues au rechargement. Les mots de passe ne sont ni vérifiés par un serveur, ni conservés ou transmis. Ne saisissez pas de mot de passe réel ni de donnée personnelle réelle. Les protections de routes et la séparation des données de démonstration sont côté client uniquement et ne constituent pas une sécurité : une vraie confidentialité exige une authentification et une autorisation vérifiées par le backend.

Les pages privées `/mon-espace`, `/mes-demandes`, `/mes-demandes/:id`, `/notifications` et `/mon-profil` nécessitent une identité de démonstration pour cette session. Les demandes et notifications de démo sont isolées par identité en mémoire et disparaissent au rechargement. La page publique `/demandes` conserve son formulaire de démonstration distinct. Le chemin de lecture d'API existant n'est pas présenté comme les demandes personnelles d'un habitant, car aucun contrat d'authentification/autorisation et aucun endpoint d'envoi ne sont documentés. Aucun endpoint ni contenu officiel n'est inventé.

## Structure

```text
web/
  src/
    assets/
    components/
    hooks/
    index.css
    pages/
    services/
    utils/
    App.jsx
    main.jsx
  index.html
  package.json
  vite.config.js
```
