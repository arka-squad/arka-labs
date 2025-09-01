# Wrapper apiFetch

- Recherche `rg "fetch\('/api"` : aucune occurrence hors `lib/http.ts`.
- Tests unitaires assurent l'ajout de l'en-tête Authorization et la redirection 401 vers `/login`.
